# SK Production - Web Sitesi ve Admin Paneli

SK Production için geliştirilmiş modern web sitesi ve yeniden kullanılabilir admin paneli.

## 🚀 Özellikler

### Web Sitesi
- Modern ve responsive tasarım
- Görüntü rejisi ve medya server hizmetlerinin sunumu
- Proje galerisi ve carousel
- İletişim formu
- SEO optimizasyonu
- Dark mode desteği

### Admin Paneli
- **Ekipman Yönetimi**: Ekipman takibi, bakım planlaması
- **Proje Yönetimi**: Proje oluşturma, takip ve yönetim
- **Müşteri Yönetimi**: Müşteri bilgileri ve proje geçmişi
- **Görev Yönetimi**: Görev atama, takip ve durum yönetimi
- **Bakım Yönetimi**: Ekipman bakım takvimi ve kayıtları
- **Kullanıcı Yönetimi**: Rol bazlı erişim kontrolü
- **Dashboard**: İstatistikler ve özet bilgiler
- **Takvim**: Proje ve bakım takvimi görünümü

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

Detaylı kurulum rehberi için **[KURULUM_REHBERI.md](./docs/KURULUM_REHBERI.md)** dosyasına bakın.

### 🚀 Production'a Alma

Production'a almak ve yayındayken geliştirme yapmak için:
- **[DEPLOYMENT_README.md](./docs/DEPLOYMENT_README.md)** - Deployment ve geliştirme rehberi
- **[PRODUCTION_DEPLOYMENT_CHECKLIST.md](./docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md)** - Production deployment checklist
- **[PRODUCTION_GELISTIRME_REHBERI.md](./docs/PRODUCTION_GELISTIRME_REHBERI.md)** - Production'da geliştirme rehberi

### Hızlı Başlangıç

```bash
# 1. Repository'yi klonla
git clone <repository-url>
cd SKpro

# 2. Bağımlılıkları yükle
npm install

# 3. MongoDB Atlas kurulumu yap (KURULUM_REHBERI.md'ye bak)

# 4. Environment dosyalarını oluştur
# server/.env ve client/.env.local (KURULUM_REHBERI.md'ye bak)

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
- **INVENTORY_MANAGER**: Ekipman ve bakım yönetimi
- **TECHNICIAN**: Görev ve proje yönetimi
- **USER**: Sınırlı erişim

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

Detaylı deployment rehberi için **[KURULUM_REHBERI.md](./docs/KURULUM_REHBERI.md)** dosyasının "Deployment" bölümüne bakın.

### Özet

- **Frontend**: Vercel (Next.js için optimize)
- **Backend**: Render veya Heroku
- **Database**: MongoDB Atlas
- **Environment Variables**: Production değerleriyle ayarlanmalı

## 📚 Dokümantasyon

Tüm dokümanların indeks listesi: **[docs/README.md](./docs/README.md)**  

### Ana Dokümanlar

- **[KURULUM_REHBERI.md](./docs/KURULUM_REHBERI.md)** - Kapsamlı kurulum, başlatma ve kullanım rehberi
  - MongoDB kurulumu (Atlas + Local)
  - Environment yapılandırması
  - Proje başlatma yöntemleri
  - Sorun giderme
  - Deployment rehberi
  - Production checklist

- **[PROJE_GELISTIRME.md](./docs/PROJE_GELISTIRME.md)** - Proje geliştirme, iyileştirmeler ve teknik detaylar
  - Tamamlanan özellikler
  - Test stratejisi (detaylı)
  - Yetki sistemi (detaylı tablo)
  - Dosya yükleme mimarisi
  - Teknik mimari
  - Yapılacaklar listesi (öncelik matrisi ile)
  - İyileştirme önerileri

## 📝 Lisans

Bu proje özel bir projedir.

## 👥 Katkıda Bulunanlar

SK Production Development Team
