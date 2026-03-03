import AlertsPanel from '../components/AlertsPanel';

const IncidentsPage = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Incidents</h2>
      <AlertsPanel />
    </div>
  );
};

export default IncidentsPage;
