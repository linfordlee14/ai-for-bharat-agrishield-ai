import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
      {isAdmin ? (
        <div className="rounded border bg-white p-4 text-sm text-gray-700">
          Admin settings panel placeholder. Device configuration and thresholds will appear here.
        </div>
      ) : (
        <div className="rounded border bg-yellow-50 p-4 text-sm text-yellow-800">
          You do not have access to Settings. Log in with an admin account to manage configuration.
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
