# SK Production - Web Sitesi ve Admin Paneli

> **Versiyon**: 2.0.1  
> **Durum**: ✅ **PRODUCTION READY**

SK Production için geliştirilmiş modern web sitesi ve yeniden kullanılabilir admin paneli.

## 🚀 Özellikler

### Web Sitesi
- ✅ Modern ve responsive tasarım
- ✅ Multi-language desteği (TR, EN, FR, ES)
- ✅ Görüntü rejisi ve medya server hizmetlerinin sunumu
- ✅ Proje galerisi ve carousel
- ✅ İletişim formu
- ✅ SEO optimizasyonu
- ✅ Dark mode desteği
- ✅ PWA özellikleri
- ✅ Offline mode

### Admin Paneli
- ✅ **Dashboard**: İstatistikler, grafikler ve özet bilgiler
- ✅ **Ekipman Yönetimi**: Ekipman takibi, QR kod, bakım planlaması
- ✅ **Proje Yönetimi**: Proje oluşturma, takip, durum yönetimi, otomatik durum güncellemesi
- ✅ **Müşteri Yönetimi**: Müşteri bilgileri ve proje geçmişi
- ✅ **Görev Yönetimi**: Görev atama, takip ve durum yönetimi
- ✅ **Bakım Yönetimi**: Ekipman bakım takvimi, hatırlatmalar ve kayıtları
- ✅ **Kullanıcı Yönetimi**: Rol bazlı erişim kontrolü, permission yönetimi
- ✅ **Takvim**: Proje ve bakım takvimi (Ay/Hafta/Gün görünümü, drag & drop)
- ✅ **Site İçerik Yönetimi**: Hero, Services, About, Contact bölümleri
- ✅ **Site Görsel Yönetimi**: Görsel upload, kategorilendirme
- ✅ **Dosya Yönetimi**: Dosya upload, listeleme, silme
- ✅ **Yorum Sistemi**: Rich text editor, @mention desteği
- ✅ **Bildirim Sistemi**: Real-time SSE bildirimleri
- ✅ **Webhook Desteği**: Event-based webhook'lar
- ✅ **Email Template Sistemi**: HTML email template'leri
- ✅ **Analytics Dashboard**: Gelişmiş analiz ve raporlama
- ✅ **Monitoring Dashboard**: Sistem izleme ve metrikler

### Mobil Uygulama
- ✅ React Native (Expo) tabanlı mobil uygulama
- ✅ Authentication (Bearer tokens, refresh tokens, 2FA)
- ✅ Dashboard, Tasks, Equipment, Calendar modülleri
- ✅ Push Notifications
- ✅ Offline Mode

## 🛠️ Teknolojiler

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Redux Toolkit** - State management
- **React Query** - Data fetching
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## 📦 Kurulum

Detaylı kurulum rehberi için **[KURULUM_VE_BASLANGIC.md](./docs/KURULUM_VE_BASLANGIC.md)** dosyasına bakın.

### 🚀 Production'a Alma

Production'a almak ve yayındayken geliştirme yapmak için:
- **[PRODUCTION_DEPLOYMENT.md](./docs/PRODUCTION_DEPLOYMENT.md)** ⚡ - Production deployment kapsamlı rehberi (ÖNERİLEN)

### Hızlı Başlangıç

```bash
# 1. Repository'yi klonla
git clone <repository-url>
cd SKpro

# 2. Bağımlılıkları yükle
npm install

# 3. MongoDB Atlas kurulumu yap (KURULUM_VE_BASLANGIC.md'ye bak)

# 4. Environment dosyalarını oluştur
# server/.env ve client/.env.development.local (KURULUM_VE_BASLANGIC.md'ye bak)

# 5. İlk admin kullanıcısını oluştur
cd server && npm run seed && cd ..

# 6. Projeyi başlat
npm run dev

# 7. Tarayıcıda aç
# http://localhost:3000 (Web Sitesi)
# http://localhost:3000/admin/login (Admin Paneli)
```

## 🔐 Kullanıcı Rolleri

- **ADMIN**: Tüm yetkilere sahip
- **FIRMA_SAHIBI**: Tüm yetkilere sahip (ADMIN ile aynı)
- **PROJE_YONETICISI**: Proje ve görev yönetimi
- **DEPO_SORUMLUSU**: Ekipman ve bakım yönetimi
- **TEKNISYEN**: Sadece görüntüleme (okuma yetkisi)

## 📁 Proje Yapısı

```
SKpro/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store
│   │   └── utils/         # Utility functions
│   └── public/            # Static files
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utility functions
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Çıkış
- `POST /api/auth/refresh-token` - Token yenileme
- `GET /api/auth/profile` - Profil bilgileri

### Equipment
- `GET /api/equipment` - Tüm ekipmanlar
- `GET /api/equipment/:id` - Ekipman detayı
- `POST /api/equipment` - Yeni ekipman
- `PUT /api/equipment/:id` - Ekipman güncelle
- `DELETE /api/equipment/:id` - Ekipman sil

### Projects
- `GET /api/projects` - Tüm projeler
- `GET /api/projects/:id` - Proje detayı
- `POST /api/projects` - Yeni proje
- `PUT /api/projects/:id` - Proje güncelle
- `DELETE /api/projects/:id` - Proje sil

### Clients
- `GET /api/clients` - Tüm müşteriler
- `GET /api/clients/:id` - Müşteri detayı
- `POST /api/clients` - Yeni müşteri
- `PUT /api/clients/:id` - Müşteri güncelle
- `DELETE /api/clients/:id` - Müşteri sil

### Tasks
- `GET /api/tasks` - Tüm görevler
- `GET /api/tasks/:id` - Görev detayı
- `POST /api/tasks` - Yeni görev
- `PUT /api/tasks/:id` - Görev güncelle
- `DELETE /api/tasks/:id` - Görev sil

### Maintenance
- `GET /api/maintenance` - Tüm bakımlar
- `GET /api/maintenance/:id` - Bakım detayı
- `POST /api/maintenance` - Yeni bakım
- `PUT /api/maintenance/:id` - Bakım güncelle
- `DELETE /api/maintenance/:id` - Bakım sil

### Dashboard
- `GET /api/dashboard/stats` - Dashboard istatistikleri

### Health Check
- `GET /api/health` - Sistem durumu

## 🧪 Test

```bash
# Tüm testler
npm run test:all

# Client tests
cd client && npm test

# Server tests
cd server && npm test

# E2E tests (Cypress)
cd client && npm run cypress:open
```

## 🚢 Deployment

Detaylı deployment rehberi için **[KURULUM_VE_BASLANGIC.md](./docs/KURULUM_VE_BASLANGIC.md)** dosyasının "Deployment" bölümüne bakın.

### Özet

- **Frontend**: Vercel (Next.js için optimize)
- **Backend**: Render veya Heroku
- **Database**: MongoDB Atlas
- **Environment Variables**: Production değerleriyle ayarlanmalı

## 📚 Dokümantasyon

Tüm dokümanların indeks listesi: **[docs/README.md](./docs/README.md)**  

### Ana Dokümanlar

- **[KURULUM_VE_BASLANGIC.md](./docs/KURULUM_VE_BASLANGIC.md)** - Kurulum ve başlangıç rehberi
  - Hızlı başlangıç (5 dakika)
  - MongoDB kurulumu (Atlas + Local)
  - Environment yapılandırması
  - Proje başlatma yöntemleri
  - Sorun giderme

- **[PRODUCTION_DEPLOYMENT.md](./docs/PRODUCTION_DEPLOYMENT.md)** - Production deployment rehberi
  - Hızlı başlangıç (10 dakika)
  - Detaylı deployment adımları
  - Git branch stratejisi
  - Günlük geliştirme akışı
  - Platform önerileri ve maliyetler

- **[GUVENLIK.md](./docs/GUVENLIK.md)** - Güvenlik ve operasyon checklist'i
  - Authentication ve authorization
  - Production güvenlik checklist'i
  - Security audit adımları

- **[docs/README.md](./docs/README.md)** - Güncel dokümantasyon indeksi
  - Runbook'lar
  - Kurulum ve deployment rehberleri
  - Entegrasyon dökümanları

## 📝 Lisans

Bu proje özel bir projedir.

## 👥 Katkıda Bulunanlar

SK Production Development Team
