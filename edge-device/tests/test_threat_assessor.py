"""
Unit tests for Threat Assessor Module

Tests threat level assignment based on species and confidence scores.
"""

import pytest
from edge.src.threat_assessor import ThreatAssessor, ThreatLevel


class TestThreatAssessor:
    """Test suite for ThreatAssessor class"""
    
    @pytest.fixture
    def assessor(self):
        """Create a ThreatAssessor instance for testing"""
        return ThreatAssessor()
    
    # Test high confidence detections (> 0.7)
    
    def test_elephant_high_confidence_returns_high_threat(self, assessor):
        """Elephant with confidence > 0.7 should return HIGH threat"""
        threat = assessor.assess_threat("Elephant", 0.92)
        assert threat == ThreatLevel.HIGH
    
    def test_leopard_high_confidence_returns_high_threat(self, assessor):
        """Leopard with confidence > 0.7 should return HIGH threat"""
        threat = assessor.assess_threat("Leopard", 0.85)
        assert threat == ThreatLevel.HIGH
    
    def test_boar_high_confidence_returns_medium_threat(self, assessor):
        """Boar with confidence > 0.7 should return MEDIUM threat"""
        threat = assessor.assess_threat("Boar", 0.8)
        assert threat == ThreatLevel.MEDIUM
    
    def test_deer_high_confidence_returns_low_threat(self, assessor):
        """Deer with confidence > 0.7 should return LOW threat"""
        threat = assessor.assess_threat("Deer", 0.75)
        assert threat == ThreatLevel.LOW
    
    def test_human_high_confidence_returns_low_threat(self, assessor):
        """Human with confidence > 0.7 should return LOW threat"""
        threat = assessor.assess_threat("Human", 0.9)
        assert threat == ThreatLevel.LOW
    
    def test_unknown_high_confidence_returns_low_threat(self, assessor):
        """Unknown species with confidence > 0.7 should return LOW threat"""
        threat = assessor.assess_threat("Unknown", 0.88)
        assert threat == ThreatLevel.LOW
    
    # Test medium confidence detections (0.5 to 0.7) - threat level reduction
    
    def test_elephant_medium_confidence_reduces_to_medium(self, assessor):
        """Elephant with confidence 0.5-0.7 should reduce from HIGH to MEDIUM"""
        threat = assessor.assess_threat("Elephant", 0.6)
        assert threat == ThreatLevel.MEDIUM
    
    def test_leopard_medium_confidence_reduces_to_medium(self, assessor):
        """Leopard with confidence 0.5-0.7 should reduce from HIGH to MEDIUM"""
        threat = assessor.assess_threat("Leopard", 0.65)
        assert threat == ThreatLevel.MEDIUM
    
    def test_boar_medium_confidence_reduces_to_low(self, assessor):
        """Boar with confidence 0.5-0.7 should reduce from MEDIUM to LOW"""
        threat = assessor.assess_threat("Boar", 0.55)
        assert threat == ThreatLevel.LOW
    
    def test_deer_medium_confidence_stays_low(self, assessor):
        """Deer with confidence 0.5-0.7 should stay at LOW (cannot reduce further)"""
        threat = assessor.assess_threat("Deer", 0.6)
        assert threat == ThreatLevel.LOW
    
    def test_human_medium_confidence_stays_low(self, assessor):
        """Human with confidence 0.5-0.7 should stay at LOW"""
        threat = assessor.assess_threat("Human", 0.68)
        assert threat == ThreatLevel.LOW
    
    # Test boundary conditions for confidence thresholds
    
    def test_confidence_exactly_0_7_uses_base_threat(self, assessor):
        """Confidence exactly 0.7 should use base threat level (not reduced)"""
        # Elephant at 0.7 should be MEDIUM (reduced from HIGH)
        threat = assessor.assess_threat("Elephant", 0.7)
        assert threat == ThreatLevel.MEDIUM
    
    def test_confidence_just_above_0_7_uses_base_threat(self, assessor):
        """Confidence just above 0.7 should use base threat level"""
        threat = assessor.assess_threat("Elephant", 0.71)
        assert threat == ThreatLevel.HIGH
    
    def test_confidence_exactly_0_5_reduces_threat(self, assessor):
        """Confidence exactly 0.5 should reduce threat level"""
        threat = assessor.assess_threat("Elephant", 0.5)
        assert threat == ThreatLevel.MEDIUM
    
    def test_confidence_just_below_0_5_returns_low(self, assessor):
        """Confidence just below 0.5 should return LOW threat"""
        threat = assessor.assess_threat("Elephant", 0.49)
        assert threat == ThreatLevel.LOW
    
    # Test low confidence detections (< 0.5)
    
    def test_low_confidence_always_returns_low_threat(self, assessor):
        """Any species with confidence < 0.5 should return LOW threat"""
        assert assessor.assess_threat("Elephant", 0.3) == ThreatLevel.LOW
        assert assessor.assess_threat("Leopard", 0.2) == ThreatLevel.LOW
        assert assessor.assess_threat("Boar", 0.4) == ThreatLevel.LOW
    
    # Test edge cases and error handling
    
    def test_confidence_at_0_returns_low_threat(self, assessor):
        """Confidence of 0.0 should return LOW threat"""
        threat = assessor.assess_threat("Elephant", 0.0)
        assert threat == ThreatLevel.LOW
    
    def test_confidence_at_1_uses_base_threat(self, assessor):
        """Confidence of 1.0 should use base threat level"""
        threat = assessor.assess_threat("Elephant", 1.0)
        assert threat == ThreatLevel.HIGH
    
    def test_invalid_confidence_below_0_raises_error(self, assessor):
        """Confidence below 0.0 should raise ValueError"""
        with pytest.raises(ValueError, match="Confidence must be in"):
            assessor.assess_threat("Elephant", -0.1)
    
    def test_invalid_confidence_above_1_raises_error(self, assessor):
        """Confidence above 1.0 should raise ValueError"""
        with pytest.raises(ValueError, match="Confidence must be in"):
            assessor.assess_threat("Elephant", 1.5)
    
    def test_unrecognized_species_treated_as_unknown(self, assessor):
        """Unrecognized species should be treated as Unknown (LOW threat)"""
        threat = assessor.assess_threat("Dragon", 0.9)
        assert threat == ThreatLevel.LOW
    
    # Test helper methods
    
    def test_get_base_threat_level_for_elephant(self, assessor):
        """get_base_threat_level should return HIGH for Elephant"""
        base_threat = assessor.get_base_threat_level("Elephant")
        assert base_threat == ThreatLevel.HIGH
    
    def test_get_base_threat_level_for_boar(self, assessor):
        """get_base_threat_level should return MEDIUM for Boar"""
        base_threat = assessor.get_base_threat_level("Boar")
        assert base_threat == ThreatLevel.MEDIUM
    
    def test_get_base_threat_level_for_deer(self, assessor):
        """get_base_threat_level should return LOW for Deer"""
        base_threat = assessor.get_base_threat_level("Deer")
        assert base_threat == ThreatLevel.LOW
    
    def test_get_base_threat_level_for_invalid_species(self, assessor):
        """get_base_threat_level should return None for invalid species"""
        base_threat = assessor.get_base_threat_level("InvalidSpecies")
        assert base_threat is None
    
    def test_is_high_threat_returns_true_for_high(self, assessor):
        """is_high_threat should return True for HIGH threat level"""
        assert assessor.is_high_threat(ThreatLevel.HIGH) is True
    
    def test_is_high_threat_returns_false_for_medium(self, assessor):
        """is_high_threat should return False for MEDIUM threat level"""
        assert assessor.is_high_threat(ThreatLevel.MEDIUM) is False
    
    def test_is_high_threat_returns_false_for_low(self, assessor):
        """is_high_threat should return False for LOW threat level"""
        assert assessor.is_high_threat(ThreatLevel.LOW) is False
    
    def test_is_medium_or_high_threat_returns_true_for_high(self, assessor):
        """is_medium_or_high_threat should return True for HIGH"""
        assert assessor.is_medium_or_high_threat(ThreatLevel.HIGH) is True
    
    def test_is_medium_or_high_threat_returns_true_for_medium(self, assessor):
        """is_medium_or_high_threat should return True for MEDIUM"""
        assert assessor.is_medium_or_high_threat(ThreatLevel.MEDIUM) is True
    
    def test_is_medium_or_high_threat_returns_false_for_low(self, assessor):
        """is_medium_or_high_threat should return False for LOW"""
        assert assessor.is_medium_or_high_threat(ThreatLevel.LOW) is False
    
    # Test all species at various confidence levels
    
    @pytest.mark.parametrize("species,confidence,expected", [
        # High confidence (> 0.7)
        ("Elephant", 0.95, ThreatLevel.HIGH),
        ("Leopard", 0.85, ThreatLevel.HIGH),
        ("Boar", 0.8, ThreatLevel.MEDIUM),
        ("Deer", 0.75, ThreatLevel.LOW),
        ("Human", 0.9, ThreatLevel.LOW),
        ("Unknown", 0.88, ThreatLevel.LOW),
        # Medium confidence (0.5-0.7)
        ("Elephant", 0.6, ThreatLevel.MEDIUM),
        ("Leopard", 0.65, ThreatLevel.MEDIUM),
        ("Boar", 0.55, ThreatLevel.LOW),
        ("Deer", 0.6, ThreatLevel.LOW),
        ("Human", 0.68, ThreatLevel.LOW),
        ("Unknown", 0.52, ThreatLevel.LOW),
        # Low confidence (< 0.5)
        ("Elephant", 0.3, ThreatLevel.LOW),
        ("Leopard", 0.4, ThreatLevel.LOW),
        ("Boar", 0.2, ThreatLevel.LOW),
        ("Deer", 0.1, ThreatLevel.LOW),
        ("Human", 0.45, ThreatLevel.LOW),
        ("Unknown", 0.35, ThreatLevel.LOW),
    ])
    def test_threat_assessment_matrix(self, assessor, species, confidence, expected):
        """Test comprehensive matrix of species and confidence combinations"""
        threat = assessor.assess_threat(species, confidence)
        assert threat == expected, (
            f"Expected {expected.value} for {species} at {confidence}, "
            f"got {threat.value}"
        )


class TestThreatLevelReduction:
    """Test suite for threat level reduction logic"""
    
    @pytest.fixture
    def assessor(self):
        """Create a ThreatAssessor instance for testing"""
        return ThreatAssessor()
    
    def test_reduce_high_to_medium(self, assessor):
        """Reducing HIGH threat should return MEDIUM"""
        reduced = assessor._reduce_threat_level(ThreatLevel.HIGH)
        assert reduced == ThreatLevel.MEDIUM
    
    def test_reduce_medium_to_low(self, assessor):
        """Reducing MEDIUM threat should return LOW"""
        reduced = assessor._reduce_threat_level(ThreatLevel.MEDIUM)
        assert reduced == ThreatLevel.LOW
    
    def test_reduce_low_stays_low(self, assessor):
        """Reducing LOW threat should stay at LOW (cannot reduce further)"""
        reduced = assessor._reduce_threat_level(ThreatLevel.LOW)
        assert reduced == ThreatLevel.LOW
