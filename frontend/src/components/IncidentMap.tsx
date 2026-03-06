import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import type { Incident } from '../types'

// Fix for default marker icons in Leaflet with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png?url'
import markerIcon from 'leaflet/dist/images/marker-icon.png?url'
import markerShadow from 'leaflet/dist/images/marker-shadow.png?url'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

interface IncidentMapProps {
  incidents: Incident[]
  center?: [number, number]
  zoom?: number
  onMarkerClick?: (incident: Incident) => void
}

// Component to update map center when it changes
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  
  return null
}

// Component to handle marker clustering
function MarkerCluster({ 
  incidents, 
  onMarkerClick 
}: { 
  incidents: Incident[]
  onMarkerClick?: (incident: Incident) => void 
}) {
  const map = useMap()
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)

  useEffect(() => {
    // Create marker cluster group if it doesn't exist
    if (!clusterGroupRef.current) {
      clusterGroupRef.current = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
      })
      map.addLayer(clusterGroupRef.current)
    }

    const clusterGroup = clusterGroupRef.current

    // Clear existing markers
    clusterGroup.clearLayers()

    // Add markers for each incident
    incidents.forEach((incident) => {
      const icon = createColoredIcon(THREAT_COLORS[incident.threat_level])
      const marker = L.marker([incident.latitude, incident.longitude], { icon })

      // Create popup content
      const popupContent = createPopupContent(incident, onMarkerClick)
      marker.bindPopup(popupContent)

      // Add click handler
      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(incident))
      }

      clusterGroup.addLayer(marker)
    })

    // Cleanup on unmount
    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current)
        clusterGroupRef.current = null
      }
    }
  }, [incidents, map, onMarkerClick])

  return null
}

// Create custom colored markers based on threat level
const createColoredIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        "></div>
      </div>
    `,
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25],
  })
}

// Threat level to color mapping
const THREAT_COLORS = {
  HIGH: '#ef4444', // red
  MEDIUM: '#f97316', // orange
  LOW: '#eab308', // yellow
}

// Format timestamp for display
const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString()
}

// Create popup content
const createPopupContent = (
  incident: Incident, 
  onMarkerClick?: (incident: Incident) => void
): HTMLElement => {
  const container = document.createElement('div')
  container.className = 'p-2 min-w-[200px]'
  
  container.innerHTML = `
    <div class="font-semibold text-lg mb-2">
      ${incident.species}
    </div>
    
    <div class="space-y-1 text-sm">
      <div class="flex justify-between">
        <span class="text-gray-600">Threat Level:</span>
        <span 
          class="font-medium px-2 py-0.5 rounded text-white"
          style="background-color: ${THREAT_COLORS[incident.threat_level]}"
        >
          ${incident.threat_level}
        </span>
      </div>
      
      <div class="flex justify-between">
        <span class="text-gray-600">Confidence:</span>
        <span class="font-medium">
          ${(incident.confidence * 100).toFixed(1)}%
        </span>
      </div>
      
      <div class="flex justify-between">
        <span class="text-gray-600">Device:</span>
        <span class="font-mono text-xs">
          ${incident.device_id}
        </span>
      </div>
      
      <div class="flex justify-between">
        <span class="text-gray-600">Time:</span>
        <span class="text-xs">
          ${formatTimestamp(incident.timestamp)}
        </span>
      </div>
      
      <div class="flex justify-between">
        <span class="text-gray-600">Location:</span>
        <span class="text-xs">
          ${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}
        </span>
      </div>
    </div>
    
    ${onMarkerClick ? `
      <button
        class="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded transition-colors view-details-btn"
      >
        View Details
      </button>
    ` : ''}
  `
  
  // Add event listener for the button if callback exists
  if (onMarkerClick) {
    const button = container.querySelector('.view-details-btn')
    if (button) {
      button.addEventListener('click', () => onMarkerClick(incident))
    }
  }
  
  return container
}

export function IncidentMap({ 
  incidents, 
  center = [20.5937, 78.9629], // Default: Central India
  zoom = 5,
  onMarkerClick 
}: IncidentMapProps) {
  return (
    <div className="w-full h-full">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <MapUpdater center={center} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerCluster incidents={incidents} onMarkerClick={onMarkerClick} />
      </MapContainer>
    </div>
  )
}
