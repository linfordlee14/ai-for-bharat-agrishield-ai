# IncidentMap Component

## Overview

The `IncidentMap` component is a React component that displays wildlife incidents on an interactive Leaflet map with marker clustering and color-coded threat levels.

## Features

- **Interactive Map**: Built with Leaflet.js and react-leaflet
- **Color-Coded Markers**: 
  - 🔴 Red for HIGH threat level
  - 🟠 Orange for MEDIUM threat level
  - 🟡 Yellow for LOW threat level
- **Marker Clustering**: Automatically clusters markers in dense areas using leaflet.markercluster
- **Detailed Popups**: Click markers to view incident details including:
  - Species name
  - Threat level
  - Confidence score
  - Device ID
  - Timestamp
  - GPS coordinates
- **Custom Center & Zoom**: Configurable map center and zoom level
- **Click Handlers**: Optional callback for marker click events

## Usage

```tsx
import { IncidentMap } from '@/components'
import { useIncidents } from '@/hooks/useIncidents'

function MyComponent() {
  const { data } = useIncidents()
  
  const handleMarkerClick = (incident) => {
    console.log('Clicked incident:', incident)
    // Open modal, navigate, etc.
  }
  
  return (
    <div className="h-96">
      <IncidentMap 
        incidents={data?.incidents || []}
        center={[-1.2921, 36.8219]} // Optional: Nairobi, Kenya
        zoom={10} // Optional: default zoom level
        onMarkerClick={handleMarkerClick} // Optional: click handler
      />
    </div>
  )
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `incidents` | `Incident[]` | Yes | - | Array of incident objects to display |
| `center` | `[number, number]` | No | `[-1.2921, 36.8219]` | Map center coordinates [latitude, longitude] |
| `zoom` | `number` | No | `10` | Initial zoom level |
| `onMarkerClick` | `(incident: Incident) => void` | No | - | Callback when marker is clicked |

## Incident Type

```typescript
interface Incident {
  id: string
  device_id: string
  timestamp: number // Unix timestamp
  species: Species
  confidence: number // 0.0 to 1.0
  threat_level: ThreatLevel
  latitude: number
  longitude: number
  image_url?: string
  audio_url?: string
}

type ThreatLevel = 'HIGH' | 'MEDIUM' | 'LOW'
type Species = 'Elephant' | 'Boar' | 'Deer' | 'Leopard' | 'Human' | 'Unknown'
```

## Styling

The component uses Tailwind CSS for styling. Ensure your container has a defined height:

```tsx
<div className="h-screen"> {/* or h-96, h-[600px], etc. */}
  <IncidentMap incidents={incidents} />
</div>
```

## Marker Clustering

Markers automatically cluster when multiple incidents are close together:
- **Cluster Radius**: 50 pixels
- **Spiderfy on Max Zoom**: Yes (spreads out markers at max zoom)
- **Zoom to Bounds on Click**: Yes (zooms to cluster bounds when clicked)

## Color Mapping

The component maps threat levels to colors as specified in Requirements 11.5:

```typescript
const THREAT_COLORS = {
  HIGH: '#ef4444',    // Tailwind red-500
  MEDIUM: '#f97316',  // Tailwind orange-500
  LOW: '#eab308',     // Tailwind yellow-500
}
```

## Requirements Validation

This component satisfies the following requirements:

- **11.1**: Display incidents on interactive map using Leaflet.js ✅
- **11.2**: Center map on configured default location ✅
- **11.3**: Render markers at incident coordinates ✅
- **11.4**: Display popup with species, timestamp, threat level, device_id ✅
- **11.5**: Color-code markers by threat level (red=HIGH, orange=MEDIUM, yellow=LOW) ✅
- **11.6**: Cluster markers for dense areas ✅

## Testing

The component includes unit tests covering:
- Map container rendering
- Tile layer rendering
- Custom center and zoom props
- Marker click callbacks
- Empty incidents array handling
- Default center usage

Run tests:
```bash
npm test -- IncidentMap.test.tsx
```

## Dependencies

- `react-leaflet`: React components for Leaflet
- `leaflet`: Interactive map library
- `leaflet.markercluster`: Marker clustering plugin
- `@types/leaflet`: TypeScript definitions
- `@types/leaflet.markercluster`: TypeScript definitions for clustering

## Future Enhancements

The following features will be added in subsequent tasks:

- **Heatmap Layer** (Task 22.3): Toggle-able heatmap showing incident density
- **Time Range Filter** (Task 22.4): Filter incidents by date range
- **Species Filter** (Task 22.4): Filter incidents by species
- **Threat Level Filter** (Task 22.4): Filter incidents by threat level
- **Incident Detail Modal** (Task 22.5): Full-screen modal with image and audio
- **Movement Vectors** (Task 22.6): Display animal movement patterns

## Notes

- The component uses custom div icons for markers to enable color coding
- Leaflet CSS is imported globally in `index.css`
- The component handles marker cleanup on unmount to prevent memory leaks
- Popup content is created using DOM manipulation for better performance with large datasets
