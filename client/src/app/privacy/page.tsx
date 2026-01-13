import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';

export const metadata = {
  title: 'Gizlilik Politikası | SK Production',
  description: 'SK Production gizlilik politikası ve kişisel verilerin korunması hakkında bilgiler.',
};

export default function PrivacyPolicy() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-surface py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl font-bold text-[#0A1128] dark:text-white mb-8">
            Gizlilik Politikası
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              <strong>Son Güncelleme:</strong> {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-[#0A1128] dark:text-white mb-4">
                1. Genel Bilgiler
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                SK Production olarak, ziyaretçilerimizin ve kullanıcılarımızın gizliliğini korumak bizim için önemlidir. 
                Bu gizlilik politikası, web sitemizi ziyaret ettiğinizde veya hizmetlerimizi kullandığınızda topladığımız 
                bilgilerin nasıl kullanıldığını açıklamaktadır.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-[#0A1128] dark:text-white mb-4">
                2. Toplanan Bilgiler
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Web sitemizde aşağıdaki bilgileri toplayabiliriz:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4">
                <li>İletişim formu aracılığıyla sağladığınız ad, e-posta, telefon numarası gibi kişisel bilgiler</li>
                <li>Web sitesi kullanım verileri (IP adresi, tarayıcı türü, ziyaret edilen sayfalar)</li>
                <li>Çerezler (cookies) aracılığıyla toplanan veriler</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-[#0A1128] dark:text-white mb-4">
                3. Bilgilerin Kullanımı
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Topladığımız bilgiler aşağıdaki amaçlarla kullanılabilir:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4">
                <li>Hizmetlerimizi sunmak ve iyileştirmek</li>
                <li>İletişim taleplerinize yanıt vermek</li>
                <li>Web sitesi deneyimini geliştirmek</li>
                <li>Yasal yükümlülüklerimizi yerine getirmek</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-[#0A1128] dark:text-white mb-4">
                4. Çerezler (Cookies)
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. 
                Çerezler, web sitesini ziyaret ettiğinizde tarayıcınızda saklanan küçük metin dosyalarıdır. 
                Çerezleri tarayıcı ayarlarınızdan yönetebilirsiniz.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-[#0A1128] dark:text-white mb-4">
                5. Veri Güvenliği
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Kişisel verilerinizin güvenliğini sağlamak için uygun teknik ve idari önlemler almaktayız. 
                Ancak, internet üzerinden veri iletiminin %100 güvenli olduğu garanti edilemez.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-[#0A1128] dark:text-white mb-4">
                6. KVKK Haklarınız
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenen kişisel verileriniz hakkında bilgi talep etme</li>
                <li>Kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-[#0A1128] dark:text-white mb-4">
                7. İletişim
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
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

