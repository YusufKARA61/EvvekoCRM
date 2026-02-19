"use client";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
        <p className="text-gray-500">Sistem yapilandirmasini yonetin</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* SLA Ayarlari */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">SLA Ayarlari</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ilk Arama SLA (dakika)
              </label>
              <input
                type="number"
                defaultValue={30}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Randevu Onay Suresi (saat)
              </label>
              <input
                type="number"
                defaultValue={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Rapor Teslim Suresi (saat)
              </label>
              <input
                type="number"
                defaultValue={24}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </div>

        {/* Calisma Saatleri */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Calisma Saatleri</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Baslangic
              </label>
              <input
                type="time"
                defaultValue="09:00"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Bitis
              </label>
              <input
                type="time"
                defaultValue="18:00"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </div>

        {/* Hakedis Oranlari */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Hakedis Oranlari</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-600">Toplanti Ucreti</span>
              <span className="font-semibold text-gray-900">500 TL</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-600">Kesif/Rapor</span>
              <span className="font-semibold text-gray-900">750 TL</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-600">Teklif Asamasi Bonus</span>
              <span className="font-semibold text-gray-900">2.000 TL</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-600">Kapanis Komisyon</span>
              <span className="font-semibold text-gray-900">15.000 TL</span>
            </div>
          </div>
        </div>

        {/* Entegrasyon */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Entegrasyonlar</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-900">Yevveko API</p>
                <p className="text-sm text-gray-500">Talep senkronizasyonu</p>
              </div>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                Bagli
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-900">NetGSM SMS</p>
                <p className="text-sm text-gray-500">SMS bildirimleri</p>
              </div>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                Yapilandirilmadi
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700">
          Kaydet
        </button>
      </div>
    </div>
  );
}
