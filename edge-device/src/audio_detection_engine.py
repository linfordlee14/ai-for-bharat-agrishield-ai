"""
Audio Detection Engine for AgriShield AI System

This module implements audio-based wildlife detection using TensorFlow Lite
for real-time species classification from animal vocalizations.
"""

import time
import logging
from dataclasses import dataclass
from typing import Optional, Tuple
from pathlib import Path
import threading
import queue
import io
import wave

import numpy as np

try:
    import tflite_runtime.interpreter as tflite
except ImportError:
    import tensorflow.lite as tflite

try:
    import pyaudio
    AUDIO_AVAILABLE = True
except ImportError:
    AUDIO_AVAILABLE = False
    logging.warning("PyAudio not available - audio detection disabled")

logger = logging.getLogger(__name__)


@dataclass
class AudioDetection:
    """Represents an audio-based wildlife detection result"""
    species: str
    confidence: float
    timestamp: int
    audio_data: Optional[bytes] = None


class AudioDetectionEngine:
    """
    Audio-based wildlife detection engine using TensorFlow Lite.
    
    Continuously captures audio at 16kHz, analyzes 1-second windows,
    and classifies animal vocalizations.
    """
    
    # Valid species classifications (same as visual detection)
    VALID_SPECIES = ["Elephant", "Boar", "Deer", "Leopard", "Human", "Unknown"]
    
    def __init__(
        self,
        model_path: str,
        confidence_threshold: float = 0.6,
        sample_rate: int = 16000,
        window_duration: float = 1.0,
        enabled: bool = True
    ):
        """
        Initialize the audio detection engine.
        
        Args:
            model_path: Path to TensorFlow Lite audio model file
            confidence_threshold: Minimum confidence for valid detection (default: 0.6)
            sample_rate: Audio sample rate in Hz (default: 16000)
            window_duration: Analysis window duration in seconds (default: 1.0)
            enabled: Whether audio detection is enabled (default: True)
        
        Raises:
            FileNotFoundError: If model file doesn't exist
            RuntimeError: If model fails to load or audio not available
        """
        self.model_path = Path(model_path)
        self.confidence_threshold = confidence_threshold
        self.sample_rate = sample_rate
        self.window_duration = window_duration
        self.enabled = enabled
        
        # Audio capture settings
        self.channels = 1  # Mono
        self.chunk_size = 1024
        self.format = pyaudio.paInt16 if AUDIO_AVAILABLE else None
        
        # Calculate samples per window
        self.samples_per_window = int(sample_rate * window_duration)
        
        # Audio stream and threading
        self.audio_stream = None
        self.audio_interface = None
        self._capture_thread = None
        self._stop_capture = threading.Event()
        self._audio_queue = queue.Queue(maxsize=10)
        
        # Check if audio is available
        if not AUDIO_AVAILABLE:
            logger.warning("PyAudio not available - audio detection disabled")
            self.enabled = False
            return
        
        if not self.enabled:
            logger.info("Audio detection disabled in configuration")
            return
        
        # Validate model file exists
        if not self.model_path.exists():
            raise FileNotFoundError(f"Audio model file not found: {model_path}")
        
        # Initialize TensorFlow Lite interpreter
        try:
            self.interpreter = tflite.Interpreter(model_path=str(self.model_path))
            self.interpreter.allocate_tensors()
            
            # Get input and output tensor details
            self.input_details = self.interpreter.get_input_details()
            self.output_details = self.interpreter.get_output_details()
            
            logger.info(f"Loaded audio TensorFlow Lite model from {model_path}")
            logger.info(f"Input shape: {self.input_details[0]['shape']}")
            logger.info(f"Output shape: {self.output_details[0]['shape']}")
            
        except Exception as e:
            logger.error(f"Failed to load audio TensorFlow Lite model: {e}")
            raise RuntimeError(f"Failed to load audio model: {e}")
        
        logger.info(
            f"Audio detection engine initialized: threshold={confidence_threshold}, "
            f"sample_rate={sample_rate}Hz, window={window_duration}s"
        )
    
    def start_continuous_capture(self) -> bool:
        """
        Start continuous audio capture in background thread.
        
        Returns:
            True if capture started successfully, False otherwise
        """
        if not self.enabled or not AUDIO_AVAILABLE:
            logger.warning("Audio detection not available")
            return False
        
        if self._capture_thread is not None and self._capture_thread.is_alive():
            logger.warning("Audio capture already running")
            return True
        
        try:
            # Initialize PyAudio
            self.audio_interface = pyaudio.PyAudio()
            
            # Open audio stream
            self.audio_stream = self.audio_interface.open(
                format=self.format,
                channels=self.channels,
                rate=self.sample_rate,
                input=True,
                frames_per_buffer=self.chunk_size,
                stream_callback=self._audio_callback
            )
            
            # Start capture thread
            self._stop_capture.clear()
            self._capture_thread = threading.Thread(
                target=self._capture_loop,
                daemon=True,
                name="AudioCaptureThread"
            )
            self._capture_thread.start()
            
            logger.info("Started continuous audio capture")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start audio capture: {e}", exc_info=True)
            return False
    
    def stop_continuous_capture(self) -> None:
        """
        Stop continuous audio capture.
        """
        if not self.enabled:
            return
        
        try:
            # Signal capture thread to stop
            self._stop_capture.set()
            
            # Wait for thread to finish
            if self._capture_thread is not None:
                self._capture_thread.join(timeout=2.0)
                self._capture_thread = None
            
            # Close audio stream
            if self.audio_stream is not None:
                self.audio_stream.stop_stream()
                self.audio_stream.close()
                self.audio_stream = None
            
            # Terminate PyAudio
            if self.audio_interface is not None:
                self.audio_interface.terminate()
                self.audio_interface = None
            
            logger.info("Stopped continuous audio capture")
            
        except Exception as e:
            logger.error(f"Error stopping audio capture: {e}", exc_info=True)
    
    def _audio_callback(self, in_data, frame_count, time_info, status):
        """
        PyAudio stream callback for continuous audio capture.
        
        Args:
            in_data: Audio data bytes
            frame_count: Number of frames
            time_info: Timing information
            status: Stream status flags
        
        Returns:
            Tuple of (None, pyaudio.paContinue)
        """
        if status:
            logger.warning(f"Audio stream status: {status}")
        
        try:
            # Add audio data to queue (non-blocking)
            self._audio_queue.put_nowait(in_data)
        except queue.Full:
            logger.warning("Audio queue full, dropping frame")
        
        return (None, pyaudio.paContinue)
    
    def _capture_loop(self) -> None:
        """
        Background thread loop for processing audio windows.
        """
        audio_buffer = []
        buffer_samples = 0
        
        logger.info("Audio capture loop started")
        
        while not self._stop_capture.is_set():
            try:
                # Get audio chunk from queue (with timeout)
                chunk = self._audio_queue.get(timeout=0.1)
                
                # Add to buffer
                audio_buffer.append(chunk)
                buffer_samples += len(chunk) // 2  # 2 bytes per sample (int16)
                
                # Process when we have enough samples for a window
                if buffer_samples >= self.samples_per_window:
                    # Combine chunks into single array
                    audio_data = b''.join(audio_buffer)
                    
                    # Process the window
                    detection = self._process_audio_window(audio_data)
                    
                    if detection is not None:
                        logger.info(
                            f"Audio detection: {detection.species} "
                            f"(confidence: {detection.confidence:.3f})"
                        )
                    
                    # Clear buffer for next window
                    audio_buffer = []
                    buffer_samples = 0
                
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Error in audio capture loop: {e}", exc_info=True)
        
        logger.info("Audio capture loop stopped")
    
    def _preprocess_audio(self, audio_data: bytes) -> np.ndarray:
        """
        Preprocess audio data for ML inference.
        
        Steps:
        1. Convert bytes to numpy array
        2. Normalize to [-1, 1]
        3. Reshape for model input
        
        Args:
            audio_data: Raw audio bytes (int16 PCM)
        
        Returns:
            Preprocessed audio array ready for inference
        """
        # Convert bytes to int16 array
        audio_array = np.frombuffer(audio_data, dtype=np.int16)
        
        # Take only the samples we need for one window
        audio_array = audio_array[:self.samples_per_window]
        
        # Normalize to [-1, 1]
        normalized = audio_array.astype(np.float32) / 32768.0
        
        # Reshape for model input (add batch and channel dimensions if needed)
        # Expected shape: (1, samples) or (1, samples, 1) depending on model
        input_shape = self.input_details[0]['shape']
        
        if len(input_shape) == 2:
            # Shape: (batch, samples)
            preprocessed = normalized.reshape(1, -1)
        elif len(input_shape) == 3:
            # Shape: (batch, samples, channels)
            preprocessed = normalized.reshape(1, -1, 1)
        else:
            # Default to 2D
            preprocessed = normalized.reshape(1, -1)
        
        return preprocessed
    
    def _parse_model_output(self, output: np.ndarray) -> Tuple[str, float]:
        """
        Parse model output to extract species and confidence.
        
        Args:
            output: Model output tensor
        
        Returns:
            Tuple of (species_name, confidence_score)
        """
        # Get probabilities (remove batch dimension)
        probabilities = output[0]
        
        # Find class with highest probability
        predicted_class_idx = np.argmax(probabilities)
        confidence = float(probabilities[predicted_class_idx])
        
        # Map class index to species name
        if predicted_class_idx < len(self.VALID_SPECIES):
            species = self.VALID_SPECIES[predicted_class_idx]
        else:
            species = "Unknown"
            logger.warning(f"Audio model output class index {predicted_class_idx} out of range")
        
        return species, confidence
    
    def _process_audio_window(self, audio_data: bytes) -> Optional[AudioDetection]:
        """
        Process a 1-second audio window for species detection.
        
        Args:
            audio_data: Raw audio bytes for one window
        
        Returns:
            AudioDetection object if valid detection found, None otherwise
        """
        try:
            # Preprocess audio
            preprocessed = self._preprocess_audio(audio_data)
            
            # Set input tensor
            self.interpreter.set_tensor(self.input_details[0]['index'], preprocessed)
            
            # Run inference
            self.interpreter.invoke()
            
            # Get output tensor
            output = self.interpreter.get_tensor(self.output_details[0]['index'])
            
            # Parse output
            species, confidence = self._parse_model_output(output)
            
            # Log detection
            logger.debug(
                f"Audio detection: species={species}, confidence={confidence:.3f}"
            )
            
            # Create detection object if confidence exceeds threshold
            if confidence >= self.confidence_threshold:
                detection = AudioDetection(
                    species=species,
                    confidence=confidence,
                    timestamp=int(time.time()),
                    audio_data=audio_data
                )
                return detection
            
            return None
            
        except Exception as e:
            logger.error(f"Audio window processing failed: {e}", exc_info=True)
            return None
    
    def process_audio_window(self, audio_data: np.ndarray) -> Optional[AudioDetection]:
        """
        Process a 1-second audio window (public interface).
        
        Args:
            audio_data: Audio samples as numpy array
        
        Returns:
            AudioDetection object if valid detection found, None otherwise
        """
        if not self.enabled:
            return None
        
        try:
            # Convert numpy array to bytes if needed
            if isinstance(audio_data, np.ndarray):
                audio_bytes = (audio_data * 32768.0).astype(np.int16).tobytes()
            else:
                audio_bytes = audio_data
            
            return self._process_audio_window(audio_bytes)
            
        except Exception as e:
            logger.error(f"Audio processing failed: {e}", exc_info=True)
            return None
    
    def merge_detections(
        self,
        visual_detection,
        audio_detection: AudioDetection,
        time_window: float = 5.0
    ) -> Optional[object]:
        """
        Merge visual and audio detections when they occur within time window.
        
        When both visual and audio detect the same species within 5 seconds,
        merge them into a single detection with higher confidence.
        
        Args:
            visual_detection: Detection object from visual detection engine
            audio_detection: AudioDetection object from audio detection
            time_window: Maximum time difference in seconds (default: 5.0)
        
        Returns:
            Merged detection with higher confidence, or None if no merge
        """
        if visual_detection is None or audio_detection is None:
            return None
        
        # Check if detections are within time window
        time_diff = abs(visual_detection.timestamp - audio_detection.timestamp)
        if time_diff > time_window:
            logger.debug(
                f"Detections outside time window: {time_diff:.1f}s > {time_window}s"
            )
            return None
        
        # Check if species match
        if visual_detection.species != audio_detection.species:
            logger.debug(
                f"Species mismatch: visual={visual_detection.species}, "
                f"audio={audio_detection.species}"
            )
            return None
        
        # Merge confidences (take maximum)
        merged_confidence = max(visual_detection.confidence, audio_detection.confidence)
        
        # Create merged detection (use visual detection as base)
        # Create a new object with the same type as visual_detection
        merged = type(visual_detection)(
            species=visual_detection.species,
            confidence=merged_confidence,
            bounding_box=visual_detection.bounding_box,
            timestamp=visual_detection.timestamp
        )
        
        logger.info(
            f"Merged detections: {merged.species} "
            f"(visual: {visual_detection.confidence:.3f}, "
            f"audio: {audio_detection.confidence:.3f}, "
            f"merged: {merged_confidence:.3f})"
        )
        
        return merged
    
    def capture_audio_clip(self, duration: float = 5.0) -> Optional[bytes]:
        """
        Capture an audio clip of specified duration.
        
        This captures audio before and after a detection event.
        
        Args:
            duration: Duration in seconds (default: 5.0)
        
        Returns:
            Audio data as WAV file bytes, or None if capture fails
        """
        if not self.enabled or not AUDIO_AVAILABLE:
            return None
        
        try:
            # Initialize PyAudio if not already running
            if self.audio_interface is None:
                audio = pyaudio.PyAudio()
            else:
                audio = self.audio_interface
            
            # Open audio stream (if not already open)
            if self.audio_stream is None or not self.audio_stream.is_active():
                stream = audio.open(
                    format=self.format,
                    channels=self.channels,
                    rate=self.sample_rate,
                    input=True,
                    frames_per_buffer=self.chunk_size
                )
            else:
                stream = self.audio_stream
            
            logger.debug(f"Recording {duration} seconds of audio...")
            
            # Calculate number of chunks to record
            num_chunks = int(self.sample_rate / self.chunk_size * duration)
            
            # Record audio chunks
            frames = []
            for _ in range(num_chunks):
                data = stream.read(self.chunk_size, exception_on_overflow=False)
                frames.append(data)
            
            # Close stream if we opened it
            if self.audio_stream is None:
                stream.stop_stream()
                stream.close()
                if self.audio_interface is None:
                    audio.terminate()
            
            # Convert to WAV format in memory
            wav_buffer = io.BytesIO()
            
            with wave.open(wav_buffer, 'wb') as wf:
                wf.setnchannels(self.channels)
                wf.setsampwidth(audio.get_sample_size(self.format))
                wf.setframerate(self.sample_rate)
                wf.writeframes(b''.join(frames))
            
            # Get WAV bytes
            wav_bytes = wav_buffer.getvalue()
            wav_buffer.close()
            
            logger.info(f"Captured audio clip: {len(wav_bytes)} bytes")
            return wav_bytes
            
        except Exception as e:
            logger.error(f"Audio clip capture failed: {e}", exc_info=True)
            return None
    
    def update_confidence_threshold(self, threshold: float) -> None:
        """
        Update the confidence threshold for valid detections.
        
        Args:
            threshold: New confidence threshold (0.0 to 1.0)
        
        Raises:
            ValueError: If threshold is not in valid range
        """
        if not 0.0 <= threshold <= 1.0:
            raise ValueError(f"Threshold must be in [0.0, 1.0], got {threshold}")
        
        self.confidence_threshold = threshold
        logger.info(f"Updated audio confidence threshold to {threshold}")
    
    def is_enabled(self) -> bool:
        """
        Check if audio detection is enabled.
        
        Returns:
            True if enabled, False otherwise
        """
        return self.enabled and AUDIO_AVAILABLE
