import FilterPanel from '../components/FilterPanel';
import MapPanel from '../components/MapPanel';
import AlertsPanel from '../components/AlertsPanel';
import DeviceStatusPanel from '../components/DeviceStatusPanel';

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="md:sticky md:top-20">
        <FilterPanel />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="lg:w-[60%]">
            <MapPanel />
          </div>
          <div className="lg:w-[40%]">
            <AlertsPanel />
          </div>
        </div>
        <DeviceStatusPanel />
      </div>
    </div>
  );
};

export default DashboardPage;
