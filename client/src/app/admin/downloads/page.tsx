'use client';

import React, { useState, useEffect } from 'react';

const DownloadPage = () => {
    // Statik yedek linkler
    const defaultRepoUrl = "https://github.com/beardKelcho/sk_pro_fullstack_website/releases/latest";
    const [downloadLinks, setDownloadLinks] = useState({
        mac: defaultRepoUrl,
        win: defaultRepoUrl,
        android: defaultRepoUrl
    });

    const [version, setVersion] = useState("Yükleniyor...");

    useEffect(() => {
        // Github API'den dinamik olarak en son sürümün bilgilerini al
        fetch('https://api.github.com/repos/beardKelcho/sk_pro_fullstack_website/releases/latest')
            .then(res => res.json())
            .then(data => {
                if (data.assets && data.assets.length > 0) {
                    setVersion(data.tag_name || 'En Son Sürüm');

                    const macAsset = data.assets.find((a: any) => a.name.endsWith('.dmg'));
                    const winAsset = data.assets.find((a: any) => a.name.endsWith('.exe'));
                    const apkAsset = data.assets.find((a: any) => a.name.endsWith('.apk'));

                    setDownloadLinks({
                        mac: macAsset ? macAsset.browser_download_url : downloadLinks.mac,
                        win: winAsset ? winAsset.browser_download_url : downloadLinks.win,
                        android: apkAsset ? apkAsset.browser_download_url : downloadLinks.android
                    });
                } else {
                    setVersion('Sürüm Bulunamadı');
                }
            })
            .catch(err => {
                console.error("En son sürüm bilgileri alınamadı:", err);
                setVersion('Bağlantı Hatası');
            });
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Masaüstü & Mobil Uygulamalar
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Sistemi tüm işletim sistemlerinde tarayıcı sekmesi olmadan daha yüksek performans ile kullanmak için <strong className="text-[#0066CC] dark:text-primary-light">{version}</strong> uygulamasını indirin.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {/* Apple macOS */}
                <div className="glass dark:glass-dark rounded-2xl p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
                        <svg className="w-8 h-8 text-gray-800 dark:text-gray-200" viewBox="0 0 384 512" fill="currentColor">
                            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">macOS (Apple Silicon / Intel)</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 h-12">
                        Apple M1/M2/M3 ve Intel işlemcili tüm Mac bilgisayarlar için tam erişimlidir.
                    </p>
                    <div className="flex flex-col gap-3">
                        <a href={downloadLinks.mac} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-3 bg-[#0066CC] hover:bg-[#0052a3] text-white rounded-lg transition-colors font-medium">
                            Apple Silicon (M1/M2/M3)
                        </a>
                        <button disabled className="block w-full text-center py-3 bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-500 rounded-lg font-medium shadow-sm cursor-not-allowed" title="Intel derlemesi CI sunucusu üzerinden otomatik indirilecektir.">
                            Eski Nesil Intel Cihazlar (Yakında)
                        </button>
                    </div>
                </div>

                {/* Windows */}
                <div className="glass dark:glass-dark rounded-2xl p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
                        <svg className="w-8 h-8 text-[#0078D7]" viewBox="0 0 512 512" fill="currentColor">
                            <path d="M0 93.2l208.5-29.2v177.3H0V93.2zm208.5 204.3V448L0 418.8V297.4h208.5zM243.6 88l268.4-38v191.3H243.6V88zm268.4 209.4V462l-268.4-38.3V297.4h268.4z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Windows </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 h-12">
                        Windows 10 ve 11 (64-bit) işletim sistemiyle tam optimizasyon sağlar.
                    </p>
                    <div className="flex flex-col gap-3">
                        <a href={downloadLinks.win} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-3 bg-[#0078D7] hover:bg-[#005fb8] text-white rounded-lg transition-colors font-medium shadow-md">
                            Windows İndir (x64)
                        </a>
                        <button disabled className="block w-full text-center py-3 bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-500 rounded-lg font-medium shadow-sm cursor-not-allowed">
                            Windows İndir (ARM64 Yakında)
                        </button>
                    </div>
                </div>

                {/* Linux */}
                <div className="glass dark:glass-dark rounded-2xl p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-6">
                        <svg className="w-8 h-8 text-orange-500" viewBox="0 0 448 512" fill="currentColor">
                            <path d="M224 51c72 0 131 59 131 131s-59 131-131 131-131-59-131-131S152 51 224 51zm0-34C133.1 17 59 91.1 59 182s74.1 165 165 165 165-74.1 165-165S314.9 17 224 17zm87 289H137v85h174v-85zm-43 14c19.3 0 35 15.7 35 35s-15.7 35-35 35-35-15.7-35-35 15.7-35 35-35zM448 426v52H0v-52h448z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Linux (AppImage)</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 h-12">
                        Ubuntu, Debian serisi ve diğer popüler tüm dağıtımlar için taşınabilir dosyadır.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button disabled className="block w-full text-center py-3 bg-gray-600/50 text-gray-300 cursor-not-allowed rounded-lg font-medium" title="Kısa süre içerisinde derlenecektir.">
                            Linux İndir (Yakında)
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <svg className="w-6 h-6 text-[#00C49F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Mobil Cihazlar (Akıllı Telefonlar)
                        </h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            İşletim sisteminize göre doğrudan kurulum veya ana erkrana ekleme (PWA) işlemini yapabilirsiniz.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Android */}
                    <div className="glass dark:glass-dark rounded-xl p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-5">
                            <svg className="w-7 h-7 text-[#3DDC84]" viewBox="0 0 512 512" fill="currentColor">
                                <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 141.5L280.3 275l106-106L47 141.5zm253.3 162.6l-58.2 58.2-13.3-13.3-25.9 25.9 83.1 83.1c9.4 9.4 24.6 9.4 33.9 0l83.1-83.1-83.1-83.1 13.3-13.3 58.2-58.2L300.3 304l-25.9 25.9-106.3-106.3-58.2 58.2L280 452c16.1 16.1 42.4 16.1 58.5 0L496.2 294.5 325.3 502.2c9.4 9.4 24.6 9.4 33.9 0l110.1-110.1 23.4 46.1c-13.9 14.1-36.5 14.2-50.5 .3zM153 331L34.1 212.1 6.5 264C1 274.6 1.7 287.5 8 297.4l119 191.1L153 331z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Android Sürümü (.apk)</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                            Android cihazınıza SK Production uygulamasını direkt market kullanmadan indirebilir ve kurabilirsiniz.
                        </p>
                        <a href={downloadLinks.android} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-2.5 bg-[#3DDC84] hover:bg-[#34BE71] text-white rounded-lg transition-colors font-medium shadow-sm">
                            Android (APK) İndir
                        </a>
                    </div>

                    {/* iOS (iPhone) PWA Instructions */}
                    <div className="glass dark:glass-dark rounded-xl p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                        <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-5">
                            <svg className="w-7 h-7 text-gray-800 dark:text-gray-200" viewBox="0 0 384 512" fill="currentColor">
                                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Apple iOS (iPhone / iPad)</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                            Apple politikaları gereği doğrudan indirme engellenmektedir. Cihazınıza uygulama olarak kurmak için lütfen iPhone&apos;unuzdan Safari ile bu siteye girin ve şu adımları izleyin:
                        </p>
                        <ol className="list-decimal ml-4 text-sm text-gray-700 dark:text-gray-300 space-y-2">
                            <li>Tarayıcının alt menüsündeki <strong>Paylaş</strong> (Kare içinden ok çıkan ikon) düğmesine dokunun.</li>
                            <li>Açılan menüyü aşağı kaydırıp <strong>Ana Ekrana Ekle</strong> (Add to Home Screen) seçeneğine tıklayın.</li>
                            <li>Sağ üst köşedeki <strong>Ekle</strong> butonuna basın. Uygulamanız hazır!</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DownloadPage;
