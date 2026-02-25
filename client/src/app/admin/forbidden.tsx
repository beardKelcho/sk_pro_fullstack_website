import Link from 'next/link';
import Image from 'next/image';

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#0A1128] to-[#001F54] dark:from-[#050914] dark:to-[#0A1128] px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-white mb-4">403</h1>
          <h2 className="text-4xl font-bold text-white mb-4">Erişim Reddedildi</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-md mx-auto">
            Bu sayfaya erişim yetkiniz bulunmamaktadır. Lütfen yöneticinizle iletişime geçin.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/admin/dashboard"
            className="bg-[#0066CC] dark:bg-primary-light text-white px-8 py-4 rounded-lg hover:bg-[#0055AA] dark:hover:bg-primary transition-all duration-300 text-lg font-medium shadow-lg"
          >
            Dashboard&apos;a Dön
          </Link>
          <Link
            href="/"
            className="bg-white dark:bg-gray-800 text-[#0066CC] dark:text-primary-light px-8 py-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 text-lg font-medium shadow-lg"
          >
            Ana Sayfaya Dön
          </Link>
        </div>

        <div className="mt-12">
          <Image
            src="/images/sk-logo.png"
            alt="SK Production Logo"
            width={120}
            height={40}
            className="mx-auto opacity-50 h-10 w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}

