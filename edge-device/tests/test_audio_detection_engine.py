"""
Tests for Audio Detection Engine

This module contains unit tests for the audio-based wildlife detection engine.
"""

import pytest
import numpy as np
import time
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
import sys

# Mock TensorFlow Lite and OpenCV before importing
sys.modules['tflite_runtime'] = MagicMock()
sys.modules['tflite_runtime.interpreter'] = MagicMock()
sys.modules['tensorflow'] = MagicMock()
sys.modules['tensorflow.lite'] = MagicMock()
sys.modules['pyaudio'] = MagicMock()
sys.modules['cv2'] = MagicMock()
sys.modules['wave'] = MagicMock()

# Import the module under test
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from audio_detection_engine import AudioDetectionEngine, AudioDetection


@pytest.fixture
def mock_audio_model(tmp_path):
    """Create a mock TensorFlow Lite model file"""
    model_path = tmp_path / "audio_model.tflite"
    model_path.write_bytes(b"mock_model_data")
    return str(model_path)


@pytest.fixture
def mock_tflite_interpreter():
    """Mock TensorFlow Lite interpreter"""
    with patch('audio_detection_engine.tflite.Interpreter') as mock_interp:
        # Create mock interpreter instance
        interpreter = MagicMock()
        
        # Mock input/output details
        interpreter.get_input_details.return_value = [
            {'index': 0, 'shape': [1, 16000]}
        ]
        interpreter.get_output_details.return_value = [
            {'index': 0, 'shape': [1, 6]}
        ]
        
        # Mock output tensor (probabilities for 6 species)
        # Set Unknown (index 5) to 0.65 to exceed 0.6 threshold
        mock_output = np.array([[0.1, 0.15, 0.05, 0.05, 0.05, 0.65]])
        interpreter.get_tensor.return_value = mock_output
        
        mock_interp.return_value = interpreter
        yield mock_interp


@pytest.fixture
def audio_engine(mock_audio_model, mock_tflite_interpreter):
    """Create an AudioDetectionEngine instance with mocked dependencies"""
    with patch('audio_detection_engine.AUDIO_AVAILABLE', True):
        engine = AudioDetectionEngine(
            model_path=mock_audio_model,
            confidence_threshold=0.6,
            sample_rate=16000,
            window_duration=1.0,
            enabled=True
        )
        return engine


class TestAudioDetectionEngineInitialization:
    """Test audio detection engine initialization"""
    
    def test_initialization_success(self, mock_audio_model, mock_tflite_interpreter):
        """Test successful initialization"""
        with patch('audio_detection_engine.AUDIO_AVAILABLE', True):
            engine = AudioDetectionEngine(
                model_path=mock_audio_model,
                confidence_threshold=0.6,
                sample_rate=16000,
                window_duration=1.0
            )
            
            assert engine.confidence_threshold == 0.6
            assert engine.sample_rate == 16000
            assert engine.window_duration == 1.0
            assert engine.samples_per_window == 16000
            assert engine.enabled is True
    
    def test_initialization_model_not_found(self, mock_tflite_interpreter):
        """Test initialization fails when model file doesn't exist"""
        with patch('audio_detection_engine.AUDIO_AVAILABLE', True):
            with pytest.raises(FileNotFoundError):
                AudioDetectionEngine(
                    model_path="/nonexistent/model.tflite",
                    confidence_threshold=0.6
                )
    
    def test_initialization_audio_not_available(self, mock_audio_model, mock_tflite_interpreter):
        """Test initialization when PyAudio is not available"""
        with patch('audio_detection_engine.AUDIO_AVAILABLE', False):
            engine = AudioDetectionEngine(
                model_path=mock_audio_model,
                confidence_threshold=0.6
            )
            
            assert engine.enabled is False
    
    def test_initialization_disabled(self, mock_audio_model, mock_tflite_interpreter):
        """Test initialization with audio detection disabled"""
        with patch('audio_detection_engine.AUDIO_AVAILABLE', True):
            engine = AudioDetectionEngine(
                model_path=mock_audio_model,
                confidence_threshold=0.6,
                enabled=False
            )
            
            assert engine.enabled is False


class TestAudioPreprocessing:
    """Test audio preprocessing"""
    
    def test_preprocess_audio(self, audio_engine):
        """Test audio preprocessing converts bytes to normalized array"""
        # Create mock audio data (1 second at 16kHz)
        samples = np.random.randint(-32768, 32767, size=16000, dtype=np.int16)
        audio_bytes = samples.tobytes()
        
        # Preprocess
        preprocessed = audio_engine._preprocess_audio(audio_bytes)
        
        # Check shape
        assert preprocessed.shape[0] == 1  # Batch dimension
        assert preprocessed.shape[1] == 16000  # Samples
        
        # Check normalization (values should be in [-1, 1])
        assert np.all(preprocessed >= -1.0)
        assert np.all(preprocessed <= 1.0)
    
    def test_preprocess_audio_truncates_long_input(self, audio_engine):
        """Test preprocessing truncates audio longer than window"""
        # Create audio data longer than 1 second
        samples = np.random.randint(-32768, 32767, size=32000, dtype=np.int16)
        audio_bytes = samples.tobytes()
        
        # Preprocess
        preprocessed = audio_engine._preprocess_audio(audio_bytes)
        
        # Should be truncated to window size
        assert preprocessed.shape[1] == 16000


class TestAudioDetection:
    """Test audio detection processing"""
    
    def test_process_audio_window_valid_detection(self, audio_engine):
        """Test processing audio window with valid detection"""
        # Create mock audio data
        samples = np.random.randint(-32768, 32767, size=16000, dtype=np.int16)
        audio_bytes = samples.tobytes()
        
        # Process window
        detection = audio_engine._process_audio_window(audio_bytes)
        
        # Should return detection (mock output has confidence 0.55 for Unknown)
        assert detection is not None
        assert isinstance(detection, AudioDetection)
        assert detection.species in AudioDetectionEngine.VALID_SPECIES
        assert 0.0 <= detection.confidence <= 1.0
        assert detection.timestamp > 0
    
    def test_process_audio_window_below_threshold(self, audio_engine, mock_tflite_interpreter):
        """Test processing audio window with confidence below threshold"""
        # Mock output with low confidence
        mock_output = np.array([[0.2, 0.2, 0.2, 0.2, 0.1, 0.1]])
        audio_engine.interpreter.get_tensor.return_value = mock_output
        
        # Create mock audio data
        samples = np.random.randint(-32768, 32767, size=16000, dtype=np.int16)
        audio_bytes = samples.tobytes()
        
        # Process window
        detection = audio_engine._process_audio_window(audio_bytes)
        
        # Should return None (all confidences below 0.6 threshold)
        assert detection is None
    
    def test_parse_model_output(self, audio_engine):
        """Test parsing model output to species and confidence"""
        # Mock output with Elephant as highest probability
        output = np.array([[0.8, 0.1, 0.05, 0.03, 0.01, 0.01]])
        
        species, confidence = audio_engine._parse_model_output(output)
        
        assert species == "Elephant"
        assert confidence == 0.8
    
    def test_parse_model_output_unknown_class(self, audio_engine):
        """Test parsing model output with out-of-range class index"""
        # Mock output with invalid class index
        output = np.zeros((1, 10))
        output[0, 8] = 0.9  # Index 8 is out of range
        
        species, confidence = audio_engine._parse_model_output(output)
        
        assert species == "Unknown"
        assert confidence == 0.9


class TestDetectionMerging:
    """Test merging visual and audio detections"""
    
    def test_merge_detections_same_species_within_window(self, audio_engine):
        """Test merging detections of same species within time window"""
        # Create mock Detection class
        from dataclasses import dataclass
        
        @dataclass
        class Detection:
            species: str
            confidence: float
            bounding_box: tuple
            timestamp: int
        
        timestamp = int(time.time())
        visual = Detection(
            species="Elephant",
            confidence=0.75,
            bounding_box=(0, 0, 640, 480),
            timestamp=timestamp
        )
        
        # Create audio detection within 5 seconds
        audio = AudioDetection(
            species="Elephant",
            confidence=0.65,
            timestamp=timestamp + 3
        )
        
        # Merge
        merged = audio_engine.merge_detections(visual, audio)
        
        # Should merge successfully
        assert merged is not None
        assert merged.species == "Elephant"
        assert merged.confidence == 0.75  # Max of 0.75 and 0.65
    
    def test_merge_detections_outside_time_window(self, audio_engine):
        """Test merging fails when detections are outside time window"""
        from dataclasses import dataclass
        
        @dataclass
        class Detection:
            species: str
            confidence: float
            bounding_box: tuple
            timestamp: int
        
        timestamp = int(time.time())
        visual = Detection(
            species="Elephant",
            confidence=0.75,
            bounding_box=(0, 0, 640, 480),
            timestamp=timestamp
        )
        
        # Create audio detection outside 5-second window
        audio = AudioDetection(
            species="Elephant",
            confidence=0.65,
            timestamp=timestamp + 10
        )
        
        # Merge
        merged = audio_engine.merge_detections(visual, audio)
        
        # Should not merge
        assert merged is None
    
    def test_merge_detections_different_species(self, audio_engine):
        """Test merging fails when species don't match"""
        from dataclasses import dataclass
        
        @dataclass
        class Detection:
            species: str
            confidence: float
            bounding_box: tuple
            timestamp: int
        
        timestamp = int(time.time())
        visual = Detection(
            species="Elephant",
            confidence=0.75,
            bounding_box=(0, 0, 640, 480),
            timestamp=timestamp
        )
        
        # Create audio detection with different species
        audio = AudioDetection(
            species="Boar",
            confidence=0.65,
            timestamp=timestamp + 2
        )
        
        # Merge
        merged = audio_engine.merge_detections(visual, audio)
        
        # Should not merge
        assert merged is None
    
    def test_merge_detections_higher_audio_confidence(self, audio_engine):
        """Test merged confidence uses maximum of both detections"""
        from dataclasses import dataclass
        
        @dataclass
        class Detection:
            species: str
            confidence: float
            bounding_box: tuple
            timestamp: int
        
        timestamp = int(time.time())
        visual = Detection(
            species="Boar",
            confidence=0.65,
            bounding_box=(0, 0, 640, 480),
            timestamp=timestamp
        )
        
        # Create audio detection with higher confidence
        audio = AudioDetection(
            species="Boar",
            confidence=0.85,
            timestamp=timestamp + 2
        )
        
        # Merge
        merged = audio_engine.merge_detections(visual, audio)
        
        # Should use higher confidence
        assert merged is not None
        assert merged.confidence == 0.85


class TestConfigurationUpdates:
    """Test configuration updates"""
    
    def test_update_confidence_threshold(self, audio_engine):
        """Test updating confidence threshold"""
        audio_engine.update_confidence_threshold(0.8)
        assert audio_engine.confidence_threshold == 0.8
    
    def test_update_confidence_threshold_invalid(self, audio_engine):
        """Test updating confidence threshold with invalid value"""
        with pytest.raises(ValueError):
            audio_engine.update_confidence_threshold(1.5)
        
        with pytest.raises(ValueError):
            audio_engine.update_confidence_threshold(-0.1)
    
    def test_is_enabled(self, audio_engine):
        """Test checking if audio detection is enabled"""
        assert audio_engine.is_enabled() is True
        
        audio_engine.enabled = False
        assert audio_engine.is_enabled() is False


class TestAudioCapture:
    """Test audio capture functionality"""
    
    @patch('audio_detection_engine.wave.open')
    @patch('audio_detection_engine.pyaudio.PyAudio')
    def test_capture_audio_clip(self, mock_pyaudio, mock_wave_open, audio_engine):
        """Test capturing audio clip"""
        # Mock PyAudio stream
        mock_stream = MagicMock()
        mock_stream.read.return_value = b'\x00' * 2048
        
        mock_audio = MagicMock()
        mock_audio.open.return_value = mock_stream
        mock_audio.get_sample_size.return_value = 2
        mock_pyaudio.return_value = mock_audio
        
        # Mock wave file
        mock_wave_file = MagicMock()
        mock_wave_open.return_value.__enter__.return_value = mock_wave_file
        
        # Capture audio clip
        audio_bytes = audio_engine.capture_audio_clip(duration=1.0)
        
        # Should return WAV bytes (even if empty from mock)
        assert audio_bytes is not None
    
    def test_capture_audio_clip_disabled(self, audio_engine):
        """Test capturing audio clip when disabled"""
        audio_engine.enabled = False
        
        audio_bytes = audio_engine.capture_audio_clip()
        
        assert audio_bytes is None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
