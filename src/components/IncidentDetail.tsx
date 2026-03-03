import { X, AlertTriangle } from 'lucide-react';
import type { Incident } from '../models/types';
import { format } from 'date-fns';

interface Props {
  incident: Incident | null;
  onClose: () => void;
}

const Badge = ({ children, color = 'gray' }: { children: React.ReactNode; color?: 'red'|'yellow'|'green'|'gray' }) => {
  const map: Record<string, string> = {
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    gray: 'bg-gray-100 text-gray-800',
  };
  return <span className={`rounded px-2 py-0.5 text-xs ${map[color]}`}>{children}</span>;
};

const IncidentDetail = ({ incident, onClose }: Props) => {
  if (!incident) return null;

  const threatColor = incident.threat_level === 'HIGH' ? 'red' : incident.threat_level === 'MEDIUM' ? 'yellow' : 'green';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle size={16} className="text-forest-green" /> Incident {incident.incident_id}
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-2">
          {incident.image_url ? (
            <img src={incident.image_url} alt={incident.species} className="h-64 w-full rounded object-cover md:h-full" />
          ) : (
            <div className="flex h-64 items-center justify-center rounded bg-gray-100 text-gray-500">No image</div>
          )}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge color={threatColor as any}>{incident.threat_level}</Badge>
              <span className="capitalize">{incident.species}</span>
              <span className="ml-auto text-xs text-gray-500">{format(incident.timestamp, 'PP p')}</span>
            </div>
            <div>Device: <span className="font-medium">{incident.device_id}</span></div>
            <div>Location: <span className="font-medium">{incident.location.name || `${incident.location.lat.toFixed(4)}, ${incident.location.lng.toFixed(4)}`}</span></div>
            <div>Confidence: <span className="font-medium">{Math.round(incident.confidence * 100)}%</span></div>
            <div>Status: <span className="font-medium">{incident.status}</span></div>
            <div className="pt-2 text-gray-700">{incident.notes || 'No notes.'}</div>
            <div className="pt-2">
              <div className="text-xs font-semibold text-gray-600">Deterrence</div>
              <div className="text-xs text-gray-700">Sound: {incident.deterrence_action.sound_played ? 'Yes' : 'No'}, Lights: {incident.deterrence_action.lights_activated ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetail;
