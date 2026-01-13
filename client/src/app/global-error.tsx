'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#0A1128] to-[#001F54] px-4">
          <div className="text-center max-w-2xl">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-white mb-4">500</h1>
              <h2 className="text-4xl font-bold text-white mb-4">Kritik Hata</h2>
              <p className="text-xl text-gray-300 mb-8">
                Uygulamada kritik bir hata oluştu. Lütfen sayfayı yenileyin.
              </p>
            </div>
            
            <button
              onClick={reset}
              className="bg-[#0066CC] text-white px-8 py-4 rounded-lg hover:bg-[#0055AA] transition-all duration-300 text-lg font-medium shadow-lg"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

