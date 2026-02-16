import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Settings, ChefHat } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { useOrderStore } from '../store/orderStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Genel Bakış', end: true },
  { to: '/dashboard/menu', icon: UtensilsCrossed, label: 'Menü', end: false },
  { to: '/dashboard/settings', icon: Settings, label: 'Ayarlar', end: false },
];

export default function Sidebar() {
  const restaurantName = useSettingsStore((s) => s.settings.profile.name);
  const orders = useOrderStore((s) => s.orders);

  const pendingCount = useMemo(() => {
    return orders.filter((o) => o.status === 'new').length;
  }, [orders]);

  const initials = restaurantName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex flex-col z-50">
      {/* Restaurant Identity */}
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-200">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-sm truncate">{restaurantName}</h2>
            <p className="text-xs text-slate-400">Restoran Paneli</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">
          Yönetim
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-700/70 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {item.label === 'Genel Bakış' && pendingCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center pulse-badge">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2 text-slate-500">
          <ChefHat size={16} />
          <span className="text-xs">Menu Builder v1.0</span>
        </div>
      </div>
    </aside>
  );
}
