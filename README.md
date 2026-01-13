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

### Gereksinimler
- Node.js 18+
- MongoDB (local veya Atlas)
- npm veya yarn

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone <repository-url>
cd SKpro
```

2. **Dependencies'leri yükleyin**
```bash
npm install
```

3. **Environment dosyalarını oluşturun**

Client için:
```bash
cd client
cp .env.example .env.local
```

Server için:
```bash
cd server
cp .env.example .env
```

4. **Environment değişkenlerini düzenleyin**

`client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

`server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skproduction
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000
```

5. **Development server'ları başlatın**

Root dizinde:
```bash
npm run dev
```

Bu komut hem client hem server'ı başlatır.

Veya ayrı ayrı:
```bash
# Terminal 1 - Client
cd client
npm run dev

# Terminal 2 - Server
cd server
npm run dev
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
# Client tests
cd client
npm test

# Server tests
cd server
npm test
```

## 🚢 Deployment

### Frontend (Vercel)
1. Vercel'e projeyi bağlayın
2. Environment değişkenlerini ayarlayın
3. Build komutu: `cd client && npm run build`

### Backend (Render/Heroku)
1. Repository'yi bağlayın
2. Environment değişkenlerini ayarlayın
3. Build komutu: `cd server && npm run build`
4. Start komutu: `cd server && npm start`

### MongoDB Atlas
1. MongoDB Atlas'ta cluster oluşturun
2. Connection string'i `.env` dosyasına ekleyin
3. Network access ve database user ayarlarını yapın

## 📝 Lisans

Bu proje özel bir projedir.

## 👥 Katkıda Bulunanlar

SK Production Development Team
