import Image from 'next/image';

export default function MaintenanceScreen() {
  return (
    <div data-testid="maintenance-page" className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black p-4 text-white">
      <div className="max-w-xl w-full text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
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

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
          Bakimdayiz
        </h1>

        <div className="mx-auto mb-8 h-1 w-24 rounded-full bg-white/20" />

        <p className="mb-8 text-lg leading-relaxed text-gray-400">
          Daha iyi hizmet verebilmek icin sistemimizde kisa sureli bir guncelleme yapiyoruz.
          Anlayisiniz icin tesekkur ederiz.
        </p>

        <div className="flex flex-col items-center gap-3">
          <p className="text-sm font-medium uppercase tracking-wider text-gray-500">Bize Ulasin</p>
          <a
            href="mailto:info@skpro.com.tr"
            className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-3 transition-all duration-300 hover:border-white/20 hover:bg-white/10"
          >
            <div className="rounded-lg bg-white/5 p-2 transition-colors group-hover:bg-white/10">
              <svg
                className="h-5 w-5 text-gray-200"
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
            <span className="text-lg font-medium text-gray-200 transition-colors group-hover:text-white">
              info@skpro.com.tr
            </span>
          </a>
        </div>

        <div className="mt-16 flex justify-center gap-2 opacity-30">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
