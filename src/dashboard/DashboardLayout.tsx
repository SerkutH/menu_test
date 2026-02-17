import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { useMenuStore } from './store/menuStore';
import { useSettingsStore } from './store/settingsStore';

export default function DashboardLayout() {
  const hydrateMenu = useMenuStore((s) => s.hydrateFromFirebase);
  const hydrateSettings = useSettingsStore((s) => s.hydrateFromFirebase);

  useEffect(() => {
    const unsubMenu = hydrateMenu();
    const unsubSettings = hydrateSettings();
    return () => {
      unsubMenu();
      unsubSettings();
    };
  }, [hydrateMenu, hydrateSettings]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
