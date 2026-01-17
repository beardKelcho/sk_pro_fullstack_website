# 📦 Migration Rehberi - Local Storage -> Cloud Storage

> **Tarih**: 2026-01-17  
> **Durum**: Migration script'leri hazır ✅

---

## 📊 Genel Bakış

Mevcut local storage'daki dosyaları Cloud Storage'a (Cloudinary veya AWS S3) taşımak için migration script'leri hazırlandı.

## 🎯 Desteklenen Migration'lar

1. **Local Storage → Cloudinary**
2. **Local Storage → AWS S3**

---

## 🚀 Cloudinary Migration

### 1. Önkoşullar

```bash
# .env dosyasına ekle
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Migration Çalıştırma

```bash
cd server
npm run migrate:cloudinary
```

veya

```bash
STORAGE_TYPE=cloudinary ts-node src/scripts/migrateToCloudinary.ts
```

### 3. Ne Yapar?

1. ✅ `uploads/` klasöründeki tüm dosyaları tarar
2. ✅ Her dosyayı Cloudinary'ye upload eder
3. ✅ Veritabanındaki `SiteImage` kayıtlarını günceller
4. ✅ URL'leri Cloudinary URL'lerine çevirir
5. ✅ Migration istatistiklerini gösterir

---

## 🚀 AWS S3 Migration

### 1. Önkoşullar

```bash
# .env dosyasına ekle
STORAGE_TYPE=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
```

### 2. Migration Çalıştırma

```bash
cd server
npm run migrate:s3
```

veya

```bash
STORAGE_TYPE=s3 ts-node src/scripts/migrateToS3.ts
```

### 3. Ne Yapar?

1. ✅ `uploads/` klasöründeki tüm dosyaları tarar
2. ✅ Her dosyayı S3'e upload eder
3. ✅ Veritabanındaki `SiteImage` kayıtlarını günceller
4. ✅ URL'leri S3 URL'lerine çevirir
5. ✅ Migration istatistiklerini gösterir

---

## 📋 Migration Öncesi Kontrol Listesi

### 1. Backup Alın

```bash
# Veritabanı backup
mongodump --uri="your-mongodb-uri" --out=./backup-$(date +%Y%m%d)

# Uploads klasörü backup
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

### 2. Environment Variables Kontrolü

```bash
# Cloudinary için
echo $STORAGE_TYPE
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY
echo $CLOUDINARY_API_SECRET

# S3 için
echo $STORAGE_TYPE
echo $AWS_REGION
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
echo $AWS_S3_BUCKET_NAME
```

### 3. Test Migration (Opsiyonel)

Küçük bir test klasörü ile migration'ı test edin:

```bash
# Test klasörü oluştur
mkdir -p uploads/test
cp uploads/site-images/some-image.jpg uploads/test/

# Test migration (sadece test klasörünü migrate et)
# Script'i modifiye ederek sadece test klasörünü migrate edebilirsiniz
```

---

## ⚠️ Önemli Notlar

### 1. Veritabanı Güncellemeleri

Migration script'i şu alanları günceller:
- `SiteImage.url` → Cloudinary/S3 URL'i
- `SiteImage.path` → Cloudinary public_id veya S3 key
- `SiteImage.updatedAt` → Güncel tarih

### 2. Dosya Eşleştirme

Script, dosyaları şu kriterlere göre eşleştirir:
- `path` alanı (relative path)
- `filename` alanı

Eğer bir dosya için birden fazla kayıt varsa, hepsi güncellenir.

### 3. Rate Limiting

Migration script'i her dosya arasında 100ms bekler (rate limiting için). Büyük dosya setleri için bu süre artırılabilir.

### 4. Hata Yönetimi

Migration sırasında hata olan dosyalar:
- Log'a yazılır
- Migration sonunda özet olarak gösterilir
- Migration devam eder (bir dosya hatası tüm migration'ı durdurmaz)

---

## 📊 Migration Sonrası Kontrol

### 1. Veritabanı Kontrolü

```javascript
// MongoDB'de kontrol
db.siteimages.find({ url: { $regex: /cloudinary\.com|s3\.amazonaws\.com/ } }).count()
```

### 2. Dosya Kontrolü

```bash
# Cloudinary Dashboard'da kontrol
# S3 Console'da kontrol
```

### 3. URL Kontrolü

```bash
# Birkaç dosya URL'ini test et
curl -I https://res.cloudinary.com/your-cloud/image/upload/...
curl -I https://your-bucket.s3.amazonaws.com/...
```

---

## 🔄 Geri Dönüş (Rollback)

Eğer migration başarısız olursa veya geri dönmek isterseniz:

### 1. Veritabanı Restore

```bash
mongorestore --uri="your-mongodb-uri" ./backup-YYYYMMDD
```

### 2. Storage Type Değiştir

```bash
# .env dosyasında
STORAGE_TYPE=local
```

### 3. Server'ı Yeniden Başlat

```bash
npm run dev
```

---

## 🐛 Troubleshooting

### Migration çok yavaş

```bash
# Rate limiting'i azalt (script'te 100ms -> 50ms)
# Veya paralel upload kullan (gelecekte eklenebilir)
```

### Bazı dosyalar migrate edilmedi

1. Hata log'larını kontrol et
2. Dosya izinlerini kontrol et
3. Dosya boyutlarını kontrol et (Cloudinary/S3 limitleri)
4. Network bağlantısını kontrol et

### Veritabanı güncellemeleri çalışmadı

1. MongoDB bağlantısını kontrol et
2. `SiteImage` model'ini kontrol et
3. Migration script log'larını kontrol et

---

## 📝 Örnek Migration Çıktısı

```
✅ Connected to MongoDB
📁 Starting migration from: /path/to/uploads
⚠️  This will upload all files to Cloudinary and update database records
⏳ Starting migration in 3 seconds... (Ctrl+C to cancel)

✅ Uploaded: site-images/image-123.jpg -> https://res.cloudinary.com/...
📝 Updated 1 database record(s) for site-images/image-123.jpg
✅ Uploaded: videos/video-456.mp4 -> https://res.cloudinary.com/...
📝 Updated 1 database record(s) for videos/video-456.mp4
...

📊 Migration Summary:
   Total files: 150
   ✅ Success: 148
   ❌ Failed: 2
   ⏭️  Skipped: 0
   ⏱️  Duration: 45.23s

❌ Errors:
   general/corrupted-file.jpg: Invalid image format
   site-images/too-large-file.jpg: File size exceeds limit

✅ Migration completed
```

---

## 🔗 İlgili Dosyalar

- `server/src/scripts/migrateToCloudinary.ts` - Cloudinary migration script
- `server/src/scripts/migrateToS3.ts` - S3 migration script
- `server/src/services/cloudinaryService.ts` - Cloudinary service
- `server/src/services/s3Service.ts` - S3 service
- `docs/CLOUD_STORAGE_ENTEGRASYON.md` - Cloud Storage entegrasyon rehberi

---

## 💡 Öneriler

1. **Production'da**: Migration'ı gece saatlerinde çalıştırın (düşük trafik)
2. **Test**: Önce staging ortamında test edin
3. **Backup**: Mutlaka backup alın
4. **Monitoring**: Migration sırasında Cloudinary/S3 dashboard'u izleyin
5. **Validation**: Migration sonrası birkaç dosyayı manuel kontrol edin

---

*Son Güncelleme: 2026-01-17*
