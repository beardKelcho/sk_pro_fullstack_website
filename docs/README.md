# 📚 SK Production Dokümantasyon

> **Temiz, Anlaşılır ve Güncel Dokümantasyon**  
> Bu klasör, 2.0+ Production sonrası modernize edilmiş ve operasyonel hale getirilmiş dokümantasyon ağacını içerir.

---

## 🏗️ Dokümantasyon Mimarisi ve İndeks

Aşağıda projenin yeni klasör yapısına göre kategorize edilmiş dokümanlarına hızlıca erişebilirsiniz. Hiçbir dosyada hassas veriler (Secret, API_KEY, DB credentials vb.) bulunmamaktadır.

### 🚀 Başlangıç ve Production Öncesi Kurulum
- **[Kurulum ve Başlangıç](./KURULUM_VE_BASLANGIC.md)** ⭐ - Projenin lokalde ve sıfırdan kurulum adımları.
- **[Production Deployment](./PRODUCTION_DEPLOYMENT.md)** ⭐ - Yayına (Production) almak için platform önerileri ve Git flow adımları.
- **[Domain Kurulumu](./SKPRO_DOMAIN_KURULUM.md)** - Domain ve DNS yönlendirici ayarlar.

### 📊 İzleme, Hata Yönetimi ve Operasyon (Runbooks)
"Runbook"lar canlı sistemde yaşanan olaylara, alarmlara ve gözlemlere anında reaksiyon verebilmeniz için tasarlanmış operasyonel dosyalardır.
- **[Sentry Error Tracking Runbook](./runbooks/SENTRY_RUNBOOK.md)** - Hata yakalama (Sentry) dashboard kontrolü ve alarm limitleri.
- **[Observability Runbook](./OBSERVABILITY_RUNBOOK.md)** - Sistem metriklerini ve genel sunucu izlenebilirliğini takip eder.
- **[Production Operations Runbook](./runbooks/PRODUCTION_OPERATIONS_RUNBOOK.md)** - Deploy sonrası kontrol, alarmlar ve ilk müdahale akışı.
- **[Backup and Recovery](./runbooks/BACKUP_AND_RECOVERY.md)** - Backup, restore ve rollback rehberi.
- **[Log Aggregation](./LOG_AGGREGATION.md)** - Sunucu ve istemci tarafı hata loglarının nasıl derlendiğinin yönetimi.

### 🛠️ Entegrasyon ve Rehberler (Guides)
Sistemdeki karmaşık entegrasyonlar, dış servis bağlamaları ve storage konfigürasyonlarını içerir.
- **[Storage ve CDN Rehberi](./guides/STORAGE_VE_CDN_REHBERI.md)** - Local, Cloudinary veya S3 entegrasyonu ve CloudFront/Cloudflare CDN yönlendirme ayarları.
- **[Calendar Integrations](./CALENDAR_INTEGRATIONS.md)** - Google ve Outlook takvim senkronizasyonlarının kurulum adımları.
- **[GraphQL API](./GRAPHQL_API.md)** - Mevcut GraphQL endpointi kullanımı ve query detayları.
- **[WebSocket Entgerasyonu](./WEBSOCKET_ENTEGRASYON.md)** - Gerçek zamanlı SSE bildirimleri ve soket yönetimi.
- **[Migration Rehberi](./MIGRATION_REHBERI.md)** - Local uploads klasöründen Cloud storagelara medya taşıma adımları.

### 📈 Raporlar ve Optimizasyon
- **[Proje Durumu (Kapsamlı Özet)](./PROJE_DURUMU.md)** - Tamamlanan tüm özellikler, modüller ve sistem hiyerarşisi.
- **[Proje Analiz Raporu](./PROJE_ANALIZ_RAPORU.md)** - Kod tabanı kalite analizi, refactor önerileri ve metrik sonuçları.
- **[Performans İyileştirmeleri](./PERFORMANS_IYILESTIRMELERI.md)** - Sunucu tarafı ve istemci tarafı iyileştirme çıktıları.
- **[Product Backlog](./PRODUCT_BACKLOG.md)** - Kod tabanı stabil hale geldikten sonraki öncelikli işler.
- **[Query Optimization](./QUERY_OPTIMIZATION.md)** - Veritabanı okuma/yazma hızlandırma ve indeks raporu.
- **[Aggregation Optimization](./AGGREGATION_OPTIMIZATION.md)** - MongoDB pipeline verimlilik rehberi.

### 📜 Kurumsal Belgeler ve CI/CD
- **[Dokümantasyon Temizlik Auditi](./DOKUMANTASYON_TEMIZLIK_AUDITI.md)** - Son yapılan bilgi mimarisi revizyonunda temizlenen ve güncellenen dosya raporu.
- **[Ürün Spesifikasyon Belgesi](./URUN_SPESIFIKASYON_BELGESI.md)** - Projenin kurumsal özellikleri.
- **[Güvenlik Uygulamaları](./GUVENLIK.md)** - Backend ve Frontend tarafındaki RBAC güvenlik katmanları.
- **[GitHub Secrets Rehberi](./GITHUB_SECRETS_REHBERI.md)** - CI/CD pipeline süreçlerine tanımlanacak secret anahtarları.
- **[Deployment Scripts Rehberi](./DEPLOYMENT_SCRIPTS_REHBERI.md)** - Git Hookları ve deployment trigger scriptleri.
- **[Ağ'dan Erişim Kuralları](./AG_DEN_ERISIM.md)** - İç ağlardan sisteme erişim politikaları.

---

## 🗄️ Eski ve Geçmişe Dönük Belgeler (Archive)
Aktif geliştirme değerini yitiren, sadece referans veya geçmiş analizleri içermesi amacıyla `archive/` klasörüne aktarılan belgeler şunlardır:
- `KAPSAMLI_ANALIZ_PLANI.md`, `KULLANILMAYAN_KOD_TEMIZLIGI.md`, `DOSYA_DEPOLAMA_ANALIZI.md`, `BUNDLE_OPTIMIZASYONU.md`

Tüm bu dokümanlara `docs/archive/` klasörü üzerinden ulaşabilirsiniz.

---

**Son Dokümantasyon Revizyonu: 2026-03-30**
