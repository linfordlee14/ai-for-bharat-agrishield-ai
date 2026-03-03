import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import type { Species, ThreatLevel } from '../models/types';

const speciesOptions: Species[] = ['elephant', 'boar', 'deer', 'leopard', 'human', 'unknown'];
const timeOptions = [
  { label: 'Last hour', value: '1h' },
  { label: 'Last 6 hours', value: '6h' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
];
const threatOptions: ThreatLevel[] = ['HIGH', 'MEDIUM', 'LOW'];

const FilterPanel = () => {
  const { filters, setFilters } = useData();

  const onToggleSpecies = (s: Species) => {
    setFilters((f) => {
      const exists = f.species.includes(s);
      return { ...f, species: exists ? f.species.filter((x) => x !== s) : [...f.species, s] };
    });
  };

  const onToggleThreat = (t: ThreatLevel) => {
    setFilters((f) => {
      const exists = f.threat_level.includes(t);
      return { ...f, threat_level: exists ? f.threat_level.filter((x) => x !== t) : [...f.threat_level, t] };
    });
  };

  const onTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((f) => ({ ...f, time_range: e.target.value }));
  };

  const hasActive = useMemo(() => filters.species.length > 0 || filters.threat_level.length > 0 || !!filters.time_range, [filters]);

  const clearAll = () => {
    setFilters({ species: [], threat_level: [], time_range: '24h' });
  };

  return (
    <aside className="w-full max-w-[280px] shrink-0 rounded-lg border bg-white p-4 md:sticky md:top-20 md:h-[calc(100vh-6rem)] md:overflow-auto">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
        <button onClick={clearAll} className="text-xs text-forest-green hover:underline">Clear All</button>
      </div>

      <div className="mb-4">
        <div className="mb-2 text-xs font-medium uppercase text-gray-500">Species</div>
        <div className="grid grid-cols-2 gap-2">
          {speciesOptions.map((s) => (
            <label key={s} className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={filters.species.includes(s)} onChange={() => onToggleSpecies(s)} />
              <span className="capitalize">{s}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 text-xs font-medium uppercase text-gray-500">Time Range</div>
        <select value={filters.time_range} onChange={onTimeChange} className="w-full rounded border px-2 py-2 text-sm">
          {timeOptions.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <div className="mb-2 text-xs font-medium uppercase text-gray-500">Threat Level</div>
        <div className="flex flex-col gap-2">
          {threatOptions.map((t) => (
            <label key={t} className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={filters.threat_level.includes(t)} onChange={() => onToggleThreat(t)} />
              <span className="capitalize">{t}</span>
            </label>
          ))}
        </div>
      </div>

      {hasActive && (
        <div className="mt-4 text-xs text-gray-500">Active filters apply to map and alerts table.</div>
      )}
    </aside>
  );
};

export default FilterPanel;
