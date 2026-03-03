import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import L from 'leaflet';
import { useData } from '../context/DataContext';
import { format } from 'date-fns';

const HeatmapLayer = ({ points, enabled }: { points: [number, number, number?][], enabled: boolean }) => {
  const map = useMap();
  useMemo(() => {
    let layer: any;
    if (enabled) {
      // @ts-ignore - leaflet.heat has no types
      layer = (L as any).heatLayer(points, { radius: 25, blur: 15, maxZoom: 17 });
      layer.addTo(map);
    }
    return () => {
      if (layer) map.removeLayer(layer);
    };
  }, [points, enabled, map]);
  return null;
};

const statusColor = (status: string) => {
  switch (status) {
    case 'ONLINE':
      return '#16a34a';
    case 'OFFLINE':
      return '#dc2626';
    case 'DEGRADED':
      return '#f59e0b';
    default:
      return '#3b82f6';
  }
};

const MapPanel = () => {
  const { incidents, devices } = useData();
  const [showHeat, setShowHeat] = useState(false);

  const center: [number, number] = [26.6528, 92.8120];
  const zoom = 12;

  const heatPoints: [number, number, number?][] = useMemo(
    () => incidents.map((i) => [i.location.lat, i.location.lng, Math.max(0.2, i.confidence)]),
    [incidents]
  );

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg border">
      <div className="absolute right-3 top-3 z-[1000] flex items-center gap-2 rounded bg-white/90 p-2 shadow">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showHeat} onChange={(e) => setShowHeat(e.target.checked)} /> Heatmap
        </label>
      </div>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {incidents.map((i) => (
          <Marker key={i.incident_id} position={[i.location.lat, i.location.lng]}>
            <Popup>
              <div className="min-w-[200px]">
                <div className="mb-1 text-sm font-semibold capitalize">{i.species} <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs">{i.threat_level}</span></div>
                <div className="mb-2 text-xs text-gray-600">{format(i.timestamp, 'PP p')}</div>
                {i.image_url && <img src={i.image_url} alt={i.species} className="h-24 w-full rounded object-cover" />}
                <div className="mt-2 text-xs text-gray-700">Device: {i.device_id}</div>
              </div>
            </Popup>
          </Marker>
        ))}
        {devices.map((d) => (
          <CircleMarker key={d.device_id} center={[d.location.lat, d.location.lng]} radius={8} pathOptions={{ color: statusColor(d.status), fillColor: statusColor(d.status), fillOpacity: 0.9 }}>
            <Popup>
              <div className="text-sm font-medium">{d.name}</div>
              <div className="text-xs text-gray-600">{d.device_id}</div>
              <div className="mt-1 text-xs">Status: <span className="font-medium">{d.status}</span></div>
            </Popup>
          </CircleMarker>
        ))}
        <HeatmapLayer points={heatPoints} enabled={showHeat} />
      </MapContainer>
    </div>
  );
};

export default MapPanel;
