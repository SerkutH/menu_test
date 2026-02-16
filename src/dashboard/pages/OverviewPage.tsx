import { useEffect, useMemo } from 'react';
import { Bell } from 'lucide-react';
import { useOrderStore } from '../store/orderStore';
import { useSettingsStore } from '../store/settingsStore';
import StatsCards from '../components/StatsCards';
import OrderCard from '../components/OrderCard';

export default function OverviewPage() {
  const restaurantName = useSettingsStore((s) => s.settings.profile.name);
  const allOrders = useOrderStore((s) => s.orders);
  const statusFilter = useOrderStore((s) => s.statusFilter);
  const setStatusFilter = useOrderStore((s) => s.setStatusFilter);
  const selectedOrder = useOrderStore((s) => s.selectedOrder);
  const selectOrder = useOrderStore((s) => s.selectOrder);
  const subscribe = useOrderStore((s) => s.subscribe);

  // Subscribe to real-time order events from the customer app
  useEffect(() => {
    const unsubscribe = subscribe();
    return unsubscribe;
  }, [subscribe]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return allOrders;
    return allOrders.filter((o) => o.status === statusFilter);
  }, [allOrders, statusFilter]);

  const pendingCount = useMemo(() => {
    return allOrders.filter((o) => o.status === 'new').length;
  }, [allOrders]);

  const tabs = [
    { key: 'all' as const, label: 'Tümü' },
    { key: 'new' as const, label: 'Yeni' },
    { key: 'preparing' as const, label: 'Hazırlanıyor' },
    { key: 'on_the_way' as const, label: 'Yolda' },
    { key: 'delivered' as const, label: 'Teslim Edildi' },
    { key: 'cancelled' as const, label: 'İptal' },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{restaurantName}</h1>
          <p className="text-sm text-gray-500 mt-1">Genel bakış ve sipariş yönetimi</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Notification badge */}
          <div className="relative">
            <button className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
              <Bell size={18} />
            </button>
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center pulse-badge">
                {pendingCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Orders Section */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Siparişler</h2>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Order List + Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Left: Order list */}
          <div className="lg:col-span-2 space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto pr-1">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">
                  {allOrders.length === 0
                    ? 'Henüz sipariş yok — müşteri uygulamasından sipariş verin'
                    : 'Bu filtrede sipariş bulunmuyor'}
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} compact />
              ))
            )}
          </div>

          {/* Right: Order detail */}
          <div className="lg:col-span-3">
            {selectedOrder ? (
              <OrderCard order={selectedOrder} />
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
                <p className="text-sm">Detayını görmek için bir sipariş seçin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
