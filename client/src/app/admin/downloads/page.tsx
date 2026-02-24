'use client';

import React from 'react';

const DownloadPage = () => {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Masaüstü & Mobil Uygulamalar
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Sistemi tüm işletim sistemlerinde tarayıcı sekmesi olmadan daha yüksek performans ile kullanmak için işletim sisteminize uygun uygulamayı indirin.
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
                        <a href="/downloads/SK-Production-mac-arm64.dmg" download className="block w-full text-center py-3 bg-[#0066CC] hover:bg-[#0052a3] text-white rounded-lg transition-colors font-medium">
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
                        <a href="/downloads/SK-Production-win-x64.exe" download className="block w-full text-center py-3 bg-[#0078D7] hover:bg-[#005fb8] text-white rounded-lg transition-colors font-medium shadow-md">
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
            <div className="mt-8 p-6 bg-gradient-to-r from-[#0066CC]/10 to-[#00C49F]/10 rounded-2xl border border-white/10 dark:border-white/5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Mobil Uygulamalar (Test Aşamasında)</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    iOS ve Android cihazlarınız için geliştirilen yerel uygulamaların beta süreçleri arka planda devam etmektedir. Tamamlandığında resmi uygulama mağazalarından veya kurulum linkiyle paylaşılacaktır.
                </p>
            </div>
        </div>
    );
};

export default DownloadPage;
