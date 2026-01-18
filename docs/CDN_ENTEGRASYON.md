# 🌐 CDN Entegrasyonu

> **Tarih**: 2026-01-17  
> **Durum**: Entegrasyon tamamlandı ✅

---

## 📊 Genel Bakış

Proje artık **CDN (Content Delivery Network)** desteği ile geliyor. Statik dosyalar ve görseller CDN üzerinden servis edilebilir.

## 🎯 Desteklenen CDN Provider'lar

1. **Cloudinary** (Built-in) - Image/Video CDN
2. **AWS CloudFront** - S3 için CDN
3. **Cloudflare** - Genel CDN
4. **None** (Default) - CDN kullanılmaz

---

## 🚀 Kurulum

### 1. Environment Variables

`.env` dosyasına CDN yapılandırması ekleyin:

```bash
# CDN Provider: 'cloudinary' | 'cloudfront' | 'cloudflare' | 'none'
CDN_PROVIDER=none
```

### 2. Cloudinary CDN (Built-in)

Cloudinary kullanıyorsanız, CDN otomatik olarak aktif:

```bash
STORAGE_TYPE=cloudinary
CDN_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Opsiyonel: Custom CDN URL
CLOUDINARY_CDN_URL=https://res.cloudinary.com/your-cloud-name
```

**Not:** Cloudinary URL'leri zaten CDN üzerinden gelir, ekstra yapılandırma gerekmez.

### 3. AWS CloudFront CDN

S3 kullanıyorsanız, CloudFront ile CDN ekleyebilirsiniz:

#### 3.1. CloudFront Distribution Oluştur

1. AWS Console > CloudFront
2. Create Distribution
3. Origin Domain: S3 bucket'ınızı seçin
4. Distribution Settings:
   - **Default Cache Behavior**: Cache based on selected request headers
   - **Viewer Protocol Policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP Methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - **Cache Policy**: CachingOptimized (veya custom)
5. Create Distribution

#### 3.2. Environment Variables Ekle

```bash
STORAGE_TYPE=s3
CDN_PROVIDER=cloudfront
CLOUDFRONT_DISTRIBUTION_URL=https://d1234567890.cloudfront.net

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
```

#### 3.3. S3 Bucket Policy Güncelle

CloudFront'un S3'e erişebilmesi için bucket policy:

**Yöntem 1: Origin Access Control (OAC) - Önerilen (Yeni)**

1. CloudFront Distribution oluştururken "Origin Access" bölümünde "Origin Access Control settings (recommended)" seçin
2. "Create control setting" ile yeni bir OAC oluşturun
3. S3 bucket policy'ye OAC'yi ekleyin:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::account-id:distribution/distribution-id"
        }
      }
    }
  ]
}
```

**Yöntem 2: Origin Access Identity (OAI) - Eski Yöntem**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity E1234567890ABC"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

#### 3.4. CloudFront Distribution Test

Distribution oluşturulduktan sonra (15-20 dakika deploy süresi):

```bash
# Distribution URL'ini test et
curl -I https://d1234567890.cloudfront.net/uploads/site-images/test.jpg

# Cache headers kontrolü
curl -I https://d1234567890.cloudfront.net/uploads/site-images/test.jpg | grep -i cache
```

### 4. Cloudflare CDN

Cloudflare kullanıyorsanız:

```bash
CDN_PROVIDER=cloudflare
CLOUDFLARE_CDN_URL=https://cdn.yourdomain.com
```

**Not:** Cloudflare CDN'i genellikle DNS seviyesinde yapılandırılır. Bu URL, Cloudflare'in CDN endpoint'idir.

---

## 🔧 Kullanım

### Otomatik CDN Dönüşümü

CDN aktifse, tüm dosya URL'leri otomatik olarak CDN URL'ine çevrilir:

```typescript
// Local storage URL
/uploads/site-images/image.jpg
// CDN URL'e çevrilir (CloudFront aktifse)
https://d1234567890.cloudfront.net/uploads/site-images/image.jpg
```

### Manuel CDN URL Dönüşümü

```typescript
import { convertToCDNUrl } from './config/cdn';

const localUrl = '/uploads/site-images/image.jpg';
const cdnUrl = convertToCDNUrl(localUrl);
// CDN aktifse: https://cdn.example.com/uploads/site-images/image.jpg
// CDN aktif değilse: /uploads/site-images/image.jpg
```

---

## ✨ Özellikler

### Cloudinary CDN
- ✅ Otomatik CDN (built-in)
- ✅ Global edge locations
- ✅ Image optimization
- ✅ Video streaming
- ✅ Responsive images

### AWS CloudFront
- ✅ Global edge locations
- ✅ SSL/TLS encryption
- ✅ Custom domain support
- ✅ Cache policies
- ✅ Origin failover

### Cloudflare CDN
- ✅ Global edge network
- ✅ DDoS protection
- ✅ SSL/TLS encryption
- ✅ Cache rules
- ✅ Image optimization (Pro plan)

---

## 📁 Dosya Yapısı

```
server/src/
├── config/
│   └── cdn.ts                    # CDN configuration
├── services/
│   └── s3Service.ts             # S3 service (CDN URL dönüşümü)
└── utils/
    └── pathNormalizer.ts        # Path normalizer (CDN URL dönüşümü)
```

---

## 🔄 Cache Stratejisi

### CloudFront Cache Policies

**Recommended Settings:**
- **Cache-Control Headers**: Respect origin cache headers
- **TTL**: 
  - Images: 1 year (31536000 seconds)
  - Videos: 1 year
  - Other files: 1 hour (3600 seconds)

### Cloudflare Cache Rules

**Recommended Settings:**
- **Cache Level**: Standard
- **Browser Cache TTL**: 1 year
- **Edge Cache TTL**: 1 year

---

## 🔒 Güvenlik

### CloudFront
- ✅ Origin Access Control (OAC) / Origin Access Identity (OAI)
- ✅ Signed URLs (private files)
- ✅ WAF (Web Application Firewall)
- ✅ SSL/TLS encryption

### Cloudflare
- ✅ DDoS protection
- ✅ WAF rules
- ✅ SSL/TLS encryption
- ✅ Rate limiting

---

## 💰 Maliyet

### AWS CloudFront
- **Data Transfer Out**: $0.085/GB (ilk 10TB)
- **Requests**: $0.0075/10,000 requests
- **Invalidation**: İlk 1000 ücretsiz, sonrası $0.005/invalidation

### Cloudflare
- **Free Plan**: Unlimited bandwidth, basic features
- **Pro Plan**: $20/month, advanced features
- **Business Plan**: $200/month, enterprise features

### Cloudinary
- **CDN**: Ücretsiz (storage plan'ına dahil)
- **Bandwidth**: Plan'a göre değişir

---

## 🐛 Troubleshooting

### CDN URL'leri çalışmıyor

```bash
# CDN provider kontrolü
echo $CDN_PROVIDER

# CDN base URL kontrolü
echo $CLOUDFRONT_DISTRIBUTION_URL  # CloudFront için
echo $CLOUDFLARE_CDN_URL          # Cloudflare için

# Server log'larını kontrol et
# CDN yapılandırması log'da görünür
```

### CloudFront Distribution çalışmıyor

1. **Distribution Status**: Deployed olmalı
2. **Origin**: S3 bucket doğru mu?
3. **Cache Behavior**: Doğru yapılandırılmış mı?
4. **SSL Certificate**: Valid mi?

### Cache güncellenmiyor

```bash
# CloudFront invalidation
aws cloudfront create-invalidation \
  --distribution-id E1234567890 \
  --paths "/*"

# Cloudflare cache purge
# Cloudflare Dashboard > Caching > Purge Cache
```

---

## 📝 Notlar

- **Cloudinary**: CDN otomatik aktif, ekstra yapılandırma gerekmez
- **S3 + CloudFront**: Distribution oluşturulduktan sonra 15-20 dakika deploy süresi
- **Cloudflare**: DNS seviyesinde yapılandırma gerekir
- **Cache Invalidation**: Dosya güncellendiğinde cache'i temizlemeyi unutmayın

---

## 🔗 İlgili Dosyalar

- `server/src/config/cdn.ts` - CDN configuration
- `server/src/services/s3Service.ts` - S3 service (CDN URL dönüşümü)
- `server/src/utils/pathNormalizer.ts` - Path normalizer (CDN URL dönüşümü)
- `docs/CLOUD_STORAGE_ENTEGRASYON.md` - Cloud Storage entegrasyonu

---

*Son Güncelleme: 2026-01-17*
