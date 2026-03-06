"""
Unit tests for Detection Engine

Tests cover:
- Model loading and initialization
- Frame preprocessing
- Inference execution
- Output parsing
- Evidence capture
- Configuration updates
- Error handling
"""

import pytest
import numpy as np
import tempfile
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

import sys
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from detection_engine import DetectionEngine, Detection


@pytest.fixture
def mock_model_file():
    """Create a temporary mock model file"""
    with tempfile.NamedTemporaryFile(suffix=".tflite", delete=False) as f:
        # Write minimal TFLite model header
        f.write(b"TFL3" + b"\x00" * 100)
        model_path = f.name
    
    yield model_path
    
    # Cleanup
    Path(model_path).unlink(missing_ok=True)


@pytest.fixture
def mock_interpreter():
    """Create a mock TFLite interpreter"""
    interpreter = Mock()
    interpreter.allocate_tensors = Mock()
    interpreter.get_input_details = Mock(return_value=[{
        'index': 0,
        'shape': [1, 224, 224, 3],
        'dtype': np.float32
    }])
    interpreter.get_output_details = Mock(return_value=[{
        'index': 0,
        'shape': [1, 6],  # 6 species classes
        'dtype': np.float32
    }])
    interpreter.set_tensor = Mock()
    interpreter.invoke = Mock()
    
    return interpreter


@pytest.fixture
def detection_engine(mock_model_file, mock_interpreter):
    """Create a DetectionEngine instance with mocked TFLite"""
    with patch('detection_engine.tflite.Interpreter', return_value=mock_interpreter):
        engine = DetectionEngine(
            model_path=mock_model_file,
            confidence_threshold=0.7,
            frame_rate=15,
            resolution=(640, 480),
            input_size=(224, 224)
        )
    return engine


class TestDetectionEngineInitialization:
    """Test detection engine initialization"""
    
    def test_init_with_valid_model(self, mock_model_file, mock_interpreter):
        """Test initialization with valid model file"""
        with patch('detection_engine.tflite.Interpreter', return_value=mock_interpreter):
            engine = DetectionEngine(
                model_path=mock_model_file,
                confidence_threshold=0.7,
                frame_rate=15
            )
            
            assert engine.confidence_threshold == 0.7
            assert engine.frame_rate == 15
            assert engine.resolution == (640, 480)
            assert engine.input_size == (224, 224)
    
    def test_init_with_missing_model(self):
        """Test initialization fails with missing model file"""
        with pytest.raises(FileNotFoundError):
            DetectionEngine(model_path="nonexistent_model.tflite")
    
    def test_init_with_custom_parameters(self, mock_model_file, mock_interpreter):
        """Test initialization with custom parameters"""
        with patch('detection_engine.tflite.Interpreter', return_value=mock_interpreter):
            engine = DetectionEngine(
                model_path=mock_model_file,
                confidence_threshold=0.8,
                frame_rate=10,
                resolution=(1280, 720),
                input_size=(320, 320)
            )
            
            assert engine.confidence_threshold == 0.8
            assert engine.frame_rate == 10
            assert engine.resolution == (1280, 720)
            assert engine.input_size == (320, 320)
    
    def test_valid_species_list(self, detection_engine):
        """Test that valid species list is correctly defined"""
        expected_species = ["Elephant", "Boar", "Deer", "Leopard", "Human", "Unknown"]
        assert detection_engine.VALID_SPECIES == expected_species


class TestFramePreprocessing:
    """Test frame preprocessing functionality"""
    
    def test_preprocess_frame_shape(self, detection_engine):
        """Test that preprocessing produces correct output shape"""
        # Create a test frame (640x480x3)
        frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        preprocessed = detection_engine._preprocess_frame(frame)
        
        # Should be (1, 224, 224, 3) - batch, height, width, channels
        assert preprocessed.shape == (1, 224, 224, 3)
    
    def test_preprocess_frame_normalization(self, detection_engine):
        """Test that preprocessing normalizes values to [0, 1]"""
        # Create a test frame with known values
        frame = np.full((480, 640, 3), 255, dtype=np.uint8)
        
        preprocessed = detection_engine._preprocess_frame(frame)
        
        # Values should be normalized to [0, 1]
        assert preprocessed.min() >= 0.0
        assert preprocessed.max() <= 1.0
        # White pixels (255) should become ~1.0
        assert np.allclose(preprocessed.max(), 1.0, atol=0.01)
    
    def test_preprocess_frame_dtype(self, detection_engine):
        """Test that preprocessing produces float32 output"""
        frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        preprocessed = detection_engine._preprocess_frame(frame)
        
        assert preprocessed.dtype == np.float32


class TestModelOutputParsing:
    """Test model output parsing"""
    
    def test_parse_output_elephant(self, detection_engine):
        """Test parsing output for Elephant detection"""
        # Create output with Elephant as highest probability (index 0)
        output = np.array([[0.92, 0.02, 0.01, 0.02, 0.02, 0.01]], dtype=np.float32)
        
        species, confidence = detection_engine._parse_model_output(output)
        
        assert species == "Elephant"
        assert confidence == pytest.approx(0.92, abs=0.01)
    
    def test_parse_output_boar(self, detection_engine):
        """Test parsing output for Boar detection"""
        # Create output with Boar as highest probability (index 1)
        output = np.array([[0.05, 0.85, 0.03, 0.02, 0.03, 0.02]], dtype=np.float32)
        
        species, confidence = detection_engine._parse_model_output(output)
        
        assert species == "Boar"
        assert confidence == pytest.approx(0.85, abs=0.01)
    
    def test_parse_output_all_species(self, detection_engine):
        """Test parsing output for all species"""
        species_list = ["Elephant", "Boar", "Deer", "Leopard", "Human", "Unknown"]
        
        for idx, expected_species in enumerate(species_list):
            # Create output with current species as highest
            output = np.zeros((1, 6), dtype=np.float32)
            output[0, idx] = 0.95
            
            species, confidence = detection_engine._parse_model_output(output)
            
            assert species == expected_species
            assert confidence == pytest.approx(0.95, abs=0.01)
    
    def test_parse_output_low_confidence(self, detection_engine):
        """Test parsing output with low confidence"""
        # Create output with low confidence (uniform distribution)
        output = np.array([[0.17, 0.16, 0.17, 0.17, 0.16, 0.17]], dtype=np.float32)
        
        species, confidence = detection_engine._parse_model_output(output)
        
        # Should still return a species (highest probability)
        assert species in detection_engine.VALID_SPECIES
        assert 0.0 <= confidence <= 1.0


class TestFrameProcessing:
    """Test complete frame processing pipeline"""
    
    def test_process_frame_valid_detection(self, detection_engine, mock_interpreter):
        """Test processing frame with valid detection (confidence > threshold)"""
        # Create test frame
        frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        # Mock model output - Elephant with high confidence
        output = np.array([[0.92, 0.02, 0.01, 0.02, 0.02, 0.01]], dtype=np.float32)
        mock_interpreter.get_tensor = Mock(return_value=output)
        
        detection = detection_engine.process_frame(frame)
        
        assert detection is not None
        assert detection.species == "Elephant"
        assert detection.confidence == pytest.approx(0.92, abs=0.01)
        assert detection.bounding_box == (0, 0, 640, 480)
        assert detection.timestamp > 0
    
    def test_process_frame_below_threshold(self, detection_engine, mock_interpreter):
        """Test processing frame with confidence below threshold"""
        frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        # Mock model output - low confidence (below 0.7 threshold)
        output = np.array([[0.55, 0.15, 0.10, 0.10, 0.05, 0.05]], dtype=np.float32)
        mock_interpreter.get_tensor = Mock(return_value=output)
        
        detection = detection_engine.process_frame(frame)
        
        # Should return None since confidence < threshold
        assert detection is None
    
    def test_process_frame_at_threshold(self, detection_engine, mock_interpreter):
        """Test processing frame with confidence exactly at threshold"""
        frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        # Mock model output - exactly at threshold (0.7)
        output = np.array([[0.70, 0.10, 0.05, 0.05, 0.05, 0.05]], dtype=np.float32)
        mock_interpreter.get_tensor = Mock(return_value=output)
        
        detection = detection_engine.process_frame(frame)
        
        # Should return detection since confidence >= threshold
        assert detection is not None
        assert detection.confidence == pytest.approx(0.70, abs=0.01)
    
    def test_process_frame_inference_error(self, detection_engine, mock_interpreter):
        """Test handling of inference errors"""
        frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        # Mock inference failure
        mock_interpreter.invoke = Mock(side_effect=RuntimeError("Inference failed"))
        
        with pytest.raises(RuntimeError, match="Inference failed"):
            detection_engine.process_frame(frame)


class TestEvidenceCapture:
    """Test evidence capture functionality"""
    
    def test_capture_evidence_image(self, detection_engine):
        """Test capturing still image"""
        # Create test frame
        frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        image_bytes, audio_bytes = detection_engine.capture_evidence(frame)
        
        # Should return image bytes
        assert image_bytes is not None
        assert len(image_bytes) > 0
        
        # Audio not implemented yet
        assert audio_bytes is None
    
    def test_capture_evidence_jpeg_format(self, detection_engine):
        """Test that captured image is in JPEG format"""
        frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        image_bytes, _ = detection_engine.capture_evidence(frame)
        
        # JPEG files start with FF D8 FF
        assert image_bytes[:3] == b'\xff\xd8\xff'
    
    def test_capture_evidence_updates_timestamp(self, detection_engine):
        """Test that evidence capture updates last capture time"""
        frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        initial_time = detection_engine.last_evidence_capture_time
        detection_engine.capture_evidence(frame)
        
        assert detection_engine.last_evidence_capture_time > initial_time


class TestValidationMethods:
    """Test validation and utility methods"""
    
    def test_is_valid_detection_above_threshold(self, detection_engine):
        """Test validation of detection above threshold"""
        detection = Detection(
            species="Elephant",
            confidence=0.85,
            bounding_box=(0, 0, 640, 480),
            timestamp=int(time.time())
        )
        
        assert detection_engine.is_valid_detection(detection) is True
    
    def test_is_valid_detection_below_threshold(self, detection_engine):
        """Test validation of detection below threshold"""
        detection = Detection(
            species="Elephant",
            confidence=0.55,
            bounding_box=(0, 0, 640, 480),
            timestamp=int(time.time())
        )
        
        assert detection_engine.is_valid_detection(detection) is False
    
    def test_is_valid_detection_none(self, detection_engine):
        """Test validation of None detection"""
        assert detection_engine.is_valid_detection(None) is False
    
    def test_get_frame_interval(self, detection_engine):
        """Test frame interval calculation"""
        # Frame rate is 15 fps, so interval should be 1/15 seconds
        interval = detection_engine.get_frame_interval()
        assert interval == pytest.approx(1.0 / 15, abs=0.001)


class TestConfigurationUpdates:
    """Test configuration update methods"""
    
    def test_update_confidence_threshold_valid(self, detection_engine):
        """Test updating confidence threshold with valid value"""
        detection_engine.update_confidence_threshold(0.8)
        assert detection_engine.confidence_threshold == 0.8
    
    def test_update_confidence_threshold_invalid_high(self, detection_engine):
        """Test updating confidence threshold with value > 1.0"""
        with pytest.raises(ValueError, match="must be in"):
            detection_engine.update_confidence_threshold(1.5)
    
    def test_update_confidence_threshold_invalid_low(self, detection_engine):
        """Test updating confidence threshold with value < 0.0"""
        with pytest.raises(ValueError, match="must be in"):
            detection_engine.update_confidence_threshold(-0.1)
    
    def test_update_frame_rate_valid(self, detection_engine):
        """Test updating frame rate with valid value"""
        detection_engine.update_frame_rate(10)
        assert detection_engine.frame_rate == 10
    
    def test_update_frame_rate_invalid(self, detection_engine):
        """Test updating frame rate with invalid value"""
        with pytest.raises(ValueError, match="must be positive"):
            detection_engine.update_frame_rate(0)
        
        with pytest.raises(ValueError, match="must be positive"):
            detection_engine.update_frame_rate(-5)


class TestRequirementCompliance:
    """Test compliance with specific requirements"""
    
    def test_requirement_1_2_species_classification(self, detection_engine, mock_interpreter):
        """Requirement 1.2: Detection system shall classify species"""
        frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        # Test each species
        for idx, species in enumerate(detection_engine.VALID_SPECIES):
            output = np.zeros((1, 6), dtype=np.float32)
            output[0, idx] = 0.85
            mock_interpreter.get_tensor = Mock(return_value=output)
            
            detection = detection_engine.process_frame(frame)
            
            assert detection.species == species
    
    def test_requirement_1_3_confidence_score_range(self, detection_engine, mock_interpreter):
        """Requirement 1.3: Confidence score shall be between 0.0 and 1.0"""
        frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        # Test various confidence values
        test_confidences = [0.0, 0.3, 0.5, 0.7, 0.9, 1.0]
        
        for conf in test_confidences:
            output = np.array([[conf, 0.0, 0.0, 0.0, 0.0, 0.0]], dtype=np.float32)
            mock_interpreter.get_tensor = Mock(return_value=output)
            
            detection = detection_engine.process_frame(frame)
            
            if detection:
                assert 0.0 <= detection.confidence <= 1.0
    
    def test_requirement_1_6_valid_detection_threshold(self, detection_engine, mock_interpreter):
        """Requirement 1.6: Confidence > 0.7 shall be classified as valid"""
        frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        # Test confidence above threshold
        output = np.array([[0.85, 0.05, 0.03, 0.03, 0.02, 0.02]], dtype=np.float32)
        mock_interpreter.get_tensor = Mock(return_value=output)
        
        detection = detection_engine.process_frame(frame)
        assert detection is not None
        
        # Test confidence below threshold
        output = np.array([[0.65, 0.10, 0.08, 0.08, 0.05, 0.04]], dtype=np.float32)
        mock_interpreter.get_tensor = Mock(return_value=output)
        
        detection = detection_engine.process_frame(frame)
        assert detection is None
    
    def test_requirement_1_7_still_image_capture(self, detection_engine):
        """Requirement 1.7: Valid detection shall capture still image"""
        frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        image_bytes, _ = detection_engine.capture_evidence(frame)
        
        assert image_bytes is not None
        assert len(image_bytes) > 0


# Add missing import
import time
