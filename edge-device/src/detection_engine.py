"""
Detection Engine for AgriShield AI System

This module implements the core wildlife detection functionality using TensorFlow Lite
for real-time species classification from camera frames.
"""

import time
import logging
from dataclasses import dataclass
from typing import Tuple, Optional
from pathlib import Path
import threading
import queue

import numpy as np
import cv2

try:
    import tflite_runtime.interpreter as tflite
except ImportError:
    import tensorflow.lite as tflite

try:
    import pyaudio
    import wave
    AUDIO_AVAILABLE = True
except ImportError:
    AUDIO_AVAILABLE = False
    logging.warning("PyAudio not available - audio capture disabled")

logger = logging.getLogger(__name__)


@dataclass
class Detection:
    """Represents a wildlife detection result"""
    species: str
    confidence: float
    bounding_box: Tuple[int, int, int, int]  # (x, y, width, height)
    timestamp: int


class DetectionEngine:
    """
    Wildlife detection engine using TensorFlow Lite for species classification.
    
    Processes video frames from camera, runs ML inference, and captures evidence
    (still images and audio) for valid detections.
    """
    
    # Valid species classifications
    VALID_SPECIES = ["Elephant", "Boar", "Deer", "Leopard", "Human", "Unknown"]
    
    def __init__(
        self,
        model_path: str,
        confidence_threshold: float = 0.7,
        frame_rate: int = 15,
        resolution: Tuple[int, int] = (640, 480),
        input_size: Tuple[int, int] = (224, 224)
    ):
        """
        Initialize the detection engine.
        
        Args:
            model_path: Path to TensorFlow Lite model file
            confidence_threshold: Minimum confidence for valid detection (default: 0.7)
            frame_rate: Frames per second to process (default: 15)
            resolution: Camera resolution as (width, height) (default: 640x480)
            input_size: ML model input size as (width, height) (default: 224x224)
        
        Raises:
            FileNotFoundError: If model file doesn't exist
            RuntimeError: If model fails to load
        """
        self.model_path = Path(model_path)
        self.confidence_threshold = confidence_threshold
        self.frame_rate = frame_rate
        self.resolution = resolution
        self.input_size = input_size
        
        # Validate model file exists
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        # Initialize TensorFlow Lite interpreter
        try:
            self.interpreter = tflite.Interpreter(model_path=str(self.model_path))
            self.interpreter.allocate_tensors()
            
            # Get input and output tensor details
            self.input_details = self.interpreter.get_input_details()
            self.output_details = self.interpreter.get_output_details()
            
            logger.info(f"Loaded TensorFlow Lite model from {model_path}")
            logger.info(f"Input shape: {self.input_details[0]['shape']}")
            logger.info(f"Output shape: {self.output_details[0]['shape']}")
            
        except Exception as e:
            logger.error(f"Failed to load TensorFlow Lite model: {e}")
            raise RuntimeError(f"Failed to load model: {e}")
        
        # Initialize camera (will be set by external camera manager)
        self.camera = None
        self._camera_lock = threading.Lock()
        
        # Track last captured evidence
        self.last_evidence_capture_time = 0
        
        # Audio recording settings
        self.audio_sample_rate = 16000  # 16kHz as per design
        self.audio_channels = 1  # Mono
        self.audio_chunk_size = 1024
        self.audio_duration = 5  # 5 seconds as per requirements
        
        logger.info(
            f"Detection engine initialized: threshold={confidence_threshold}, "
            f"frame_rate={frame_rate}, resolution={resolution}, input_size={input_size}"
        )
    
    def _preprocess_frame(self, frame: np.ndarray) -> np.ndarray:
        """
        Preprocess frame for ML inference.
        
        Steps:
        1. Resize to model input size (224x224)
        2. Normalize pixel values to [0, 1]
        3. Add batch dimension
        
        Args:
            frame: Input frame as numpy array (H, W, 3) in BGR format
        
        Returns:
            Preprocessed frame ready for inference
        """
        # Resize to model input size
        resized = cv2.resize(frame, self.input_size, interpolation=cv2.INTER_AREA)
        
        # Convert BGR to RGB (OpenCV uses BGR by default)
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
        
        # Normalize to [0, 1]
        normalized = rgb.astype(np.float32) / 255.0
        
        # Add batch dimension: (224, 224, 3) -> (1, 224, 224, 3)
        batched = np.expand_dims(normalized, axis=0)
        
        return batched
    
    def initialize_camera(self, camera_index: int = 0) -> bool:
        """
        Initialize camera for frame capture.
        
        Args:
            camera_index: Camera device index (default: 0 for primary camera)
        
        Returns:
            True if camera initialized successfully, False otherwise
        """
        try:
            with self._camera_lock:
                self.camera = cv2.VideoCapture(camera_index)
                
                if not self.camera.isOpened():
                    logger.error(f"Failed to open camera {camera_index}")
                    return False
                
                # Set camera resolution
                self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, self.resolution[0])
                self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, self.resolution[1])
                
                # Set frame rate
                self.camera.set(cv2.CAP_PROP_FPS, self.frame_rate)
                
                logger.info(f"Camera initialized: index={camera_index}, resolution={self.resolution}")
                return True
                
        except Exception as e:
            logger.error(f"Camera initialization failed: {e}", exc_info=True)
            return False
    
    def capture_frame(self) -> Optional[np.ndarray]:
        """
        Capture a single frame from the camera.
        
        Returns:
            Frame as numpy array (H, W, 3) in BGR format, or None if capture fails
        """
        if self.camera is None:
            logger.error("Camera not initialized")
            return None
        
        try:
            with self._camera_lock:
                ret, frame = self.camera.read()
                
                if not ret:
                    logger.error("Failed to capture frame from camera")
                    return None
                
                return frame
                
        except Exception as e:
            logger.error(f"Frame capture failed: {e}", exc_info=True)
            return None
    
    def release_camera(self) -> None:
        """
        Release camera resources.
        """
        try:
            with self._camera_lock:
                if self.camera is not None:
                    self.camera.release()
                    self.camera = None
                    logger.info("Camera released")
        except Exception as e:
            logger.error(f"Failed to release camera: {e}", exc_info=True)
    
    def _parse_model_output(self, output: np.ndarray) -> Tuple[str, float]:
        """
        Parse model output to extract species and confidence.
        
        The model outputs a probability distribution over species classes.
        We take the argmax to get the predicted class and its confidence.
        
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
        # Assumes model outputs in order: Elephant, Boar, Deer, Leopard, Human, Unknown
        if predicted_class_idx < len(self.VALID_SPECIES):
            species = self.VALID_SPECIES[predicted_class_idx]
        else:
            species = "Unknown"
            logger.warning(f"Model output class index {predicted_class_idx} out of range")
        
        return species, confidence
    
    def process_frame(self, frame: np.ndarray) -> Optional[Detection]:
        """
        Process a single video frame and perform species detection.
        
        This method:
        1. Preprocesses the frame (resize, normalize)
        2. Runs TensorFlow Lite inference
        3. Parses output to extract species and confidence
        4. Returns Detection object if confidence exceeds threshold
        
        Args:
            frame: Input frame as numpy array (H, W, 3) in BGR format
        
        Returns:
            Detection object if valid detection found, None otherwise
        
        Raises:
            RuntimeError: If inference fails
        """
        start_time = time.time()
        
        try:
            # Preprocess frame
            preprocessed = self._preprocess_frame(frame)
            
            # Set input tensor
            self.interpreter.set_tensor(self.input_details[0]['index'], preprocessed)
            
            # Run inference
            self.interpreter.invoke()
            
            # Get output tensor
            output = self.interpreter.get_tensor(self.output_details[0]['index'])
            
            # Parse output
            species, confidence = self._parse_model_output(output)
            
            # Calculate processing time
            processing_time_ms = (time.time() - start_time) * 1000
            
            # Log detection
            logger.debug(
                f"Detection: species={species}, confidence={confidence:.3f}, "
                f"processing_time={processing_time_ms:.1f}ms"
            )
            
            # Check if processing time exceeds requirement (100ms)
            if processing_time_ms > 100:
                logger.warning(
                    f"Frame processing exceeded 100ms: {processing_time_ms:.1f}ms"
                )
            
            # Create detection object
            # Note: Bounding box is set to full frame since we're doing classification
            # not object detection. For object detection models, this would be extracted
            # from the model output.
            detection = Detection(
                species=species,
                confidence=confidence,
                bounding_box=(0, 0, frame.shape[1], frame.shape[0]),
                timestamp=int(time.time())
            )
            
            # Return detection only if confidence exceeds threshold
            if confidence >= self.confidence_threshold:
                logger.info(
                    f"Valid detection: {species} with confidence {confidence:.3f}"
                )
                return detection
            
            return None
            
        except Exception as e:
            logger.error(f"Frame processing failed: {e}", exc_info=True)
            raise RuntimeError(f"Inference failed: {e}")
    
    def capture_evidence(self, frame: np.ndarray) -> Tuple[bytes, Optional[bytes]]:
        """
        Capture evidence for a valid detection.
        
        This method:
        1. Captures a still image at full camera resolution
        2. Records a 5-second audio clip (if audio capture is available)
        
        Args:
            frame: Current video frame to save as still image
        
        Returns:
            Tuple of (image_bytes, audio_bytes)
            audio_bytes may be None if audio capture is not available
        """
        try:
            # Encode frame as JPEG with quality 85 (as per requirements)
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 85]
            success, image_buffer = cv2.imencode('.jpg', frame, encode_param)
            
            if not success:
                raise RuntimeError("Failed to encode image as JPEG")
            
            image_bytes = image_buffer.tobytes()
            
            logger.info(f"Captured still image: {len(image_bytes)} bytes")
            
            # Capture 5-second audio clip
            audio_bytes = None
            if AUDIO_AVAILABLE:
                try:
                    audio_bytes = self._capture_audio_clip()
                    if audio_bytes:
                        logger.info(f"Captured audio clip: {len(audio_bytes)} bytes")
                except Exception as audio_error:
                    logger.error(f"Audio capture failed: {audio_error}", exc_info=True)
                    # Continue without audio - image is more critical
            else:
                logger.debug("Audio capture not available")
            
            # Update last capture time
            self.last_evidence_capture_time = time.time()
            
            return image_bytes, audio_bytes
            
        except Exception as e:
            logger.error(f"Evidence capture failed: {e}", exc_info=True)
            raise RuntimeError(f"Failed to capture evidence: {e}")
    
    def _capture_audio_clip(self) -> Optional[bytes]:
        """
        Capture a 5-second audio clip from the microphone.
        
        Returns:
            Audio data as WAV file bytes, or None if capture fails
        """
        if not AUDIO_AVAILABLE:
            return None
        
        try:
            # Initialize PyAudio
            audio = pyaudio.PyAudio()
            
            # Open audio stream
            stream = audio.open(
                format=pyaudio.paInt16,
                channels=self.audio_channels,
                rate=self.audio_sample_rate,
                input=True,
                frames_per_buffer=self.audio_chunk_size
            )
            
            logger.debug(f"Recording {self.audio_duration} seconds of audio...")
            
            # Calculate number of chunks to record
            num_chunks = int(self.audio_sample_rate / self.audio_chunk_size * self.audio_duration)
            
            # Record audio chunks
            frames = []
            for _ in range(num_chunks):
                data = stream.read(self.audio_chunk_size, exception_on_overflow=False)
                frames.append(data)
            
            # Stop and close stream
            stream.stop_stream()
            stream.close()
            audio.terminate()
            
            # Convert to WAV format in memory
            import io
            wav_buffer = io.BytesIO()
            
            with wave.open(wav_buffer, 'wb') as wf:
                wf.setnchannels(self.audio_channels)
                wf.setsampwidth(audio.get_sample_size(pyaudio.paInt16))
                wf.setframerate(self.audio_sample_rate)
                wf.writeframes(b''.join(frames))
            
            # Get WAV bytes
            wav_bytes = wav_buffer.getvalue()
            wav_buffer.close()
            
            return wav_bytes
            
        except Exception as e:
            logger.error(f"Audio recording failed: {e}", exc_info=True)
            return None
    
    def is_valid_detection(self, detection: Optional[Detection]) -> bool:
        """
        Check if a detection is valid (confidence above threshold).
        
        Args:
            detection: Detection object to validate
        
        Returns:
            True if detection is valid, False otherwise
        """
        if detection is None:
            return False
        
        return detection.confidence >= self.confidence_threshold
    
    def get_frame_interval(self) -> float:
        """
        Get the time interval between frames based on configured frame rate.
        
        Returns:
            Time interval in seconds
        """
        return 1.0 / self.frame_rate
    
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
        logger.info(f"Updated confidence threshold to {threshold}")
    
    def update_frame_rate(self, frame_rate: int) -> None:
        """
        Update the frame processing rate.
        
        Args:
            frame_rate: New frame rate in frames per second
        
        Raises:
            ValueError: If frame rate is not positive
        """
        if frame_rate <= 0:
            raise ValueError(f"Frame rate must be positive, got {frame_rate}")
        
        self.frame_rate = frame_rate
        logger.info(f"Updated frame rate to {frame_rate} fps")
