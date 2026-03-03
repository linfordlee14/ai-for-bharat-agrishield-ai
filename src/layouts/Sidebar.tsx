import { NavLink } from 'react-router-dom';
import { Home, AlertTriangle, MonitorSmartphone, Settings, Shield } from 'lucide-react';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
    isActive ? 'bg-forest-light text-white' : 'text-gray-700 hover:bg-gray-100'
  }`;

const Sidebar = () => {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white p-4 md:block">
      <div className="mb-6 flex items-center gap-2">
        <Shield className="h-6 w-6 text-forest-green" />
        <div className="text-xl tracking-tight">
          <span className="font-bold text-forest-green">AgriShield</span>
          <span className="font-normal text-gray-500 ml-1">AI</span>
        </div>
      </div>
      <nav className="flex flex-col gap-2">
        <NavLink to="/dashboard" className={navLinkClass}>
          <Home size={18} /> Dashboard
        </NavLink>
        <NavLink to="/incidents" className={navLinkClass}>
          <AlertTriangle size={18} /> Incidents
        </NavLink>
        <NavLink to="/devices" className={navLinkClass}>
          <MonitorSmartphone size={18} /> Devices
        </NavLink>
        <NavLink to="/settings" className={navLinkClass}>
          <Settings size={18} /> Settings
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
