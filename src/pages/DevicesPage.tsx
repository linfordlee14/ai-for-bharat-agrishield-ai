import DeviceStatusPanel from '../components/DeviceStatusPanel';

const DevicesPage = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Devices</h2>
      <DeviceStatusPanel />
    </div>
  );
};

export default DevicesPage;
