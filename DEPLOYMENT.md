# SK Production - Deployment Rehberi

Bu rehber, SK Production projesini production ortamına deploy etmek için gerekli adımları içerir.

## 🚀 Deployment Öncesi Hazırlık

### 1. Environment Variables

#### Backend (Server)
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skproduction?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-production
CLIENT_URL=https://skproduction.com
API_URL=https://api.skproduction.com
```

#### Frontend (Client)
```env
NEXT_PUBLIC_API_URL=https://api.skproduction.com/api
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 2. Build İşlemleri

#### Backend Build
```bash
cd server
npm run build
```

#### Frontend Build
```bash
cd client
npm run build
```

## 📦 Deployment Seçenekleri

### Frontend - Vercel

1. Vercel hesabınıza giriş yapın
2. Yeni proje oluşturun
3. GitHub repository'nizi bağlayın
4. Root directory olarak `client` klasörünü seçin
5. Build Command: `npm run build`
6. Output Directory: `.next`
7. Environment variables'ları ekleyin
8. Deploy edin

### Backend - Render / Heroku

#### Render Deployment

1. Render hesabınıza giriş yapın
2. Yeni Web Service oluşturun
3. GitHub repository'nizi bağlayın
4. Root directory olarak `server` klasörünü seçin
5. Build Command: `npm install && npm run build`
6. Start Command: `npm start`
7. Environment variables'ları ekleyin
8. Deploy edin

#### Heroku Deployment

```bash
cd server
heroku create skproduction-api
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set JWT_REFRESH_SECRET=your-refresh-secret
heroku config:set CLIENT_URL=https://skproduction.com
git push heroku main
```

### Veritabanı - MongoDB Atlas

1. MongoDB Atlas hesabı oluşturun
2. Cluster oluşturun
3. Database User oluşturun
4. Network Access ayarlarını yapın (IP whitelist)
5. Connection string'i alın ve environment variable olarak ekleyin

## 🔒 Güvenlik Kontrolleri

- [ ] Tüm environment variables production değerleriyle ayarlandı
- [ ] JWT secret'lar güçlü ve benzersiz
- [ ] MongoDB connection string güvenli
- [ ] CORS ayarları production URL'leriyle güncellendi
- [ ] HTTPS aktif
- [ ] Rate limiting aktif
- [ ] Helmet security headers aktif

## 📊 Monitoring

### Vercel Analytics
- Frontend için Vercel Analytics otomatik olarak aktif

### Backend Monitoring
- Health check endpoint: `GET /api/health`
- Logging için Winston kullanılıyor
- Production'da Sentry entegrasyonu önerilir

## 🔄 CI/CD Pipeline

### GitHub Actions (Örnek)

`.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: vercel/action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./client

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "skproduction-api"
          heroku_email: "your-email@example.com"
          appdir: "server"
```

## 🧪 Post-Deployment Testler

1. Frontend erişilebilir mi?
2. Backend API çalışıyor mu?
3. Database bağlantısı başarılı mı?
4. Authentication çalışıyor mu?
5. Tüm API endpoint'leri test edildi mi?
6. Error handling çalışıyor mu?
7. 404 ve 500 sayfaları görüntüleniyor mu?

## 📝 Notlar

- Production'da `NODE_ENV=production` olmalı
- Tüm secret'lar environment variables olarak saklanmalı
- Database backup stratejisi oluşturulmalı
- Monitoring ve alerting sistemi kurulmalı
- Regular backup'lar alınmalı

