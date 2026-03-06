import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IncidentMap } from './IncidentMap'
import type { Incident } from '@/types'

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  useMap: () => ({
    setView: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    getZoom: vi.fn(() => 10),
  }),
}))

// Mock leaflet
vi.mock('leaflet', () => ({
  default: {
    Icon: {
      Default: {
        prototype: {},
        mergeOptions: vi.fn(),
      },
    },
    divIcon: vi.fn(() => ({})),
    marker: vi.fn(() => ({
      bindPopup: vi.fn(),
      on: vi.fn(),
    })),
    markerClusterGroup: vi.fn(() => ({
      clearLayers: vi.fn(),
      addLayer: vi.fn(),
    })),
  },
}))

// Mock leaflet.markercluster
vi.mock('leaflet.markercluster', () => ({}))

describe('IncidentMap', () => {
  const mockIncidents: Incident[] = [
    {
      id: '1',
      device_id: 'device-001',
      timestamp: 1704067200,
      species: 'Elephant',
      confidence: 0.92,
      threat_level: 'HIGH',
      latitude: -1.2921,
      longitude: 36.8219,
    },
    {
      id: '2',
      device_id: 'device-002',
      timestamp: 1704067300,
      species: 'Boar',
      confidence: 0.85,
      threat_level: 'MEDIUM',
      latitude: -1.2925,
      longitude: 36.8225,
    },
    {
      id: '3',
      device_id: 'device-003',
      timestamp: 1704067400,
      species: 'Deer',
      confidence: 0.78,
      threat_level: 'LOW',
      latitude: -1.2930,
      longitude: 36.8230,
    },
  ]

  it('renders map container', () => {
    render(<IncidentMap incidents={mockIncidents} />)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('renders tile layer', () => {
    render(<IncidentMap incidents={mockIncidents} />)
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument()
  })

  it('accepts custom center and zoom props', () => {
    const customCenter: [number, number] = [0, 0]
    const customZoom = 15
    
    render(
      <IncidentMap 
        incidents={mockIncidents} 
        center={customCenter}
        zoom={customZoom}
      />
    )
    
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('accepts onMarkerClick callback', () => {
    const handleClick = vi.fn()
    
    render(
      <IncidentMap 
        incidents={mockIncidents}
        onMarkerClick={handleClick}
      />
    )
    
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('renders with empty incidents array', () => {
    render(<IncidentMap incidents={[]} />)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('uses default center when not provided', () => {
    render(<IncidentMap incidents={mockIncidents} />)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })
})
