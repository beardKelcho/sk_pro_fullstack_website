import Image from 'next/image';

export default function MaintenancePage() {
    return (
        // KURAL 1: Siyah-Beyaz Tema ve Footer Gizleme - fixed inset-0 z-[9999] bg-black
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-white p-4">

            <div className="max-w-xl w-full text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
                {/* KURAL 2: Logo Ekleme */}
                <div className="mb-12 flex justify-center">
                    <div className="relative h-20 w-48">
                        <Image
                            src="/images/sk-logo.png"
                            alt="SK Production Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Main Heading & Description */}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    Bakımdayız
                </h1>

                <div className="h-1 w-24 bg-white/20 mx-auto rounded-full mb-8" />

                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                    Daha iyi hizmet verebilmek için sistemimizde kısa süreli bir güncelleme yapıyoruz.
                    Anlayışınız için teşekkür ederiz.
                </p>



                {/* KURAL 3 & 4: Sadece E-posta, Sabit Adres */}
                <div className="flex flex-col items-center gap-3">
                    <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">Bize Ulaşın</p>
                    <a
                        href="mailto:info@skpro.com.tr"
                        className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
                    >
                        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                            <svg
                                className="w-5 h-5 text-gray-200"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m3 8 7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"
                                />
                            </svg>
                        </div>
                        <span className="text-gray-200 text-lg font-medium group-hover:text-white transition-colors">
                            info@skpro.com.tr
                        </span>
                    </a>
                </div>

                {/* Animated dots for subtle activity indication */}
                <div className="mt-16 flex justify-center gap-2 opacity-30">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"
                            style={{
                                animationDelay: `${i * 0.2}s`,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
