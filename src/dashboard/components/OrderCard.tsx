import { Clock, MapPin, Phone, User, MessageCircle, ChevronRight, Bike, Store } from 'lucide-react';
import { DashboardOrder, DashboardOrderStatus } from '../types';
import { useOrderStore } from '../store/orderStore';

const statusConfig: Record<DashboardOrderStatus, { label: string; color: string; bg: string }> = {
  new: { label: 'Yeni', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  preparing: { label: 'Hazırlanıyor', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  on_the_way: { label: 'Yolda', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  delivered: { label: 'Teslim Edildi', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  cancelled: { label: 'İptal', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

const nextStatus: Partial<Record<DashboardOrderStatus, { status: DashboardOrderStatus; label: string }>> = {
  new: { status: 'preparing', label: 'Hazırlanıyor' },
  preparing: { status: 'on_the_way', label: 'Yola Çıktı' },
  on_the_way: { status: 'delivered', label: 'Teslim Edildi' },
};

interface Props {
  order: DashboardOrder;
  compact?: boolean;
}

export default function OrderCard({ order, compact }: Props) {
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus);
  const selectOrder = useOrderStore((s) => s.selectOrder);
  const config = statusConfig[order.status];
  const next = nextStatus[order.status];

  const timeAgo = getTimeAgo(order.createdAt);
  const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');

  if (compact) {
    return (
      <button
        onClick={() => selectOrder(order)}
        className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-sm ${
          order.status === 'new' ? 'border-blue-200 bg-blue-50/50' : 'border-gray-100 bg-white'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900">{order.orderNumber}</span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${config.bg} ${config.color}`}>
              {config.label}
            </span>
          </div>
          <span className="text-xs text-gray-400">{timeAgo}</span>
        </div>
        <p className="text-sm text-gray-600 truncate">{itemsSummary}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-semibold text-gray-900">₺{order.total}</span>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {order.deliveryType === 'delivery' ? <Bike size={13} /> : <Store size={13} />}
            <span>{order.deliveryType === 'delivery' ? 'Teslimat' : 'Gel Al'}</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${
      order.status === 'new' ? 'border-blue-200 shadow-sm shadow-blue-100' : 'border-gray-100'
    } bg-white`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-900">{order.orderNumber}</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${config.bg} ${config.color}`}>
              {config.label}
            </span>
            {order.customer.source === 'whatsapp' && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <MessageCircle size={12} />
                WhatsApp
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock size={14} />
            <span className="text-sm">{timeAgo}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Customer */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <User size={14} className="text-gray-400" />
            {order.customer.name}
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <Phone size={13} className="text-gray-400" />
            {order.customer.phone.slice(-4)}
          </div>
        </div>

        {/* Delivery Type */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          {order.deliveryType === 'delivery' ? (
            <>
              <Bike size={14} className="text-gray-400" />
              <span>Teslimat</span>
              {order.address && (
                <>
                  <span className="text-gray-300 mx-1">·</span>
                  <MapPin size={13} className="text-gray-400" />
                  <span className="text-gray-500 truncate">{order.address.district}</span>
                </>
              )}
            </>
          ) : (
            <>
              <Store size={14} className="text-gray-400" />
              <span>Gel Al</span>
            </>
          )}
        </div>

        {/* Items */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="space-y-1.5">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  <span className="font-medium">{item.quantity}x</span> {item.name}
                </span>
                <span className="text-gray-500">₺{item.lineTotal}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-2 pt-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Toplam</span>
            <span className="text-sm font-bold text-gray-900">₺{order.total}</span>
          </div>
        </div>

        {/* Note */}
        {order.note && (
          <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
            <span className="font-medium">Not:</span> {order.note}
          </div>
        )}
      </div>

      {/* Actions */}
      {(next || order.status === 'new') && (
        <div className="p-4 pt-0 flex gap-2">
          {order.status === 'new' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'cancelled')}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Reddet
            </button>
          )}
          {next && (
            <button
              onClick={() => updateOrderStatus(order.id, next.status)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              {next.label}
              <ChevronRight size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Şimdi';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  return `${Math.floor(hours / 24)} gün önce`;
}
