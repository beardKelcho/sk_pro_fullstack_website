import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface StaticInfoLayoutProps {
  title: string;
  children: ReactNode;
}

export default function StaticInfoLayout({ title, children }: StaticInfoLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-surface">
      <header className="border-b border-gray-200/80 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-black/40">
        <div className="container mx-auto flex items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/sk-logo.png"
              alt="SK Production Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
            <div>
              <div className="text-base font-semibold text-[#0A1128] dark:text-white">SK Production</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{title}</div>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:text-[#0066CC] dark:border-gray-700 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:text-primary-light"
          >
            Ana Sayfaya Don
          </Link>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-gray-200 bg-white/70 py-6 text-center text-sm text-gray-500 dark:border-white/10 dark:bg-black/30 dark:text-gray-400">
        <div className="container mx-auto px-6">
          Bilgi ve erisim talepleri icin iletisim formunu veya resmi iletisim kanallarimizi kullanabilirsiniz.
        </div>
      </footer>
    </div>
  );
}
