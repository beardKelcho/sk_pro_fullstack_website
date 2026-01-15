import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';

export const metadata = {
  title: 'Kullanım Şartları | SK Production',
  description: 'SK Production web sitesi kullanım şartları ve koşulları.',
};

export default function TermsOfService() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-surface py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl font-bold text-[#0A1128] dark:text-white mb-8">
            Kullanım Şartları
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              <strong>Son Güncelleme:</strong> {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-[#0A1128] dark:text-white mb-4">
                1. Genel Koşullar
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                SK Production web sitesini kullanarak, aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız. 
                Bu şartları kabul etmiyorsanız, lütfen web sitesini kullanmayın.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-[#0A1128] dark:text-white mb-4">
                2. Web Sitesi Kullanımı
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Web sitemizi yalnızca yasal amaçlar için kullanabilirsiniz. Aşağıdaki faaliyetler yasaktır:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4">
                <li>Web sitesinin güvenliğini ihlal etmek</li>
                <li>Zararlı yazılım veya kod yüklemek</li>
                <li>Başkalarının kişisel bilgilerini izinsiz toplamak</li>
                <li>Web sitesinin içeriğini izinsiz kopyalamak veya dağıtmak</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-[#0A1128] dark:text-white mb-4">
                3. Fikri Mülkiyet Hakları
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Web sitesindeki tüm içerik (metinler, görseller, logolar, tasarımlar) SK Production&apos;a aittir 
                ve telif hakkı yasaları ile korunmaktadır. İçeriği izinsiz kullanmak yasaktır.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-[#0A1128] dark:text-white mb-4">
                4. Hizmetler
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Web sitemizde sunulan bilgiler genel bilgilendirme amaçlıdır. Hizmetlerimiz hakkında 
                detaylı bilgi almak için bizimle iletişime geçmeniz gerekmektedir.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-[#0A1128] dark:text-white mb-4">
                5. Sorumluluk Reddi
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Web sitesinde yer alan bilgilerin doğruluğu, güncelliği veya eksiksizliği konusunda 
                garanti vermemekteyiz. Web sitesini kullanımınızdan kaynaklanan herhangi bir zarardan 
                sorumlu değiliz.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-[#0A1128] dark:text-white mb-4">
                6. Değişiklikler
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Bu kullanım şartlarını istediğimiz zaman değiştirme hakkını saklı tutarız. 
                Değişiklikler web sitesinde yayınlandığında yürürlüğe girer.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-[#0A1128] dark:text-white mb-4">
                7. İletişim
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Kullanım şartları hakkında sorularınız için bizimle iletişime geçebilirsiniz:
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                <strong>E-posta:</strong> info@skpro.com.tr<br />
                <strong>Telefon:</strong> +90 532 123 4567<br />
                <strong>Adres:</strong> Zincirlidere Caddesi No:52/C Şişli/İstanbul
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/"
                className="text-[#0066CC] dark:text-primary-light hover:underline"
              >
                ← Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

