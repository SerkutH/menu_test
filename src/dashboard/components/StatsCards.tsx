import { useMemo } from 'react';
import { ShoppingBag, TrendingUp, Receipt, Clock } from 'lucide-react';
import { useOrderStore } from '../store/orderStore';

export default function StatsCards() {
  const orders = useOrderStore((s) => s.orders);

  const todayOrders = useMemo(() => {
    const today = new Date().toDateString();
    return orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  }, [orders]);

  const todayRevenue = useMemo(() => {
    return todayOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);
  }, [todayOrders]);

  const avgOrderValue = useMemo(() => {
    const valid = todayOrders.filter((o) => o.status !== 'cancelled');
    if (valid.length === 0) return 0;
    return Math.round(valid.reduce((sum, o) => sum + o.total, 0) / valid.length);
  }, [todayOrders]);

  const pendingCount = useMemo(() => {
    return orders.filter((o) => o.status === 'new').length;
  }, [orders]);

  const stats = [
    {
      label: 'Bugünkü Siparişler',
      value: todayOrders.length.toString(),
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      label: 'Bugünkü Gelir',
      value: `₺${todayRevenue.toLocaleString('tr-TR')}`,
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600',
      iconBg: 'bg-emerald-100',
    },
    {
      label: 'Ort. Sipariş Tutarı',
      value: `₺${avgOrderValue.toLocaleString('tr-TR')}`,
      icon: Receipt,
      color: 'bg-purple-50 text-purple-600',
      iconBg: 'bg-purple-100',
    },
    {
      label: 'Bekleyen Siparişler',
      value: pendingCount.toString(),
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
      iconBg: 'bg-amber-100',
      pulse: pendingCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.pulse ? 'text-amber-600' : 'text-gray-900'}`}>
                {stat.value}
              </p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.iconBg} ${stat.pulse ? 'pulse-badge' : ''}`}>
              <stat.icon size={20} className={stat.color.split(' ')[1]} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
