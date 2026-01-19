# TestSprite Test Hazırlık Kontrol Listesi

> **Durum**: ✅ **HAZIR**  
> **Tarih**: 2026-01-19  
> **Son Kontrol**: Tüm kontroller başarılı

---

## ✅ Tamamlanan Hazırlıklar

### 1. MongoDB Bağlantısı
- ✅ MongoDB Atlas bağlantısı test edildi ve çalışıyor
- ✅ Connection string doğru yapılandırılmış
- ✅ Database: `skproduction`
- ✅ Host: MongoDB Atlas cluster

### 2. Environment Variables

#### Server (.env)
- ✅ `MONGO_URI` - MongoDB connection string tanımlı
- ✅ `PORT=5001` - Backend port doğru
- ✅ `JWT_SECRET` - JWT secret key tanımlı
- ✅ `JWT_REFRESH_SECRET` - Refresh token secret tanımlı
- ✅ `CLIENT_URL=http://localhost:3000` - Client URL tanımlı
- ✅ `CORS_ORIGIN=http://localhost:3000` - CORS origin tanımlı
- ✅ `NODE_ENV=development` - Development modu aktif

#### Client (.env.local)
- ✅ `NEXT_PUBLIC_API_URL=http://localhost:5001/api` - API URL tanımlı
- ✅ `NEXT_PUBLIC_BACKEND_URL=http://localhost:5001` - Backend URL tanımlı

### 3. Rate Limiting Yapılandırması
- ✅ Test ve development ortamında rate limiting devre dışı
- ✅ Login limiter: Test/development'ta 1000 istek/dakika (production'da 15)
- ✅ Genel API limiter: Test ortamında 10000 istek (production'da 500)
- ✅ TestSprite için `DISABLE_RATE_LIMIT=true` environment variable ile bypass mümkün

### 4. Kontrol Scriptleri
- ✅ `npm run check:env` - MongoDB ve .env dosyalarını kontrol eder
- ✅ Tüm kontroller başarılı

---

## 🚀 TestSprite ile Test Çalıştırma

### Önkoşullar
1. ✅ MongoDB bağlantısı çalışıyor
2. ✅ Environment variables doğru yapılandırılmış
3. ✅ Rate limiting test ortamında devre dışı

### Test Çalıştırma Adımları

1. **Uygulamayı Başlat**
   ```bash
   # Proje root dizininde
   npm run dev
   ```
   
   Bu komut hem frontend (port 3000) hem de backend (port 5001) sunucularını başlatır.

2. **TestSprite ile Test Çalıştır**
   
   Cursor IDE'de şu komutu kullanın:
   ```
   Help me test this project with TestSprite.
   ```
   
   veya
   ```
   Can you test this project with TestSprite?
   ```

3. **TestSprite Yapılandırması**
   
   İlk çalıştırmada TestSprite şunları sorabilir:
   - **Test Tipi**: Frontend / Backend / Her ikisi
   - **Kapsam**: 
     - `codebase` - Tüm proje
     - `diff` - Son değişiklikler
   - **Portlar**: 
     - Frontend: `3000`
     - Backend: `5001`
   - **Test Kullanıcı Bilgileri** (gerekirse):
     - Email: `admin@skproduction.com`
     - Password: `admin123`

4. **Test Sonuçları**
   
   Testler tamamlandığında:
   - `testsprite_tests/` klasöründe raporlar oluşur
   - `testsprite-mcp-test-report.md` dosyasında detaylı sonuçlar yer alır
   - Başarısız testler için öneriler sunulur

---

## 📋 TestSprite Kontrol Komutları

### Environment Kontrolü
```bash
# MongoDB ve .env dosyalarını kontrol et
npm run check:env
```

### Port Kontrolü
```bash
# Backend ve frontend portlarını kontrol et
npm run check-ports
```

### Uygulama Durumu
```bash
# Backend health check
curl http://localhost:5001/api/health

# Frontend erişilebilirlik
curl http://localhost:3000
```

---

## ⚠️ Bilinen Sorunlar ve Çözümler

### TC011 - Login Rate Limiting
- **Durum**: ✅ Çözüldü
- **Çözüm**: Test ve development ortamında rate limiting devre dışı
- **Kontrol**: `server/src/middleware/rateLimiters.ts` - Test ortamında skip ediliyor

### TC017 - Oturum Yönetimi
- **Durum**: ⚠️ Test edilecek
- **Not**: TestSprite testleri sırasında kontrol edilecek

---

## 📝 Test Öncesi Kontrol Listesi

TestSprite testlerini çalıştırmadan önce:

- [x] MongoDB bağlantısı çalışıyor
- [x] Server .env dosyası doğru yapılandırılmış
- [x] Client .env.local dosyası doğru yapılandırılmış
- [x] Rate limiting test ortamında devre dışı
- [ ] Backend server çalışıyor (port 5001)
- [ ] Frontend server çalışıyor (port 3000)
- [ ] Admin kullanıcısı oluşturulmuş (`npm run seed`)

---

## 🔧 Sorun Giderme

### MongoDB Bağlantı Hatası
```bash
# MongoDB bağlantısını test et
npm run check:env
```

### Port Kullanımda Hatası
```bash
# Port'u kontrol et
npm run check-ports

# Port'u temizle (gerekirse)
lsof -ti:5001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Environment Variable Eksik
```bash
# Kontrol scriptini çalıştır
npm run check:env

# Eksik değişkenleri ekle
# Server: server/.env
# Client: client/.env.local
```

---

## 📚 İlgili Dokümanlar

- [TESTSPRITE_BACKLOG.md](./TESTSPRITE_BACKLOG.md) - TestSprite test sonuçları ve backlog
- [KURULUM_REHBERI.md](./KURULUM_REHBERI.md) - Detaylı kurulum rehberi
- [BASLATMA_REHBERI.md](./BASLATMA_REHBERI.md) - Proje başlatma rehberi

---

**Son Güncelleme**: 2026-01-19  
**Hazırlık Durumu**: ✅ **TEST İÇİN HAZIR**
