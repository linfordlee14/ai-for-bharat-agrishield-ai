"""
Threat Assessor Module for AgriShield AI System

This module implements threat level assessment based on detected species
and confidence scores to determine appropriate deterrence and alerting responses.
"""

import logging
from enum import Enum
from typing import Optional

logger = logging.getLogger(__name__)


class ThreatLevel(Enum):
    """Threat level classifications for wildlife detections"""
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ThreatAssessor:
    """
    Assesses threat level of detected wildlife based on species and confidence.
    
    Threat Level Rules:
    - Elephant (confidence > 0.7): HIGH
    - Leopard (confidence > 0.7): HIGH
    - Boar (confidence > 0.7): MEDIUM
    - Deer (confidence > 0.7): LOW
    - Human (confidence > 0.7): LOW
    - Unknown (confidence > 0.7): LOW
    - Confidence 0.5-0.7: Reduce threat level by one
    """
    
    # Base threat levels for each species (at confidence > 0.7)
    BASE_THREAT_LEVELS = {
        "Elephant": ThreatLevel.HIGH,
        "Leopard": ThreatLevel.HIGH,
        "Boar": ThreatLevel.MEDIUM,
        "Deer": ThreatLevel.LOW,
        "Human": ThreatLevel.LOW,
        "Unknown": ThreatLevel.LOW,
    }
    
    # Threat level hierarchy for reduction logic
    THREAT_HIERARCHY = [ThreatLevel.LOW, ThreatLevel.MEDIUM, ThreatLevel.HIGH]
    
    def __init__(self):
        """Initialize the threat assessor."""
        logger.info("Threat assessor initialized")
    
    def assess_threat(self, species: str, confidence: float) -> ThreatLevel:
        """
        Determine threat level based on species and confidence score.
        
        Rules:
        1. Get base threat level for species
        2. If confidence is between 0.5 and 0.7, reduce threat level by one
        3. If confidence is below 0.5, return LOW (invalid detection)
        
        Args:
            species: Detected species name (Elephant, Boar, Deer, Leopard, Human, Unknown)
            confidence: Detection confidence score (0.0 to 1.0)
        
        Returns:
            ThreatLevel enum (HIGH, MEDIUM, or LOW)
        
        Raises:
            ValueError: If species is not recognized or confidence is out of range
        """
        # Validate inputs
        if not 0.0 <= confidence <= 1.0:
            raise ValueError(f"Confidence must be in [0.0, 1.0], got {confidence}")
        
        if species not in self.BASE_THREAT_LEVELS:
            logger.warning(f"Unknown species '{species}', treating as Unknown")
            species = "Unknown"
        
        # Get base threat level for species
        base_threat = self.BASE_THREAT_LEVELS[species]
        
        # Apply confidence-based reduction
        if confidence > 0.7:
            # High confidence: use base threat level
            threat_level = base_threat
            logger.debug(
                f"Threat assessment: {species} with confidence {confidence:.3f} -> {threat_level.value}"
            )
        elif 0.5 <= confidence <= 0.7:
            # Medium confidence: reduce threat level by one
            threat_level = self._reduce_threat_level(base_threat)
            logger.debug(
                f"Threat assessment: {species} with confidence {confidence:.3f} "
                f"-> {threat_level.value} (reduced from {base_threat.value})"
            )
        else:
            # Low confidence (< 0.5): treat as LOW threat
            threat_level = ThreatLevel.LOW
            logger.debug(
                f"Threat assessment: {species} with confidence {confidence:.3f} "
                f"-> {threat_level.value} (low confidence)"
            )
        
        return threat_level
    
    def _reduce_threat_level(self, threat_level: ThreatLevel) -> ThreatLevel:
        """
        Reduce threat level by one step in the hierarchy.
        
        Hierarchy: LOW -> MEDIUM -> HIGH
        Reduction: HIGH -> MEDIUM, MEDIUM -> LOW, LOW -> LOW
        
        Args:
            threat_level: Current threat level
        
        Returns:
            Reduced threat level
        """
        current_index = self.THREAT_HIERARCHY.index(threat_level)
        
        # Reduce by one level (move down in hierarchy)
        # If already at lowest level (LOW), stay at LOW
        reduced_index = max(0, current_index - 1)
        
        return self.THREAT_HIERARCHY[reduced_index]
    
    def get_base_threat_level(self, species: str) -> Optional[ThreatLevel]:
        """
        Get the base threat level for a species (at high confidence).
        
        Args:
            species: Species name
        
        Returns:
            Base ThreatLevel for the species, or None if species not recognized
        """
        return self.BASE_THREAT_LEVELS.get(species)
    
    def is_high_threat(self, threat_level: ThreatLevel) -> bool:
        """
        Check if threat level is HIGH.
        
        Args:
            threat_level: Threat level to check
        
        Returns:
            True if threat level is HIGH, False otherwise
        """
        return threat_level == ThreatLevel.HIGH
    
    def is_medium_or_high_threat(self, threat_level: ThreatLevel) -> bool:
        """
        Check if threat level is MEDIUM or HIGH.
        
        This is useful for determining if deterrence should be activated.
        
        Args:
            threat_level: Threat level to check
        
        Returns:
            True if threat level is MEDIUM or HIGH, False otherwise
        """
        return threat_level in (ThreatLevel.MEDIUM, ThreatLevel.HIGH)
