# ☁️ Storage ve CDN Rehberi (Runbook)

> **Tarih**: 2026-02-24
> **Durum**: Entegrasyon aktif ve production ready ✅
> **Hedef**: Medya ve dosya yükleme işlemlerini yönetmek, performansı CDN ile optimize etmek.

---

## 📊 Mimari İnceleme

Projemizde "Local Storage (Fiziksel klasörler)", "Cloudinary" ve "AWS S3" desteklenmektedir. Storage methodunu seçtikten sonra, CDN mekanizması ilgili dosyalara entegre olur.

### Desteklenen Storage ve CDN Yapıları
- **Local Storage + Yok (CDN Yok)**: Development & Staging için varsayılan.
- **Cloudinary + Built-in CDN**: Görsel ve Video optimizasyonu, otomatik dönüştürme (WebP/AVIF).
- **AWS S3 + CloudFront**: Ölçeklenebilir, yüksek performanslı yapı. (Cloudflare harici olarak entegre edilebilir).
- **Cloudflare**: DNS düzeyinde ön bellekleme ve güvenlik katmanı.

---

## 🚀 Kurulum ve Ortam (Env) Değişkenleri

Güvenlik prensipleri gereğince, hiçbir gerçek credential veya token projenin içerisine eklenemez. `.env` veya `.env.production` dosyanızda ilgili placeholderları kendi credentials'ınızla değiştirmelisiniz.

### 1- Cloudinary Tabanlı CDN (Önerilen)
Web projesi için statik öğelerin kolay CDN dönüşümünü sağlar.

```bash
STORAGE_TYPE=cloudinary
CDN_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```

### 2- AWS S3 tabanlı Object Storage + CloudFront
Ölçeklenebilirlik, dev kaynak talebi ve OAC/OAI metotlarıyla korunacak asset'ler için kurgulanmalıdır.

```bash
STORAGE_TYPE=s3
CDN_PROVIDER=cloudfront
AWS_REGION=<your-aws-region>
AWS_ACCESS_KEY_ID=<your-aws-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-access-key>
AWS_S3_BUCKET_NAME=<your-s3-bucket-name>
CLOUDFRONT_DISTRIBUTION_URL=<your-cloudfront-distribution-url>
```

---

## 📁 Dosya ve Migration (Geçiş) Yapısı

Veritabanımız sadece metadata tuttuğu için dosya sistemindeki `/uploads` folderı Production'da tutulmamalı ve cloud storage'e taşınmalıdır. Bu işlem için aşağıdaki script mantığı önerilir:

```typescript
// server/src/scripts/migrateStorage.ts (Örnek taslaktır)
import { uploadToCloudinary } from './services/cloudinaryService';
import fs from 'fs';
import path from 'path';

const migrateToCloud = async () => {
  const uploadDir = path.join(process.cwd(), 'uploads');
  const files = fs.readdirSync(uploadDir, { recursive: true });
  
  for (const file of files) {
    if (fs.statSync(file).isFile()) {
      const buffer = fs.readFileSync(file);
      // Bu adımda DB kayıtları CloudURL ile ezilmelidir.
      const result = await uploadToCloudinary(buffer, path.basename(file));
      console.log(`Bypass Uploaded: ${result.secure_url}`);
    }
  }
};
```

---

## 🔄 Cache (Önbellek) Stratejileri ve Sorun Giderici (Troubleshooting)

API endpointleri `/api/upload/single` ile otomatik olarak belirlenen STORAGE_TYPE'a medya dosyalarını pushlar ve response objesinde CDN linkini iletir.

- **CloudFront Cache Sorunları:** Yanlış OAC ayarları veya IAM Policy eksikliği olabilir.
- **Cache Invalidation:** Dosya değişmesine rağmen client eski asset görüyorsa, CloudFront panelinden veya `aws cloudfront create-invalidation` komutuyla temizlenmelidir. (Cloudflare ise Purge Cache yapılmalı)
- Cache Header politikası `Max-Age: 31536000` (1 Sene) olması tavsiye edilir.

---

> Diğer backend veya utils komutlarını referans eden `server/src/config/cdn.ts` dosyasına bakabilirsiniz.
