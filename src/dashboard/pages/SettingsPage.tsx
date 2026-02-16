import { useState } from 'react';
import { Save, RotateCcw, Store, Clock, Truck, Bell } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

type SettingsTab = 'profile' | 'hours' | 'delivery' | 'notifications';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const settings = useSettingsStore((s) => s.settings);
  const isDirty = useSettingsStore((s) => s.isDirty);
  const updateProfile = useSettingsStore((s) => s.updateProfile);
  const updateWorkingHours = useSettingsStore((s) => s.updateWorkingHours);
  const updateDelivery = useSettingsStore((s) => s.updateDelivery);
  const setOrderAcceptMode = useSettingsStore((s) => s.setOrderAcceptMode);
  const setNotificationPhone = useSettingsStore((s) => s.setNotificationPhone);
  const saveSettings = useSettingsStore((s) => s.saveSettings);
  const resetSettings = useSettingsStore((s) => s.resetSettings);

  const tabs = [
    { key: 'profile' as const, label: 'İşletme Bilgileri', icon: Store },
    { key: 'hours' as const, label: 'Çalışma Saatleri', icon: Clock },
    { key: 'delivery' as const, label: 'Teslimat Ayarları', icon: Truck },
    { key: 'notifications' as const, label: 'Bildirimler', icon: Bell },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
          <p className="text-sm text-gray-500 mt-1">Restoran ayarlarınızı yapılandırın</p>
        </div>
        {isDirty && (
          <div className="flex items-center gap-2">
            <button
              onClick={resetSettings}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <RotateCcw size={15} />
              Sıfırla
            </button>
            <button
              onClick={saveSettings}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Save size={15} />
              Kaydet
            </button>
          </div>
        )}
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar tabs */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-slate-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-gray-900 mb-4">İşletme Bilgileri</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Restoran Adı</label>
                    <input
                      type="text"
                      value={settings.profile.name}
                      onChange={(e) => updateProfile({ name: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">URL Kısaltması (Slug)</label>
                    <input
                      type="text"
                      value={settings.profile.slug}
                      onChange={(e) => updateProfile({ slug: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Slogan</label>
                  <input
                    type="text"
                    value={settings.profile.tagline}
                    onChange={(e) => updateProfile({ tagline: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Adres</label>
                  <textarea
                    value={settings.profile.address}
                    onChange={(e) => updateProfile({ address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
                    <input
                      type="tel"
                      value={settings.profile.phone}
                      onChange={(e) => updateProfile({ phone: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">E-posta</label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => updateProfile({ email: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Working Hours Tab */}
            {activeTab === 'hours' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Çalışma Saatleri</h3>
                <div className="space-y-3">
                  {settings.workingHours.map((wh) => (
                    <div
                      key={wh.dayKey}
                      className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                        wh.isOpen ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      {/* Day name */}
                      <span className="w-24 text-sm font-medium text-gray-700">{wh.day}</span>

                      {/* Toggle */}
                      <button
                        onClick={() => updateWorkingHours(wh.dayKey, { isOpen: !wh.isOpen })}
                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                          wh.isOpen ? 'bg-teal-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                            wh.isOpen ? 'left-[22px]' : 'left-0.5'
                          }`}
                        />
                      </button>

                      {/* Times */}
                      {wh.isOpen ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={wh.openTime}
                            onChange={(e) => updateWorkingHours(wh.dayKey, { openTime: e.target.value })}
                            className="px-2.5 py-1.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
                          />
                          <span className="text-gray-400 text-sm">—</span>
                          <input
                            type="time"
                            value={wh.closeTime}
                            onChange={(e) => updateWorkingHours(wh.dayKey, { closeTime: e.target.value })}
                            className="px-2.5 py-1.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
                          />
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 flex-1">Kapalı</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Tab */}
            {activeTab === 'delivery' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Teslimat Ayarları</h3>

                {/* Delivery modes */}
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Teslimat</p>
                      <p className="text-xs text-gray-500">Müşterilere adrese teslimat yapılsın</p>
                    </div>
                    <button
                      onClick={() => updateDelivery({ deliveryEnabled: !settings.delivery.deliveryEnabled })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        settings.delivery.deliveryEnabled ? 'bg-teal-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                          settings.delivery.deliveryEnabled ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Gel Al</p>
                      <p className="text-xs text-gray-500">Müşteriler restorana gelip alabilsin</p>
                    </div>
                    <button
                      onClick={() => updateDelivery({ pickupEnabled: !settings.delivery.pickupEnabled })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        settings.delivery.pickupEnabled ? 'bg-teal-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                          settings.delivery.pickupEnabled ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </label>
                </div>

                {/* Delivery params */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Teslimat Ücreti (₺)</label>
                    <input
                      type="number"
                      value={settings.delivery.deliveryFee}
                      onChange={(e) => updateDelivery({ deliveryFee: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ücretsiz Teslimat Limiti (₺)</label>
                    <input
                      type="number"
                      value={settings.delivery.freeDeliveryThreshold}
                      onChange={(e) => updateDelivery({ freeDeliveryThreshold: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum Sipariş Tutarı (₺)</label>
                    <input
                      type="number"
                      value={settings.delivery.minOrderAmount}
                      onChange={(e) => updateDelivery({ minOrderAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Teslimat Yarıçapı (km)</label>
                    <input
                      type="number"
                      value={settings.delivery.deliveryRadius}
                      onChange={(e) => updateDelivery({ deliveryRadius: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ort. Hazırlık Süresi (dk)</label>
                    <input
                      type="number"
                      value={settings.delivery.avgPrepTime}
                      onChange={(e) => updateDelivery({ avgPrepTime: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                    />
                  </div>
                </div>

                {/* Order accept mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Sipariş Kabul Modu</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'auto' as const, label: 'Otomatik Kabul', desc: 'Tüm siparişler otomatik kabul edilir' },
                      { key: 'manual' as const, label: 'Manuel Kabul', desc: 'Her siparişi elle onaylayın' },
                    ].map((mode) => (
                      <label
                        key={mode.key}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          settings.orderAcceptMode === mode.key
                            ? 'border-slate-900 bg-slate-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="radio"
                            name="acceptMode"
                            checked={settings.orderAcceptMode === mode.key}
                            onChange={() => setOrderAcceptMode(mode.key)}
                            className="mt-0.5"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{mode.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{mode.desc}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Bildirim Ayarları</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    WhatsApp Bildirim Numarası
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Yeni sipariş bildirimleri bu numaraya gönderilecek
                  </p>
                  <input
                    type="tel"
                    value={settings.notificationPhone}
                    onChange={(e) => setNotificationPhone(e.target.value)}
                    placeholder="+90 5xx xxx xx xx"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Bilgi:</span> Sipariş bildirimleri WhatsApp Business API üzerinden
                    gönderilmektedir. Bildirim numaranızın doğru olduğundan emin olun.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
