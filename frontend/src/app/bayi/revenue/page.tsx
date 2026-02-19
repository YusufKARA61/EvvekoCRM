"use client";

export default function BayiRevenuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hakedislerim</h1>
        <p className="text-gray-500">Hakedis takibi ve odeme gecmisi</p>
      </div>

      {/* Ozet Kartlari */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Bu Ay Kazanilan</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">0 TL</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <p className="text-sm font-medium text-green-600">Odenen</p>
          <p className="mt-1 text-3xl font-bold text-green-700">0 TL</p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-sm font-medium text-orange-600">Bekleyen</p>
          <p className="mt-1 text-3xl font-bold text-orange-700">0 TL</p>
        </div>
      </div>

      {/* Hakedis Gecmisi */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Hakedis Gecmisi</h3>
        </div>
        <div className="px-6 py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-3 text-sm text-gray-500">Henuz hakedis kaydi yok</p>
          <p className="text-xs text-gray-400 mt-1">
            Toplanti ve raporlar tamamlandiginda otomatik olusturulur
          </p>
        </div>
      </div>

      {/* Oran Tablosu */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Hakedis Oranlari</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <div>
              <p className="font-medium text-gray-900">Toplanti Ucreti</p>
              <p className="text-xs text-gray-500">Her gerceklesen toplanti icin</p>
            </div>
            <span className="text-lg font-bold text-gray-900">500 TL</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <div>
              <p className="font-medium text-gray-900">Kesif/Rapor</p>
              <p className="text-xs text-gray-500">Tamamlanan kesif raporu icin</p>
            </div>
            <span className="text-lg font-bold text-gray-900">750 TL</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <div>
              <p className="font-medium text-gray-900">Teklif Asamasi Bonus</p>
              <p className="text-xs text-gray-500">Teklif asamasina gecis</p>
            </div>
            <span className="text-lg font-bold text-gray-900">2.000 TL</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <div>
              <p className="font-medium text-gray-900">Kapanis Komisyon</p>
              <p className="text-xs text-gray-500">Anlasmasi kapanan proje</p>
            </div>
            <span className="text-lg font-bold text-gray-900">15.000 TL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
