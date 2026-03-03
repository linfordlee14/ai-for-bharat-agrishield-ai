import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { formatDistanceToNow } from 'date-fns';

const StatusDot = ({ color }: { color: string }) => (
  <span className={`inline-block h-2.5 w-2.5 rounded-full`} style={{ backgroundColor: color }} />
);

const colorFor = (status: string) =>
  status === 'ONLINE' ? '#16a34a' : status === 'DEGRADED' ? '#f59e0b' : '#dc2626';

const DeviceStatusPanel = () => {
  const { devices, isLoading } = useData();

  const sorted = useMemo(() => {
    return [...devices].sort((a, b) => a.name.localeCompare(b.name));
  }, [devices]);

  return (
    <div className="rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 className="text-sm font-semibold text-gray-700">Devices</h3>
        <div className="text-xs text-gray-500">{sorted.length} total</div>
      </div>
      {isLoading ? (
        <div className="p-4 text-sm text-gray-500">Loading…</div>
      ) : (
        <ul className="divide-y">
          {sorted.map((d) => (
            <li key={d.device_id} className="flex items-center gap-3 px-4 py-2 text-sm">
              <StatusDot color={colorFor(d.status)} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-gray-800">{d.name}</div>
                <div className="truncate text-xs text-gray-500">{d.device_id}</div>
              </div>
              <div className="text-right text-xs text-gray-600">
                <div>{d.status}</div>
                <div className="text-gray-500">{formatDistanceToNow(d.last_heartbeat, { addSuffix: true })}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DeviceStatusPanel;
