import { Bell, LogOut, BadgeAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-4">
      <div className="flex items-center gap-3">
        {isDemo && (
          <span className="inline-flex items-center gap-1 rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            <BadgeAlert size={14} /> DEMO MODE
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded p-2 text-gray-600 hover:bg-gray-100" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute -right-0 -top-0 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">0</span>
        </button>
        <div className="text-sm text-gray-700">{user?.email}</div>
        <button onClick={logout} className="inline-flex items-center gap-1 rounded bg-forest-green px-3 py-1.5 text-sm text-white hover:bg-forest-hover">
          <LogOut size={14} /> Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
