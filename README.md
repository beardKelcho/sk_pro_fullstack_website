# SK Production Web Sitesi ve Yeniden Kullanılabilir Admin Paneli

## Proje İlerleme Durumu

- [x] Ekipman Yönetimi Modülü (Tamamlandı)
  - [x] Ekipman Listeleme Sayfası
  - [x] Ekipman Detay Sayfası
  - [x] Ekipman Ekleme Sayfası
  - [x] Ekipman Düzenleme Sayfası
  - [x] Bakım Takibi Sayfası

- [x] Proje Yönetimi Modülü (Tamamlandı)
  - [x] Proje Listeleme Sayfası
  - [x] Proje Detay Sayfası
  - [x] Proje Ekleme Sayfası
  - [x] Proje Düzenleme Sayfası
  - [x] Proje Takvimi Görünümü

- [x] Müşteri Yönetimi Modülü (Tamamlandı)
  - [x] Müşteri Listeleme Sayfası
  - [x] Müşteri Detay Sayfası
  - [x] Müşteri Ekleme Sayfası
  - [x] Müşteri Düzenleme Sayfası

- [x] Kimlik Doğrulama Sistemi (Tamamlandı)
  - [x] Giriş/Kayıt Sayfaları
  - [x] Kullanıcı Profili
  - [x] Rol Tabanlı Erişim Kontrolü

- [x] Web Sitesi (Tek Sayfa) (Tamamlandı)
  - [x] Hero Bölümü
  - [x] Hizmetler Bölümü
  - [x] Projeler Görseli
  - [x] Hakkımızda Bölümü
  - [x] İletişim Bölümü
  - [x] Responsive Tasarım

- [ ] Performans ve Güvenlik Optimizasyonu (Yüksek Öncelik)
  - [x] SEO Optimizasyonu
  - [ ] Code Splitting ve Lazy Loading
  - [ ] Görsel Optimizasyonu
  - [ ] Bundle Analizi ve Optimizasyonu
  - [ ] Web Vitals Metrikleri İzleme
  - [ ] Penetrasyon Testleri
  - [ ] Güvenlik Taramaları
  - [ ] CSRF Koruması
  - [ ] Rate Limiting
  - [ ] Input Validasyonu ve Sanitizasyonu

- [ ] Test ve Dokümantasyon (Yüksek Öncelik)
  - [ ] Unit Testler
    - [ ] Kritik Bileşen Testleri
    - [ ] API Endpoint Testleri
    - [ ] Form Validasyon Testleri
  - [ ] Integration Testler
    - [ ] End-to-End Testler
    - [ ] API Entegrasyon Testleri
    - [ ] Kullanıcı Akış Testleri
  - [ ] Dokümantasyon
    - [ ] API Dokümantasyonu (Swagger/OpenAPI)
    - [ ] Kullanıcı Kılavuzları
    - [ ] Geliştirici Dokümantasyonu

- [ ] Deployment ve Monitoring (Orta Öncelik)
  - [ ] Frontend Deployment
    - [ ] Vercel Yapılandırması
    - [ ] CDN Yapılandırması
    - [ ] Environment Variables Yönetimi
  - [ ] Backend Deployment
    - [ ] Render/Heroku Yapılandırması
    - [ ] Health Check Sistemi
    - [ ] Monitoring Araçları
  - [ ] Veritabanı
    - [ ] MongoDB Atlas Yapılandırması
    - [ ] Backup Stratejisi
    - [ ] İndeksleme Optimizasyonları

- [ ] Erişilebilirlik ve SEO (Orta Öncelik)
  - [ ] Erişilebilirlik
    - [ ] WCAG 2.1 AA Uyumluluğu
    - [ ] Screen Reader Uyumluluğu
    - [ ] Klavye Navigasyonu
    - [ ] Renk Kontrastı Kontrolleri
  - [ ] SEO Optimizasyonu
    - [ ] Meta Etiketleri Optimizasyonu
    - [ ] Yapılandırılmış Veri
    - [ ] XML Sitemap
    - [ ] Canonical URL'ler

- [ ] Kullanıcı Deneyimi İyileştirmeleri (Düşük Öncelik)
  - [ ] UI/UX İyileştirmeleri
    - [ ] Skeleton Loading Screens
    - [ ] Error Boundaries
    - [ ] Internationalization (i18n)
    - [ ] Analytics Entegrasyonu
  - [ ] Mobil Optimizasyon
    - [ ] PWA Özellikleri
    - [ ] Touch Optimizasyonu
    - [ ] Responsive Tasarım İyileştirmeleri

- [ ] Eksik Sayfalar ve Hata Yönetimi (Düşük Öncelik)
  - [ ] Özel Sayfalar
    - [ ] 404 Hata Sayfası
    - [ ] 500 Hata Sayfası
    - [ ] 403 Erişim Reddedildi Sayfası
    - [ ] Bakım Modu Sayfası
  - [ ] Yasal Sayfalar
    - [ ] Gizlilik Politikası
    - [ ] Kullanım Şartları
    - [ ] KVKK Uyumluluğu

## 1. Proje Genel Bakışı

### 1.1. Amaç
Bu proje, etkinlik teknolojileri sektöründe faaliyet gösteren, özellikle görüntü rejisi (video switching) ve medya server sistemleri konusunda uzmanlaşmış SK Production için kurumsal bir web sitesi ve farklı projeler için yeniden kullanılabilir bir admin paneli oluşturmayı amaçlamaktadır. Web sitesi modern, tek sayfalık bir tasarıma sahip olacak, admin paneli ise ekipman yönetimi ve proje takibi gibi temel işlevleri içerecektir.

### 1.2. Hedefler
- Modern, responsive ve minimal bir tek sayfa web sitesi geliştirmek
- Şirketin uzmanlık alanlarını (görüntü rejisi, medya server sistemleri) etkileyici görsellerle sergilemek
- Ekipman takibi, bakım zamanları ve proje yönetimi için modüler bir admin paneli oluşturmak
- Farklı kullanıcı rollerine (yönetici, teknisyen, depo sorumlusu) göre yetkilendirme sistemi sağlamak
- DRY, SOLID, Clean Code ve OOP prensiplerine uygun kod yapısı oluşturmak
- Kolay bakım yapılabilir ve genişletilebilir bir mimari tasarlamak

### 1.3. Teknoloji Yığını
- **Front-end:** Next.js, TypeScript, TailwindCSS
- **Back-end:** Node.js, Express, TypeScript
- **Veritabanı:** MongoDB Atlas
- **Kimlik Doğrulama:** JWT, HttpOnly çerezler
- **Deployment:** Vercel (front-end), Render veya Heroku (back-end)

## 2. Proje Mimarisi

### 2.1. Genel Yapı
```
project/
├── client/                  # Front-end (Next.js + TypeScript)
├── server/                  # Back-end (Node.js/Express + TypeScript)
└── README.md                # Proje dokümantasyonu
```

### 2.2. Front-end Mimarisi
```
client/
├── public/                  # Statik dosyalar
│   └── images/              # Görseller (logo, proje görselleri vb.)
├── src/
│   ├── components/          # Yeniden kullanılabilir bileşenler
│   │   ├── common/          # Genel bileşenler (Button, Input vb.)
│   │   ├── layout/          # Layout bileşenleri (Navbar, Footer vb.)
│   │   ├── modals/          # Modal bileşenleri (İletişim modal vb.)
│   │   └── sections/        # Ana sayfa bölümleri (Hero, Projects vb.)
│   ├── pages/               # Next.js sayfaları
│   │   ├── index.tsx        # Ana sayfa (tek sayfa tasarım)
│   │   └── admin/           # Admin sayfaları
│   ├── hooks/               # Özel React hook'ları
│   ├── context/             # Context API kullanımı
│   ├── services/            # API hizmetleri
│   ├── utils/               # Yardımcı fonksiyonlar
│   └── types/               # TypeScript tip tanımlamaları
├── tailwind.config.js       # Tailwind yapılandırması
├── tsconfig.json            # TypeScript yapılandırması
└── package.json             # Bağımlılıklar ve scriptler
```

### 2.3. Back-end Mimarisi
```
server/
├── src/
│   ├── config/              # Yapılandırma dosyaları
│   ├── controllers/         # İşlev denetleyicileri
│   ├── models/              # Veritabanı modelleri
│   ├── routes/              # API endpoint'leri
│   ├── middleware/          # Ara yazılımlar (Auth vb.)
│   ├── services/            # İş mantığı servisleri
│   ├── utils/               # Yardımcı fonksiyonlar
│   └── types/               # TypeScript tip tanımlamaları
├── tsconfig.json            # TypeScript yapılandırması
└── package.json             # Bağımlılıklar ve scriptler
```

## 3. Web Sitesi Özellikleri (Tek Sayfa Tasarım)

### 3.1. Navbar
- **Sol:** SK Production logosu
- **Orta:** 
  - Sayfa içi yönlendirme linkleri (Ana Sayfa, Hizmetlerimiz, Projelerimiz, Hakkımızda, İletişim)
- **Mobil:** 
  - Hamburger menü ve responsive tasarım

### 3.2. Ana Sayfa Bölümleri
- **Hero Bölümü:** Tam genişlikte, etkileyici görsel/video background ile şirket sloganı
- **Hizmetler Bölümü:** Görüntü rejisi ve medya server sistemleri hizmetlerinin modern card'larla sunumu
- **Projeler Görseli:** Otomatik geçişli, şirketin gerçekleştirdiği projelerin görsel döngüsü
- **Hakkımızda Özeti:** SK Production'ın uzmanlık alanları ve ekip bilgisi
- **Ekipman Görselleri:** Profesyonel ekipmanların (Analog Way Aquilon, Dataton Watchpax vb.) gösterimi

### 3.3. Footer
- Telif hakkı bilgisi
- İletişim bilgileri (telefon, e-posta, adres)
- Sosyal medya ikonları

## 4. Admin Paneli

### 4.1. Core Modülü
- **Kimlik Doğrulama:**
  - Giriş sayfası
  - JWT tabanlı oturum yönetimi
  - Farklı kullanıcı rolleri (Yönetici, Teknisyen, Depo Sorumlusu)
- **Yetkilendirme Sistemi:**
  - Rol tabanlı erişim kontrolü (RBAC)
  - İzin yönetimi (görüntüleme, ekleme, güncelleme, silme)
- **Temel UI Bileşenleri:**
  - Dashboard layout
  - Sidebar
  - Data table
  - Form bileşenleri
  - Card bileşenleri
  - Modal/Dialog

### 4.2. Ekipman Yönetimi Modülü
- **Envanter Takibi:**
  - Ekipman listeleme ve filtreleme
  - Ekipman ekleme/düzenleme/silme
  - Detaylı ekipman bilgileri (marka, model, seri no, vb.)
  - Ekipman kategorileri (VideoSwitcher, MediaServer, Monitor vb.)
- **Bakım Takibi:**
  - Bakım zamanları izleme
  - Bakım planlaması
  - Bakım geçmişi
- **Raporlama:**
  - Ekipman durum raporu
  - Bakım ihtiyacı olan ekipmanlar

### 4.3. Proje Yönetimi Modülü
- **Proje Takibi:**
  - Proje oluşturma ve düzenleme
  - Durum takibi (Planlama, Kurulum, Prova, Canlı, Tamamlandı)
  - Proje takvimi görünümü
- **Ekipman Atama:**
  - Projelere ekipman atama
  - Hangi ekipmanın hangi projede kullanıldığını izleme
- **Ekip Yönetimi:**
  - Projelere personel atama
  - Görev ve sorumluluk tanımlama

### 4.4. Yeniden Kullanılabilirlik Stratejisi
- **Modüler Yapı:**
  - Her işlev grubu ayrı modül olarak yapılandırılmış
  - Bağımsız çalışabilen bileşenler
- **Konfigürasyon Bazlı Yaklaşım:**
  - JSON yapılandırma dosyaları
  - Dinamik menü yapısı
- **Core + Plugins Mimarisi:**
  - Temel işlevler core'da tanımlı
  - Özel işlevler eklenti olarak eklenebilir
- **Tema Desteği:**
  - Değiştirilebilir renk şemaları
  - Özelleştirilebilir UI bileşenleri

## 5. Veritabanı Şeması

### 5.1. Kullanıcılar Koleksiyonu
```typescript
interface User {
  _id: ObjectId;
  username: string;
  email: string;
  password: string; // Hashlenerek saklanacak
  role: 'Admin' | 'Manager' | 'Technician' | 'StorageManager' | 'Viewer';
  permissions: {
    equipment: {
      view: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
    },
    projects: {
      view: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
    },
    clients: {
      view: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
    },
    users: {
      view: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
    }
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2. Ekipman Koleksiyonu
```typescript
interface Equipment {
  _id: ObjectId;
  name: string;
  category: 'VideoSwitcher' | 'MediaServer' | 'Monitor' | 'Cable' | 'AudioEquipment' | 'Other';
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: Date;
  lastMaintenanceDate: Date;
  nextMaintenanceDate: Date;
  status: 'Available' | 'InUse' | 'Maintenance' | 'Damaged';
  specifications: Record<string, string>; // Teknik özellikler
  location: string; // Depo konumu
  assignedProjects: ObjectId[]; // Atandığı projeler
  assignedUser?: ObjectId; // Ekipmanın sorumlusu 
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.3. Projeler Koleksiyonu
```typescript
interface Project {
  _id: ObjectId;
  name: string;
  client: ObjectId; // Müşteri referansı
  contactPerson: {
    name: string;
    phone: string;
    email: string;
  };
  startDate: Date;
  endDate: Date;
  location: string;
  status: 'Planning' | 'Setup' | 'Rehearsal' | 'Live' | 'Completed' | 'Cancelled';
  eventType: 'Concert' | 'Corporate' | 'Launch' | 'Award' | 'Other';
  description: string;
  equipmentList: Array<{
    equipmentId: ObjectId;
    quantity: number;
    notes: string;
  }>;
  team: Array<{
    userId: ObjectId;
    role: 'Manager' | 'Technician' | 'Helper' | 'Other';
  }>;
  tasks: Array<{
    title: string;
    description: string;
    assignedTo: ObjectId;
    status: 'ToDo' | 'InProgress' | 'Completed';
    dueDate: Date;
  }>;
  documents: string[]; // Dosya URL'leri
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.4. Müşteriler Koleksiyonu
```typescript
interface Client {
  _id: ObjectId;
  name: string;
  contactPerson: {
    name: string;
    position: string;
    email: string;
    phone: string;
  };
  address: string;
  industry: string;
  projects: ObjectId[]; // Müşterinin projeleri
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 6. API Endpointleri

### 6.1. Kimlik Doğrulama
- `POST /api/auth/login` - Giriş
- `POST /api/auth/logout` - Çıkış
- `POST /api/auth/refresh-token` - Token yenileme
- `POST /api/auth/forgot-password` - Şifremi unuttum
- `POST /api/auth/reset-password` - Şifre sıfırlama

### 6.2. Kullanıcı Yönetimi
- `GET /api/users` - Kullanıcı listesi
- `POST /api/users` - Kullanıcı oluşturma
- `GET /api/users/:id` - Kullanıcı detayı
- `PUT /api/users/:id` - Kullanıcı güncelleme
- `DELETE /api/users/:id` - Kullanıcı silme
- `PUT /api/users/:id/permissions` - Kullanıcı izinlerini güncelleme

### 6.3. Ekipman Yönetimi
- `GET /api/equipment` - Ekipman listesi
- `POST /api/equipment` - Ekipman ekleme
- `GET /api/equipment/:id` - Ekipman detayı
- `PUT /api/equipment/:id` - Ekipman güncelleme
- `DELETE /api/equipment/:id` - Ekipman silme
- `GET /api/equipment/categories` - Ekipman kategorileri
- `PUT /api/equipment/:id/maintenance` - Bakım bilgisi güncelleme
- `GET /api/equipment/status` - Ekipman durum raporu

### 6.4. Proje Yönetimi
- `GET /api/projects` - Proje listesi
- `POST /api/projects` - Proje oluşturma
- `GET /api/projects/:id` - Proje detayı
- `PUT /api/projects/:id` - Proje güncelleme
- `DELETE /api/projects/:id` - Proje silme
- `PUT /api/projects/:id/status` - Proje durum güncelleme
- `POST /api/projects/:id/equipment` - Projeye ekipman atama
- `POST /api/projects/:id/team` - Projeye ekip üyesi atama
- `GET /api/projects/calendar` - Proje takvimi

### 6.5. Müşteri Yönetimi
- `GET /api/clients` - Müşteri listesi
- `POST /api/clients` - Müşteri ekleme
- `GET /api/clients/:id` - Müşteri detayı
- `PUT /api/clients/:id` - Müşteri güncelleme
- `DELETE /api/clients/:id` - Müşteri silme
- `GET /api/clients/:id/projects` - Müşterinin projeleri

## 7. Geliştirme Yol Haritası

### 7.1. Faz 1: Temel Proje Yapısı ve SK Production Tema Kurulumu (Hafta 1) - ✅ Tamamlandı
- **Proje Temel Yapısı:** Next.js + TypeScript kurulumu ✅
- **Kod Kalitesi Araçları:** ESLint, Prettier, Husky, lint-staged konfigürasyonu ✅
- **Stil Kütüphanesi:** TailwindCSS kurulumu ve SK Production renklerine uygun tema yapılandırması ✅
- **Klasör Yapısı:** Modüler yapıya uygun klasör organizasyonu oluşturma ✅
- **Git Stratejisi:** Branching stratejisi ve commit standartlarının belirlenmesi ✅

### 7.2. Faz 2: Kimlik Doğrulama Altyapısı ve Veritabanı Modelleri (Hafta 2) - ✅ Tamamlandı
- **Veritabanı Bağlantısı:** MongoDB Atlas kurulumu ve bağlantısı ✅
- **Auth Sistemi:** JWT tabanlı kimlik doğrulama ve HttpOnly çerezler ✅
- **RBAC Sistemi:** SK Production'a özel rol ve izin yapısının oluşturulması ✅
- **Veri Modelleri:** Ekipman, Proje, Müşteri ve Kullanıcı şemalarının oluşturulması ✅
- **Güvenlik Katmanı:** Rate limiting, input validasyon ve sanitizasyon ✅

### 7.3. Faz 3: Web Sitesi Geliştirme (Hafta 3-4) - ✅ Tamamlandı
- **Hero Bölümü:** Modern ve etkileyici tasarım ✅
- **Hizmetler Bölümü:** SK Production hizmetlerinin sunumu ✅
- **Projeler Görseli:** Otomatik geçişli proje carousel'i ✅
- **Hakkımızda Bölümü:** Şirket bilgileri ve ekip tanıtımı ✅
- **İletişim Bölümü:** İletişim formu ve harita entegrasyonu ✅
- **Responsive Tasarım:** Tüm cihazlarda sorunsuz çalışan arayüz ✅

### 7.4. Faz 4: Admin Paneli Temel Bileşenleri (Hafta 5-6) - ✅ Tamamlandı
- **Layout Bileşenleri:** Admin panel yapısı, sidebar, header ✅
- **Form Bileşenleri:** Input, Button, Dropdown, Checkbox, Radio gibi temel bileşenler ✅
- **Veri Görüntüleme:** Table, Card, List gibi içerik bileşenleri ✅
- **Modal/Dialog Sistemi:** Bildirim ve etkileşim için modal bileşenleri ✅
- **Dashboard:** Özet bilgiler ve grafiklerin gösterildiği ana panel ✅

### 7.5. Faz 5: Ekipman Yönetimi Modülü (Hafta 7-8) - ✅ Tamamlandı
- **Ekipman Listesi:** Filtrelenebilir ve aranabilir ekipman tablosu ✅
- **Ekipman Formları:** Ekleme, düzenleme işlemleri ✅
- **Bakım Takibi:** Bakım planlaması ve izleme sistemi ✅
- **Kategoriler:** Ekipman kategorileri yönetimi ✅
- **Raporlama:** Ekipman durumu ve bakım raporları ✅

### 7.6. Faz 6: Proje Yönetimi Modülü (Hafta 9-10) - ✅ Tamamlandı
- **Proje Listesi:** Filtrelenebilir ve aranabilir proje tablosu ✅
- **Proje Detayı:** Detaylı proje bilgileri ve tarihçe ✅
- **Ekipman Atama:** Projelere ekipman atama sistemi ✅
- **Ekip Atama:** Projelere personel atama sistemi ✅
- **Takvim Görünümü:** Proje takvimine genel bakış ✅

### 7.7. Faz 7: Müşteri Yönetimi ve İlişkiler (Hafta 11) - ✅ Tamamlandı
- **Müşteri Listesi:** Filtrelenebilir ve aranabilir müşteri tablosu ✅
- **Müşteri Detayı:** Detaylı müşteri bilgileri ve proje geçmişi ✅
- **Müşteri Formları:** Ekleme, düzenleme işlemleri ✅
- **Proje İlişkileri:** Müşteri-proje bağlantıları ✅
- **Raporlama:** Müşteri bazlı proje raporları ✅

### 7.8. Faz 8: Performans ve Güvenlik Optimizasyonu (Hafta 12) - ⏳ Devam Ediyor
- **SEO Optimizasyonu:** Meta etiketleri ve yapılandırılmış veri ✅
- **Performans İyileştirmeleri:** Code splitting, lazy loading, image optimization ⏳
- **Güvenlik Testleri:** Penetrasyon testleri ve güvenlik taramaları ⏳

### 7.9. Faz 9: Test ve Dokümantasyon (Hafta 13) - ⏳ Devam Ediyor
- **Unit Testler:** Jest ve React Testing Library ile testler ⏳
- **Integration Testler:** API ve bileşen entegrasyon testleri ⏳
- **API Dokümantasyonu:** Swagger/OpenAPI ile API dokümantasyonu ⏳
- **Kullanıcı Kılavuzları:** Admin panel ve web sitesi kullanım kılavuzları ⏳

### 7.10. Faz 10: Deployment ve Monitoring (Hafta 14) - ⏳ Devam Ediyor
- **Vercel Deployment:** Frontend deployment ve CDN yapılandırması ⏳
- **Backend Deployment:** API sunucusu deployment ve ölçeklendirme ⏳
- **Monitoring Sistemi:** Performans ve hata izleme sistemi ⏳

## 8. Admin Paneli Yeniden Kullanılabilirlik Stratejisi

### 8.1. Modüler Yapı
- Her işlev grubu (auth, equipment, projects, vb.) ayrı modüller olarak geliştirilecek
- Her modül bağımsız olarak çalışabilir ve test edilebilir

### 8.2. Konfigürasyon Bazlı Yaklaşım
- JSON yapılandırma dosyaları ile özelleştirilebilir UI ve işlevsellik
- Dinamik olarak yüklenebilen bileşenler
- Proje bazlı ayarlar için merkezi yapılandırma sistemi

### 8.3. Core + Plugins Mimarisi
- **Core:** Temel işlevler ve bileşenler (auth, layout, common components)
- **Plugins:** Projeye özel eklentiler (equipment management, project management)
- Plugin sistemi için standart arayüz tanımları

### 8.4. Tema Desteği
- Farklı projeler için farklı görünümler uygulanabilir
- CSS değişkenleri ve Tailwind temaları ile kolay özelleştirme
- Tema seçimi ve yönetimi için arayüz

## 9. Güvenlik Önlemleri

### 9.1. Kimlik Doğrulama
- JWT tabanlı token sistemi
- HttpOnly çerezleri
- Refresh token stratejisi
- Oturum süresi ve yenileme politikaları

### 9.2. Yetkilendirme
- Role-Based Access Control (RBAC)
- Granüler izin sistemi
- API endpoint'lerinde yetki kontrolü

### 9.3. Veri Güvenliği
- Input validasyonu ve sanitizasyonu
- CSRF koruması
- Rate limiting
- IP bazlı filtreleme ve engelleme sistemi

### 9.4. Güvenli Veritabanı İşlemleri
- Şifreler için güçlü hash algoritmaları (bcrypt)
- Veritabanı bağlantıları için şifreleme
- Ayrıcalık prensibi (principle of least privilege)

## 10. Deployment Stratejisi

### 10.1. Front-end Deployment
- Vercel platformu kullanımı
- CI/CD pipeline entegrasyonu
- Önizleme dağıtımları (preview deployments)
- CDN yapılandırması

### 10.2. Back-end Deployment
- Render veya Heroku platformu
- Environment variables yönetimi
- Health check ve monitoring
- Otomatik ölçeklendirme yapılandırması

### 10.3. Veritabanı Deployment
- MongoDB Atlas yapılandırması
- Backup ve restore stratejileri
- Veritabanı indeksleme optimizasyonları

## 11. Öneriler ve Yorumlar

### 11.1. TypeScript Kullanımı
TypeScript kullanmanız kesinlikle tavsiye edilir. Sağladığı avantajlar:
- Statik tip kontrolleri sayesinde daha güvenli kod
- Daha iyi otomatik tamamlama ve IDE desteği
- Daha okunabilir ve bakımı kolay kod
- Büyük projelerde ve ekip çalışmalarında hataları azaltır
- Karmaşık ekipman ve proje şemalarını tanımlamak için ideal

### 11.2. Veritabanı Seçimi
MongoDB, bu proje için ideal bir seçimdir:
- Esnek şema, farklı ekipman özelliklerini kaydetmek için uygun
- JavaScript/TypeScript ile doğal uyum
- Karmaşık proje ve ekipman ilişkilerini modelleme kolaylığı
- Cloud çözümü ile kolay skalabilite

### 11.3. Admin Paneli Stratejisi
Admin panelini gerçekten yeniden kullanılabilir yapmak için şu yöntemler önerilir:
- Mikro frontend yaklaşımı
- Tema ve stil değişkenleri
- Dinamik form ve tablo bileşenleri

### 11.4. Web Sitesi Yaklaşımı
SK Production için tek sayfalık, minimal ve yüksek görsel etkisi olan bir yaklaşım:
- Yüksek kaliteli proje görselleri
- Modern animasyonlar ve geçişler
- Mobil cihazlarda mükemmel deneyim

## 12. İlave Teknik Stratejiler ve Araçlar

### 12.1. Gelişmiş State Yönetimi
Karmaşık state yönetimi gereksinimleri için:
- **Redux Toolkit veya Zustand:** Büyük ölçekli durum yönetimi için
- **React Context API:** Orta ölçekli durum yönetimi için
- **React Query / SWR:** API veri alma ve önbelleğe alma için 
- **Optimistik UI Güncellemeleri:** Kullanıcı deneyimini iyileştirmek için

### 12.2. Form Yönetimi ve Validasyon
- **React Hook Form:** Performanslı form yönetimi için
- **Zod / Yup:** Form validasyon şemaları için 
- **Controlled vs Uncontrolled Components:** Farklı form senaryoları için stratejiler

### 12.3. Kod Kalitesi ve Standartları
- **ESLint:** Kod kalitesi kontrolü
- **Prettier:** Otomatik kod formatlama
- **Husky + lint-staged:** Commit öncesi kalite kontrolleri
- **TypeScript Strict Mode:** Tip güvenliği için 
- **Commitlint:** Commit mesaj standartlarını korumak için

### 12.4. Performans Optimizasyonu
- **Next.js Image Optimizasyonu:** Görsel yükleme performansı için
- **Code Splitting:** Dynamic import ve lazy loading
- **Bundle Analizi:** webpack-bundle-analyzer ile paket boyutunu izleme
- **Web Vitals Monitoring:** Temel web metriklerini izleme
- **Memoization Stratejileri:** React.memo, useMemo ve useCallback

### 12.5. İleri Düzey Güvenlik Önlemleri
- **CSP (Content Security Policy):** XSS saldırılarını önlemek için
- **Dependency Scanning:** npm audit ve snyk ile bağımlılık güvenliği
- **2FA (İki Faktörlü Kimlik Doğrulama):** Admin paneli için ek güvenlik
- **CSRF Koruması:** Cross-site request forgery saldırılarına karşı
- **Penetrasyon Testleri:** Düzenli güvenlik değerlendirmeleri
- **Rate Limiting:** Brute force saldırılarını engellemek için

### 12.6. CI/CD ve DevOps
- **GitHub Actions / CircleCI:** Otomatik test ve dağıtım
- **Docker Containerization:** Geliştirme ortamı standardizasyonu
- **Jest ve React Testing Library:** Unit ve entegrasyon testleri
- **Cypress / Playwright:** End-to-end testler
- **Pre-commit Hooks:** Commit öncesi kod kontrolü

### 12.7. Ölçeklenebilirlik Stratejileri
- **Mikro Frontend Mimarisi:** Büyük ekipler için modüler yapı
- **API Gateway:** Backend servisleri için tek giriş noktası
- **Server-Side Caching:** Redis ile performans optimizasyonu
- **GraphQL Düşünme:** Esnek API sorguları için

### 12.8. Kullanıcı Deneyimi İyileştirmeleri
- **Skeleton Loading Screens:** İçerik yükleme sırasında
- **Error Boundaries:** Hata yönetimi için
- **Internationalization (i18n):** next-i18next ile çoklu dil desteği
- **Analytics Entegrasyonu:** Google Analytics, Hotjar veya Plausible
- **A/B Testing Altyapısı:** Farklı UI varyasyonlarını test etmek için

### 12.9. Erişilebilirlik (Accessibility)
- **WCAG 2.1 AA Uyumluluğu:** Erişilebilir web standartları
- **Screen Reader Uyumluluğu:** ARIA attributes ve semantik HTML
- **Klavye Navigasyonu:** Tüm özelliklerin klavye ile kullanılabilirliği
- **Renk Kontrastı Kontrolleri:** Görsel erişilebilirlik
- **axe-core / jest-axe:** Erişilebilirlik testleri

### 12.10. Mobil Strateji
- **Progressive Web App (PWA):** Offline kullanım ve mobil deneyim
- **Responsive Design Sistemi:** Tüm cihazlarda tutarlı deneyim
- **Touch Optimizasyonu:** Mobil cihazlar için dokunmatik arayüz iyileştirmeleri

### 12.11. SEO Optimizasyonu
- **Meta Etiketler:** Sayfalar için meta açıklamaları, anahtar kelimeler ve sosyal medya meta etiketleri
- **Yapılandırılmış Veri:** Schema.org yapılandırılmış verilerini ekleyerek arama motorlarına daha iyi bilgi sunumu
- **Canonical URL'ler:** Tekrarlanan içerikleri önlemek için canonical URL'lerin kullanımı
- **XML Sitemap:** Arama motorları için site haritası oluşturma
- **Next.js SEO Bileşenleri:** next-seo, next-sitemap gibi kütüphanelerin entegrasyonu
- **Performans Metrikleri:** Core Web Vitals metrikleri takibi ve optimizasyonu

### 12.12. Eksik Sayfalar ve Hata Yönetimi
- **Özel 404 Sayfası:** Kullanıcı dostu, markayla uyumlu 404 hata sayfası
- **Gizlilik Politikası ve Kullanım Şartları:** Yasal gerekliliklere uygun sayfalar
- **Proje Detay Sayfaları:** Proje kartlarına tıklandığında açılacak detay sayfaları
- **500 Hata Sayfası:** Sunucu hatalarını zarif bir şekilde yönetme
- **Erişim Reddedildi (403) Sayfası:** Yetkisiz erişim durumları için özel sayfa
- **Bakım Modu Sayfası:** Planlı bakım zamanlarında gösterilecek sayfa

## 13. Geliştirme Notları ve Sorun Giderme

### 13.1. Next.js Hydration Sorunları

Next.js uygulamalarında server-side rendering (SSR) ve client-side rendering arasındaki uyumsuzluklar (hydration mismatch) yaygın sorunlardır. Bu sorunlar genellikle aşağıdaki durumlarda ortaya çıkar:

- Tarayıcı eklentilerinin HTML'e ekstra öznitelikler eklemesi (`cz-shortcut-listen="true"` gibi)
- Sunucu ve istemci tarafında farklı içerikler oluşturan dinamik içerikler
- Geçersiz HTML yapıları
- `Date`, `Math.random()` gibi değişken değerler üreten fonksiyonların kullanımı

#### Çözüm Stratejileri:

1. **Hydration Uyarılarını Bastırma**
   ```jsx
   <body suppressHydrationWarning>
     {children}
   </body>
   ```

2. **Strict Mode Etkinleştirme**
   ```js
   // next.config.js
   const nextConfig = {
     reactStrictMode: true,
     // Diğer yapılandırmalar...
   };
   ```

3. **Client-Only Bileşenler**
   ```jsx
   import { useEffect, useState } from 'react';

   const ClientOnlyComponent = ({ children }) => {
     const [isClient, setIsClient] = useState(false);
     
     useEffect(() => {
       setIsClient(true);
     }, []);
     
     return isClient ? children : null;
   };
   ```

4. **Dynamic Değerler İçin useEffect**
   ```jsx
   const [currentDate, setCurrentDate] = useState(null);
   
   useEffect(() => {
     setCurrentDate(new Date().toLocaleString());
   }, []);
   ```

### 13.2. Next.js Yapılandırma Önerileri

Next.js yapılandırmasında (`next.config.js`) güncel sürüme göre aşağıdaki ayarlar önerilir:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Next.js 15+ için doğru yapılandırma
  serverExternalPackages: [],
};

module.exports = nextConfig;
```

### 13.3. Performans Optimizasyonu

- Büyük bileşenler için lazy loading ve React.lazy kullanın
- Görsel optimizasyonu için Next.js Image bileşenini kullanın
- API isteklerini önbelleğe almak için React Query veya SWR kullanın
- Kullanıcı etkileşiminden önce görünmeyen bileşenleri geciktirerek yükleyin
- Gereksiz render'ları önlemek için memoization (useMemo, useCallback) kullanın

### 13.4. Erişilebilirlik Standartları

Projenin WCAG 2.1 AA standartlarına uygun olması için:

- Tüm etkileşimli öğelerde uygun keyboard erişimi
- Tüm görsel öğelerde alt metinleri
- 4.5:1 minimum kontrast oranı
- Form elemanlarında uygun label ve aria attribute'ları
- Screen reader uyumluluğu

## 14. Eksik Yapılandırmalar ve Düzeltilmesi Gereken Noktalar

### 14.1. Klasör Yapısı Düzenlemeleri

#### Client Tarafı
```bash
client/
├── src/
│   ├── components/          # Yeniden kullanılabilir bileşenler
│   │   ├── common/          # Genel bileşenler
│   │   ├── layout/          # Layout bileşenleri
│   │   ├── modals/          # Modal bileşenleri
│   │   └── sections/        # Sayfa bölümleri
│   ├── pages/               # Next.js sayfaları
│   ├── hooks/               # Özel React hook'ları
│   ├── context/             # Context API kullanımı
│   ├── services/            # API hizmetleri
│   ├── utils/               # Yardımcı fonksiyonlar
│   └── types/               # TypeScript tip tanımlamaları
```

#### Server Tarafı
```bash
server/
├── src/
│   ├── config/              # Yapılandırma dosyaları
│   ├── controllers/         # İşlev denetleyicileri
│   ├── models/              # Veritabanı modelleri
│   ├── routes/              # API endpoint'leri
│   ├── middleware/          # Ara yazılımlar
│   ├── services/            # İş mantığı servisleri
│   ├── utils/               # Yardımcı fonksiyonlar
│   └── types/               # TypeScript tip tanımlamaları
```

### 14.2. Güvenlik Yapılandırmaları

#### Environment Variables
```bash
# .env.example
NEXT_PUBLIC_API_URL=http://localhost:3001
MONGODB_URI=mongodb://localhost:27017/skproduction
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

#### Güvenlik Middleware'leri
```typescript
// server/src/middleware/security.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  })
];
```

### 14.3. Test Yapılandırması

#### Jest Konfigürasyonu
```javascript
// client/jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### E2E Test Yapılandırması
```javascript
// client/cypress.config.js
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}'
  }
};
```

### 14.4. Dokümantasyon Yapılandırması

#### Swagger/OpenAPI
```typescript
// server/src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SK Production API',
      version: '1.0.0',
      description: 'SK Production API dokümantasyonu'
    }
  },
  apis: ['./src/routes/*.ts']
};
```

#### Storybook Yapılandırması
```javascript
// client/.storybook/main.js
module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials'
  ],
  framework: '@storybook/react'
};
```

### 14.5. Performans Optimizasyonları

#### Next.js Image Optimizasyonu
```javascript
// next.config.js
const nextConfig = {
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  }
};
```

#### Bundle Analizi
```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

module.exports = withBundleAnalyzer(nextConfig);
```

### 14.6. CI/CD Yapılandırması

#### GitHub Actions
```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run E2E tests
        run: npm run test:e2e
```

### 14.7. Erişilebilirlik Yapılandırması

#### axe-core Entegrasyonu
```typescript
// client/src/utils/accessibility.ts
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

export const checkAccessibility = async (component: React.ReactElement) => {
  const { container } = render(component);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};
```

### 14.8. Monitoring ve Logging

#### Sentry Entegrasyonu
```typescript
// client/src/utils/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### Logging Middleware
```typescript
// server/src/middleware/logging.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

export const loggingMiddleware = (req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
};
```

## 15. Önerilen Sonraki Adımlar

1. **Klasör Yapısının Oluşturulması**
   - Eksik klasörlerin oluşturulması
   - Temel dosyaların yerleştirilmesi
   - Import/export yapılarının düzenlenmesi

2. **Güvenlik Yapılandırmalarının Tamamlanması**
   - Environment variables yönetimi
   - Güvenlik middleware'lerinin eklenmesi
   - Input validasyonlarının güçlendirilmesi

3. **Test Altyapısının Kurulması**
   - Unit testlerin yazılması
   - Integration testlerin hazırlanması
   - E2E testlerin oluşturulması

4. **Dokümantasyon Araçlarının Entegrasyonu**
   - Swagger/OpenAPI kurulumu
   - Storybook entegrasyonu
   - JSDoc/TSDoc kullanımı

5. **Performans Optimizasyonlarının Yapılması**
   - Code splitting stratejisinin uygulanması
   - Bundle analizi ve optimizasyonu
   - Web Vitals izleme sisteminin kurulması

6. **Monitoring ve Logging Sisteminin Kurulması**
   - Sentry entegrasyonu
   - Logging middleware'lerinin eklenmesi
   - Performans izleme araçlarının kurulumu

7. **Erişilebilirlik İyileştirmeleri**
   - WCAG 2.1 AA uyumluluğunun sağlanması
   - Screen reader uyumluluğunun test edilmesi
   - Klavye navigasyonunun iyileştirilmesi

8. **SEO Optimizasyonları**
   - Meta etiketlerinin düzenlenmesi
   - Yapılandırılmış verilerin eklenmesi
   - XML sitemap oluşturulması

9. **Deployment ve CI/CD**
   - Vercel yapılandırması
   - GitHub Actions workflow'larının hazırlanması
   - Monitoring sisteminin kurulması

10. **Dokümantasyon ve Kullanıcı Kılavuzları**
    - API dokümantasyonunun hazırlanması
    - Kullanıcı kılavuzlarının oluşturulması
    - Geliştirici dokümantasyonunun hazırlanması
