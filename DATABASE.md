# Database Durumu ve Production Rehberi

## 📊 Mevcut Durum

### ✅ Sağlıklı Olanlar
- **6 Model Tanımlı**: User, Equipment, Project, Client, Maintenance, Task
- **Validation'lar**: Tüm modellerde field validation'lar çalışıyor
- **Relationships**: Referanslar ve populate işlemleri doğru
- **Hooks**: Pre/post save hooks aktif (otomatik status güncellemeleri)
- **Indexes**: Unique constraint'ler ve index'ler tanımlı

### ⚠️ Düzeltilen Sorunlar
- ✅ Database bağlantı yöntemi standardize edildi
- ✅ Reconnect logic eklendi
- ✅ Connection pooling ayarları aktif
- ✅ Environment variable tutarlılığı sağlandı (MONGO_URI veya MONGODB_URI)

## 🔧 Development Ortamı

### Yerel MongoDB
```bash
# MongoDB başlat
brew services start mongodb-community
# veya
mongod
```

### Environment Variables
```env
# server/.env
MONGO_URI=mongodb://localhost:27017/skproduction
# veya
MONGODB_URI=mongodb://localhost:27017/skproduction
```

## 🚀 Production Ortamı (Son Kullanıcı)

### MongoDB Atlas Kullanımı (Önerilen)

1. **MongoDB Atlas Hesabı Oluştur**
   - https://www.mongodb.com/cloud/atlas
   - Ücretsiz tier (M0) yeterli başlangıç için

2. **Cluster Oluştur**
   - Region seç (Türkiye için en yakın)
   - Cluster adı: `sk-production-cluster`

3. **Database User Oluştur**
   - Username: `skproduction-admin`
   - Password: Güçlü bir şifre
   - Database User Privileges: `Atlas admin` veya `Read and write to any database`

4. **Network Access Ayarla**
   - IP Whitelist: `0.0.0.0/0` (tüm IP'ler - production için)
   - Veya sadece server IP'si (daha güvenli)

5. **Connection String Al**
   ```
   mongodb+srv://skproduction-admin:<password>@sk-production-cluster.xxxxx.mongodb.net/skproduction?retryWrites=true&w=majority
   ```

6. **Environment Variable Ayarla**
   ```env
   # Production server'da
   MONGO_URI=mongodb+srv://skproduction-admin:YOUR_PASSWORD@sk-production-cluster.xxxxx.mongodb.net/skproduction?retryWrites=true&w=majority
   ```

### Production Deployment (Render/Heroku)

**Render için:**
1. Render Dashboard → New → Web Service
2. Repository'yi bağla
3. Environment Variables ekle:
   ```
   MONGO_URI=mongodb+srv://...
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=...
   CLIENT_URL=https://your-frontend-domain.com
   ```
4. Build Command: `cd server && npm install && npm run build`
5. Start Command: `cd server && npm start`

**Heroku için:**
```bash
heroku create sk-production-api
heroku config:set MONGO_URI=mongodb+srv://...
heroku config:set NODE_ENV=production
git push heroku main
```

## 📋 İlk Kurulum (Production)

### 1. Admin Kullanıcı Oluştur

**Seçenek 1: MongoDB Shell ile**
```javascript
use skproduction
db.users.insertOne({
  name: "Admin",
  email: "admin@skproduction.com",
  password: "admin123", // "admin123"
  role: "ADMIN",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Seçenek 2: API ile (Register endpoint açıksa)**
```bash
curl -X POST http://your-api.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@skproduction.com",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

**Seçenek 3: Seed Script (Önerilen)**
```bash
# server/scripts/seed.ts oluştur
npm run seed
```

### 2. Database Index'lerini Kontrol Et

MongoDB Atlas'ta:
- Collections → Indexes
- Otomatik oluşan index'leri kontrol et
- Gerekirse manuel index ekle

## 🔍 Database Monitoring

### MongoDB Atlas Monitoring
- Real-time performance metrics
- Slow query detection
- Connection pool monitoring
- Storage usage

### Log Monitoring
- `server/logs/error.log` - Hata logları
- `server/logs/combined.log` - Tüm loglar

## ⚠️ Önemli Notlar

1. **Backup**: MongoDB Atlas otomatik backup sağlar (M10+)
2. **Connection Limits**: Free tier'da 500 connection limit var
3. **Data Size**: Free tier'da 512MB storage limit var
4. **Security**: Production'da IP whitelist kullanın
5. **Password**: Database user password'ü güçlü tutun

## 🐛 Sorun Giderme

### Bağlantı Hatası
```bash
# Connection string'i kontrol et
# Network access ayarlarını kontrol et
# Database user credentials'ları kontrol et
```

### Slow Queries
- MongoDB Atlas → Performance Advisor
- Index önerilerini uygula

### Connection Pool Exhausted
- `maxPoolSize` değerini artır
- Connection'ları düzgün kapat

## 📊 Database Yapısı

```
skproduction/
├── users (Kullanıcılar)
├── equipment (Ekipmanlar)
├── projects (Projeler)
├── clients (Müşteriler)
├── maintenance (Bakımlar)
└── tasks (Görevler)
```

## ✅ Production Checklist

- [ ] MongoDB Atlas cluster oluşturuldu
- [ ] Database user oluşturuldu
- [ ] Network access ayarlandı
- [ ] Connection string environment variable'a eklendi
- [ ] Admin kullanıcı oluşturuldu
- [ ] Backup ayarları yapıldı
- [ ] Monitoring aktif
- [ ] Index'ler kontrol edildi
- [ ] Connection pooling test edildi

