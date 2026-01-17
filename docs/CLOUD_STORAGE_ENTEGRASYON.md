# ☁️ Cloud Storage Entegrasyonu

> **Tarih**: 2026-01-17  
> **Durum**: Entegrasyon tamamlandı ✅

---

## 📊 Genel Bakış

Proje artık **Cloud Storage** desteği ile geliyor. Local storage, Cloudinary ve AWS S3 arasında seçim yapabilirsiniz.

## 🎯 Desteklenen Storage Türleri

1. **Local Storage** (Default) - Development için
2. **Cloudinary** - Image/Video optimization + CDN
3. **AWS S3** - Ölçeklenebilir object storage

---

## 🚀 Kurulum

### 1. Environment Variables

`.env` dosyasına storage type'ı ekleyin:

```bash
# Storage Type: 'local' | 'cloudinary' | 's3'
STORAGE_TYPE=local
```

### 2. Cloudinary Kurulumu

#### 2.1. Cloudinary Hesabı Oluştur
1. [Cloudinary.com](https://cloudinary.com) adresine gidin
2. Ücretsiz hesap oluşturun
3. Dashboard'dan API bilgilerinizi alın

#### 2.2. Environment Variables Ekle

```bash
# Cloudinary Configuration
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### 2.3. Package Kurulumu

```bash
cd server
npm install cloudinary
```

### 3. AWS S3 Kurulumu

#### 3.1. AWS Hesabı Oluştur
1. [AWS Console](https://console.aws.amazon.com) adresine gidin
2. S3 servisini açın
3. Yeni bucket oluşturun

#### 3.2. IAM User Oluştur
1. IAM > Users > Create User
2. Programmatic access seçin
3. S3 full access policy ekleyin
4. Access Key ve Secret Key'i kaydedin

#### 3.3. Environment Variables Ekle

```bash
# AWS S3 Configuration
STORAGE_TYPE=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
```

#### 3.4. Package Kurulumu

```bash
cd server
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

---

## 📁 Dosya Yapısı

```
server/src/
├── config/
│   └── storage.ts              # Storage configuration
├── services/
│   ├── cloudinaryService.ts     # Cloudinary service
│   └── s3Service.ts            # AWS S3 service
└── routes/
    └── upload.routes.ts        # Upload routes (güncellendi)
```

---

## 🔧 Kullanım

### Upload Endpoint

Upload endpoint'i otomatik olarak seçilen storage type'ı kullanır:

```bash
# Single file upload
POST /api/upload/single
Content-Type: multipart/form-data

file: [file]
type: site-images  # veya 'videos', 'general', vb.
```

**Response:**
```json
{
  "success": true,
  "file": {
    "filename": "image-1234567890.jpg",
    "originalname": "image.jpg",
    "mimetype": "image/jpeg",
    "size": 1024000,
    "url": "https://res.cloudinary.com/.../image.jpg",
    "path": "site-images/image-1234567890.jpg"
  }
}
```

### Delete Endpoint

```bash
DELETE /api/upload/:filename?type=site-images
```

---

## ✨ Özellikler

### Cloudinary
- ✅ Otomatik image optimization
- ✅ Otomatik format conversion (WebP, AVIF)
- ✅ Video optimization
- ✅ CDN desteği (built-in)
- ✅ Transformation API
- ✅ Responsive images

### AWS S3
- ✅ Ölçeklenebilir storage
- ✅ CDN entegrasyonu (CloudFront)
- ✅ Lifecycle policies
- ✅ Versioning
- ✅ Signed URLs (private files)

### Local Storage
- ✅ Development için ideal
- ✅ Hızlı setup
- ✅ Offline çalışma

---

## 🔄 Migration (Mevcut Dosyaları Taşıma)

### Cloudinary'ye Migration

```typescript
// Migration script örneği
import { uploadToCloudinary } from './services/cloudinaryService';
import fs from 'fs';
import path from 'path';

const migrateToCloudinary = async () => {
  const uploadDir = path.join(process.cwd(), 'uploads');
  const files = fs.readdirSync(uploadDir, { recursive: true });
  
  for (const file of files) {
    if (fs.statSync(file).isFile()) {
      const buffer = fs.readFileSync(file);
      const result = await uploadToCloudinary(buffer, path.basename(file));
      console.log(`Uploaded: ${result.secure_url}`);
    }
  }
};
```

### S3'e Migration

```typescript
// Migration script örneği
import { uploadToS3 } from './services/s3Service';
import fs from 'fs';
import path from 'path';

const migrateToS3 = async () => {
  const uploadDir = path.join(process.cwd(), 'uploads');
  const files = fs.readdirSync(uploadDir, { recursive: true });
  
  for (const file of files) {
    if (fs.statSync(file).isFile()) {
      const buffer = fs.readFileSync(file);
      const result = await uploadToS3(buffer, path.basename(file));
      console.log(`Uploaded: ${result.url}`);
    }
  }
};
```

---

## 🎨 Image Optimization

### Cloudinary (Otomatik)

Cloudinary otomatik olarak:
- WebP format'a çevirir
- Responsive images oluşturur
- Quality optimization yapar
- Lazy loading için placeholder'lar oluşturur

### S3 + CloudFront

S3 için image optimization:
- Lambda@Edge ile otomatik optimization
- CloudFront ile CDN
- ImageMagick veya Sharp kullanılabilir

---

## 🔒 Güvenlik

### Cloudinary
- ✅ API key ve secret environment variable'da
- ✅ Signed URLs (private files için)
- ✅ Folder-based access control

### S3
- ✅ IAM policies ile access control
- ✅ Bucket policies
- ✅ Signed URLs (private files için)
- ✅ CORS configuration

---

## 💰 Maliyet

### Cloudinary
- **Free Tier**: 25GB storage, 25GB bandwidth/month
- **Paid Plans**: $89+/month (daha fazla storage/bandwidth)

### AWS S3
- **Storage**: $0.023/GB/month (Standard)
- **Requests**: $0.005/1000 requests
- **Data Transfer**: $0.09/GB (ilk 10TB)

### Local Storage
- **Maliyet**: $0 (sunucu storage kullanır)

---

## 🐛 Troubleshooting

### Cloudinary Upload Hatası

```bash
# Environment variables kontrolü
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY
echo $CLOUDINARY_API_SECRET

# Cloudinary config kontrolü
# server/src/services/cloudinaryService.ts dosyasını kontrol edin
```

### S3 Upload Hatası

```bash
# AWS credentials kontrolü
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
echo $AWS_S3_BUCKET_NAME
echo $AWS_REGION

# S3 bucket permissions kontrolü
aws s3 ls s3://your-bucket-name
```

### Storage Type Değiştirme

```bash
# .env dosyasını güncelle
STORAGE_TYPE=cloudinary  # veya 's3', 'local'

# Server'ı yeniden başlat
npm run dev
```

---

## 📝 Notlar

- **Development**: Local storage kullanın (hızlı ve ücretsiz)
- **Production**: Cloudinary veya S3 kullanın (ölçeklenebilir)
- **Migration**: Mevcut dosyaları taşımak için migration script'leri kullanın
- **Backward Compatibility**: Local storage'dan cloud'a geçerken URL'ler değişecek, database'deki URL'leri güncellemeyi unutmayın

---

## 🔗 İlgili Dosyalar

- `server/src/config/storage.ts` - Storage configuration
- `server/src/services/cloudinaryService.ts` - Cloudinary service
- `server/src/services/s3Service.ts` - AWS S3 service
- `server/src/routes/upload.routes.ts` - Upload routes

---

*Son Güncelleme: 2026-01-17*
