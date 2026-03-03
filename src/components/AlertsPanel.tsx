import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import type { Incident } from '../models/types';
import { ArrowUpDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import IncidentDetail from './IncidentDetail';

const PAGE_SIZE = 20;

type SortKey = 'timestamp' | 'species' | 'threat_level' | 'confidence';

type SortState = { key: SortKey; dir: 'asc' | 'desc' };

const sorters: Record<SortKey, (a: Incident, b: Incident) => number> = {
  timestamp: (a, b) => a.timestamp - b.timestamp,
  species: (a, b) => a.species.localeCompare(b.species),
  threat_level: (a, b) => a.threat_level.localeCompare(b.threat_level),
  confidence: (a, b) => a.confidence - b.confidence,
};

const HeaderCell = ({ label, sortKey, sort, setSort }: { label: string; sortKey: SortKey; sort: SortState; setSort: (s: SortState) => void }) => {
  const active = sort.key === sortKey;
  const nextDir = active && sort.dir === 'asc' ? 'desc' : 'asc';
  return (
    <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">
      <button onClick={() => setSort({ key: sortKey, dir: nextDir })} className={`inline-flex items-center gap-1 ${active ? 'text-forest-green' : ''}`}>
        {label} <ArrowUpDown size={14} />
      </button>
    </th>
  );
};

const AlertsPanel = () => {
  const { incidents, isLoading } = useData();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>({ key: 'timestamp', dir: 'desc' });
  const [selected, setSelected] = useState<Incident | null>(null);

  const sorted = useMemo(() => {
    const arr = [...incidents].sort(sorters[sort.key]);
    return sort.dir === 'asc' ? arr : arr.reverse();
  }, [incidents, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goto = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="flex h-[420px] flex-col rounded-lg border bg-white">
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-2">
        <h3 className="text-sm font-semibold text-gray-700">Incident Alerts</h3>
        <div className="text-xs text-gray-500">{sorted.length} total</div>
      </div>

      {isLoading ? (
        <div className="p-4 text-sm text-gray-500">Loading…</div>
      ) : sorted.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-500">No incidents found. Try adjusting your filters.</div>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr>
                <HeaderCell label="Time" sortKey="timestamp" sort={sort} setSort={setSort} />
                <HeaderCell label="Species" sortKey="species" sort={sort} setSort={setSort} />
                <HeaderCell label="Threat" sortKey="threat_level" sort={sort} setSort={setSort} />
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Location</th>
                <HeaderCell label="Conf." sortKey="confidence" sort={sort} setSort={setSort} />
              </tr>
            </thead>
            <tbody>
              {pageItems.map((i) => (
                <tr key={i.incident_id} className="cursor-pointer border-b last:border-0 hover:bg-gray-50" onClick={() => setSelected(i)}>
                  <td className="px-3 py-2 text-gray-700">{formatDistanceToNow(i.timestamp, { addSuffix: true })}</td>
                  <td className="px-3 py-2 capitalize text-gray-700">{i.species}</td>
                  <td className="px-3 py-2 text-gray-700">
                    <span className={`rounded px-2 py-0.5 text-xs ${
                      i.threat_level === 'HIGH' ? 'bg-red-100 text-red-800' : i.threat_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>{i.threat_level}</span>
                  </td>
                  <td className="px-3 py-2 text-gray-700">{i.location.name || `${i.location.lat.toFixed(4)}, ${i.location.lng.toFixed(4)}`}</td>
                  <td className="px-3 py-2 text-gray-700">{Math.round(i.confidence * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="flex shrink-0 items-center justify-between border-t px-4 py-2 text-sm">
          <div>Page {page} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => goto(1)} className="rounded border px-2 py-1 disabled:opacity-50" disabled={page === 1}>First</button>
            <button onClick={() => goto(page - 1)} className="rounded border px-2 py-1 disabled:opacity-50" disabled={page === 1}>Prev</button>
            <button onClick={() => goto(page + 1)} className="rounded border px-2 py-1 disabled:opacity-50" disabled={page === totalPages}>Next</button>
            <button onClick={() => goto(totalPages)} className="rounded border px-2 py-1 disabled:opacity-50" disabled={page === totalPages}>Last</button>
          </div>
        </div>
      )}

      {selected && <IncidentDetail incident={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default AlertsPanel;
