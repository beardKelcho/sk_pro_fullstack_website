# 📚 SK Production Dokümantasyon

> **Temiz, Anlaşılır ve Güncel Dokümantasyon**  
> Bu klasör, 2.0+ Production sonrası modernize edilmiş ve operasyonel hale getirilmiş dokümantasyon ağacını içerir.

---

## 🏗️ Dokümantasyon Mimarisi ve İndeks

Aşağıda projenin yeni klasör yapısına göre kategorize edilmiş dokümanlarına hızlıca erişebilirsiniz. Hiçbir dosyada hassas veriler (Secret, API_KEY, DB credentials vb.) bulunmamaktadır.

### 🚀 Başlangıç ve Production Öncesi Kurulum
- **[Kurulum ve Başlangıç](./KURULUM_VE_BASLANGIC.md)** ⭐ - Projenin lokalde ve sıfırdan kurulum adımları.
- **[Production Deployment](./PRODUCTION_DEPLOYMENT.md)** ⭐ - Yayına (Production) almak için platform önerileri ve Git flow adımları.

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
- **[Performans İyileştirmeleri](./PERFORMANS_IYILESTIRMELERI.md)** - Sunucu tarafı ve istemci tarafı iyileştirme çıktıları.
- **[Query Optimization](./QUERY_OPTIMIZATION.md)** - Veritabanı okuma/yazma hızlandırma ve indeks raporu.
- **[Aggregation Optimization](./AGGREGATION_OPTIMIZATION.md)** - MongoDB pipeline verimlilik rehberi.

### 📜 Kurumsal Belgeler ve CI/CD
- **[Güvenlik Uygulamaları](./GUVENLIK.md)** - Backend ve Frontend tarafındaki RBAC güvenlik katmanları.

---

**Son Dokümantasyon Revizyonu: 2026-03-30**
