# SK Production - Ürün Spesifikasyon Belgesi (PRD)

## 1. Proje Amacı ve Hedefi

### 1.1 Genel Bakış
SK Production, görüntü rejisi ve medya server hizmetleri sunan bir şirket için geliştirilmiş kapsamlı bir web sitesi ve admin paneli sistemidir. Sistem, şirketin hizmetlerini tanıtmak, müşteri projelerini yönetmek, ekipman envanterini takip etmek ve operasyonel süreçleri dijitalleştirmek amacıyla tasarlanmıştır.

### 1.2 Temel Hedefler
- **Müşteri Yönetimi**: Müşteri bilgileri, proje geçmişi ve iletişim bilgilerinin merkezi yönetimi
- **Proje Takibi**: Etkinlik projelerinin oluşturulması, planlanması ve durum takibi
- **Ekipman Yönetimi**: Teknik ekipmanların (LED wall, medya server, switcher vb.) envanter takibi, bakım planlaması ve QR kod ile hızlı erişim
- **Operasyonel Verimlilik**: Görev atama, takvim yönetimi, bildirim sistemi ile ekip koordinasyonu
- **Raporlama ve Analiz**: Dashboard üzerinden istatistikler, grafikler ve export özellikleri

---

## 2. Ürün Özellikleri

### 2.1 Web Sitesi (Public)

#### 2.1.1 Ana Sayfa
- **Hero Bölümü**: Tam genişlikte görsel/video arka plan ile şirket tanıtımı
- **Hizmetler Bölümü**: Görüntü rejisi ve medya server hizmetlerinin sunumu
- **Proje Galerisi**: Otomatik geçişli carousel ile tamamlanmış proje görselleri
- **İletişim Formu**: Müşteri iletişim talepleri için form
- **Çoklu Dil Desteği**: Türkçe, İngilizce, Fransızca, İspanyolca

#### 2.1.2 Teknik Özellikler
- Responsive tasarım (mobil, tablet, desktop)
- Dark mode desteği
- SEO optimizasyonu (meta tags, structured data, sitemap)
- PWA (Progressive Web App) özellikleri
- Offline mode desteği

### 2.2 Admin Paneli (/admin)

#### 2.2.1 Dashboard
- **İstatistikler**: Toplam proje, aktif görev, ekipman durumu, müşteri sayısı
- **Grafikler**: Proje durum dağılımı, aylık gelir trendi, ekipman kullanım oranları
- **Widget Sistemi**: Draggable ve resizable widget'lar ile özelleştirilebilir dashboard
- **Özet Bilgiler**: Yaklaşan bakımlar, acil görevler, son aktiviteler

#### 2.2.2 Ekipman Yönetimi
- **CRUD İşlemleri**: Ekipman ekleme, düzenleme, silme, görüntüleme
- **Kategorilendirme**: Video Switcher, Media Server, Monitor, Cable, Audio Equipment
- **Durum Takibi**: Available, In Use, Maintenance, Damaged
- **QR Kod Sistemi**: Her ekipman için otomatik QR kod oluşturma ve yazdırma
- **Bakım Planlaması**: Bakım tarihleri, hatırlatmalar, bakım geçmişi
- **Görsel Yönetimi**: Ekipman fotoğrafları upload ve görüntüleme

#### 2.2.3 Proje Yönetimi
- **Proje Oluşturma**: Müşteri, tarih, lokasyon, ekipman listesi ile proje oluşturma
- **Durum Yönetimi**: Planning, In Progress, Completed, Cancelled
- **Otomatik Durum Güncellemesi**: Tarih bazlı otomatik durum değişiklikleri
- **Proje Detayları**: Proje bilgileri, atanan ekipmanlar, görevler, notlar
- **Görsel Galeri**: Proje görselleri upload ve kategorilendirme

#### 2.2.4 Müşteri Yönetimi
- **Müşteri Bilgileri**: İsim, iletişim, adres, vergi bilgileri
- **Proje Geçmişi**: Müşterinin geçmiş projeleri ve detayları
- **İletişim Logları**: Müşteri ile yapılan görüşmeler ve notlar

#### 2.2.5 Görev Yönetimi
- **Görev Atama**: Kullanıcılara görev atama, öncelik belirleme
- **Durum Takibi**: To Do, In Progress, Completed, Blocked
- **Takvim Entegrasyonu**: Görevlerin takvim görünümünde görüntülenmesi
- **Bildirimler**: Görev atamaları ve güncellemeleri için email/push bildirimleri

#### 2.2.6 Bakım Yönetimi
- **Bakım Planlama**: Ekipman bakım tarihleri ve hatırlatmalar
- **Bakım Kayıtları**: Yapılan bakımların kayıtları ve notları
- **Otomatik Hatırlatmalar**: Yaklaşan bakımlar için bildirimler

#### 2.2.7 Takvim
- **Görünüm Seçenekleri**: Ay, Hafta, Gün görünümleri
- **Drag & Drop**: Proje ve bakım tarihlerini sürükle-bırak ile güncelleme
- **Filtreleme**: Proje tipi, durum, atanan kişi bazlı filtreleme

#### 2.2.8 Kullanıcı Yönetimi
- **Rol Bazlı Erişim Kontrolü (RBAC)**:
  - **ADMIN**: Tüm yetkilere sahip
  - **FIRMA_SAHIBI**: Tüm yetkilere sahip
  - **PROJE_YONETICISI**: Proje ve görev yönetimi
  - **DEPO_SORUMLUSU**: Ekipman ve bakım yönetimi
  - **TEKNISYEN**: Sadece görüntüleme (okuma yetkisi)
- **Permission Yönetimi**: Detaylı yetki kontrolü (view, create, update, delete)
- **2FA Desteği**: Opsiyonel iki faktörlü kimlik doğrulama (Google Authenticator)

#### 2.2.9 Site İçerik Yönetimi
- **Hero Bölümü**: Ana sayfa hero içeriği düzenleme
- **Hizmetler Bölümü**: Hizmet açıklamaları ve görselleri
- **Hakkımızda**: Şirket bilgileri ve hikayesi
- **İletişim**: İletişim bilgileri ve form ayarları

#### 2.2.10 Site Görsel Yönetimi
- **Görsel Upload**: Proje galerisi için görsel yükleme
- **Kategorilendirme**: Görsellerin kategorilere ayrılması
- **Sıralama**: Görsellerin sıralamasını değiştirme

#### 2.2.11 Raporlama ve Export
- **CSV Export**: Ekipman, proje, görev, müşteri listelerini CSV olarak export
- **Excel Export**: Detaylı Excel raporları
- **PDF Export**: Dashboard ve proje raporlarını PDF olarak export
- **Rapor Zamanlama**: Otomatik rapor gönderimi için zamanlama

#### 2.2.12 Diğer Özellikler
- **Global Search**: Tüm modüllerde arama
- **Bildirim Sistemi**: Real-time SSE bildirimleri, email ve push notifications
- **Audit Trail**: Tüm kullanıcı aktivitelerinin loglanması
- **Versiyon Geçmişi**: Veri değişikliklerinin versiyon takibi
- **Oturum Yönetimi**: Aktif oturumların görüntülenmesi ve sonlandırılması
- **Webhook Desteği**: Event-based webhook'lar
- **Email Template Sistemi**: HTML email template'leri

---

## 3. Nasıl Çalışır?

### 3.1 Mimari Yapı

#### 3.1.1 Frontend (Next.js 14)
- **Framework**: Next.js 14 App Router
- **State Management**: Redux Toolkit + React Query
- **Styling**: TailwindCSS
- **HTTP Client**: Axios (interceptor ile token yönetimi)
- **Authentication**: JWT token (localStorage/sessionStorage)
- **Routing**: Next.js App Router ile `/admin/*` route'ları

#### 3.1.2 Backend (Express)
- **Framework**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + HttpOnly cookies (refresh token)
- **Authorization**: Middleware tabanlı RBAC
- **File Storage**: Local file system (`uploads/` klasörü)
- **API**: RESTful API yapısı

#### 3.1.3 Güvenlik Katmanları
- **JWT Doğrulama**: Her API isteğinde token kontrolü
- **RBAC**: Rol ve permission bazlı endpoint koruması
- **Rate Limiting**: API rate limiting (auth, upload, export için özel limitler)
- **CORS**: Sadece izin verilen origin'lerden istek kabul
- **CSRF Protection**: Origin check ile CSRF koruması
- **Input Validation**: Express-validator ile input doğrulama
- **XSS Protection**: Input sanitization

### 3.2 Kullanıcı Akışları

#### 3.2.1 Admin Girişi
1. Kullanıcı `/admin` sayfasına gider
2. Email ve şifre ile giriş yapar
3. Eğer 2FA aktifse, Google Authenticator kodu istenir
4. Başarılı girişte JWT token alınır ve localStorage'a kaydedilir
5. Dashboard'a yönlendirilir

#### 3.2.2 Proje Oluşturma
1. Admin panelinde "Projeler" menüsüne gider
2. "Yeni Proje" butonuna tıklar
3. Müşteri seçer, proje bilgilerini doldurur
4. Ekipmanları seçer ve projeye atar
5. Proje kaydedilir ve durum "Planning" olarak ayarlanır
6. İlgili kullanıcılara bildirim gönderilir

#### 3.2.3 Ekipman Takibi
1. Depo sorumlusu "Ekipman" menüsüne gider
2. Ekipman listesini görüntüler
3. QR kod ile hızlı erişim sağlar
4. Bakım tarihlerini planlar
5. Ekipman durumunu günceller (Available, In Use, Maintenance)

#### 3.2.4 Görev Atama
1. Proje yöneticisi bir projeye görev ekler
2. Görevi bir kullanıcıya atar
3. Öncelik ve deadline belirler
4. Sistem otomatik olarak atanan kullanıcıya email/push bildirimi gönderir
5. Kullanıcı görevi görüntüler ve durumunu günceller

### 3.3 Veri Akışı

#### 3.3.1 API İstekleri
1. Frontend, Axios ile API isteği yapar
2. Request interceptor otomatik olarak JWT token'ı header'a ekler
3. Backend `authenticate` middleware token'ı doğrular
4. `requirePermission` middleware kullanıcının yetkisini kontrol eder
5. Controller işlemi gerçekleştirir ve response döner
6. Response interceptor 401 hatası durumunda token yenileme dener

#### 3.3.2 Dosya Upload
1. Kullanıcı dosya seçer ve upload eder
2. Frontend dosyayı multipart/form-data olarak gönderir
3. Backend Multer middleware dosyayı alır
4. Dosya tipine göre (`videos/`, `site-images/`, `general/`) klasöre kaydedilir
5. Resim dosyaları otomatik optimize edilir (background'da)
6. Dosya URL'i frontend'e döner

#### 3.3.3 Bildirim Sistemi
1. Backend'de bir event oluşur (görev atama, bakım hatırlatması vb.)
2. Notification service event'i yakalar
3. Kullanıcının bildirim tercihlerine göre email/push gönderilir
4. Real-time bildirim için SSE (Server-Sent Events) kullanılır
5. Frontend bildirim merkezinde yeni bildirimi gösterir

---

## 4. Teknik Gereksinimler

### 4.1 Geliştirme Ortamı
- **Node.js**: 18.x veya üzeri
- **npm**: 9.x veya üzeri
- **MongoDB**: 7.0 veya üzeri (MongoDB Atlas önerilir)
- **Git**: Versiyon kontrolü için

### 4.2 Production Ortamı
- **Frontend Hosting**: Vercel (önerilen) veya Render
- **Backend Hosting**: Render veya Heroku
- **Database**: MongoDB Atlas
- **File Storage**: Local file system (Render) veya AWS S3/Cloudinary (opsiyonel)
- **Domain**: Custom domain (örn: skpro.com.tr)

### 4.3 Environment Variables

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api.skpro.com.tr/api
NEXT_PUBLIC_BACKEND_URL=https://api.skpro.com.tr
```

#### Backend (.env)
```
NODE_ENV=production
PORT=5001
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
CLIENT_URL=https://skpro.com.tr
CORS_ORIGIN=https://skpro.com.tr
```

---

## 5. Kullanım Senaryoları

### Senaryo 1: Yeni Etkinlik Projesi
1. Müşteri iletişim formu doldurur veya telefon ile iletişime geçer
2. Admin panelinde yeni müşteri oluşturulur (eğer yoksa)
3. Yeni proje oluşturulur, tarih ve lokasyon belirlenir
4. Gerekli ekipmanlar seçilir ve projeye atanır
5. Proje durumu "Planning" olarak ayarlanır
6. İlgili ekip üyelerine görevler atanır
7. Proje tarihi yaklaştığında otomatik olarak "In Progress" durumuna geçer
8. Proje tamamlandığında "Completed" olarak işaretlenir

### Senaryo 2: Ekipman Bakımı
1. Sistem yaklaşan bakım tarihlerini kontrol eder
2. Depo sorumlusuna bildirim gönderilir
3. Depo sorumlusu bakım kaydı oluşturur
4. Bakım yapılır ve notlar eklenir
5. Ekipman durumu "Available" olarak güncellenir
6. Bir sonraki bakım tarihi otomatik olarak planlanır

### Senaryo 3: QR Kod ile Hızlı Erişim
1. Teknisyen sahada bir ekipmanın QR kodunu okutur
2. Mobil cihazda ekipman detay sayfası açılır
3. Ekipman bilgileri, bakım geçmişi ve kullanım durumu görüntülenir
4. Gerekirse bakım notu eklenebilir

### Senaryo 4: Raporlama
1. Admin dashboard'dan istatistikleri görüntüler
2. Belirli bir dönem için Excel raporu oluşturur
3. Rapor otomatik olarak email ile gönderilir (zamanlanmış rapor)
4. PDF formatında proje özeti oluşturulur

---

## 6. Test Edilmesi Gereken Özellikler

### 6.1 Kritik Akışlar
- ✅ Admin girişi ve authentication
- ✅ Proje oluşturma ve durum yönetimi
- ✅ Ekipman CRUD işlemleri
- ✅ Görev atama ve takibi
- ✅ Dosya upload ve görüntüleme
- ✅ Bildirim sistemi (email/push)
- ✅ RBAC ve permission kontrolü

### 6.2 Güvenlik Testleri
- ✅ JWT token doğrulama
- ✅ Permission bazlı endpoint koruması
- ✅ CSRF koruması
- ✅ XSS koruması
- ✅ Rate limiting
- ✅ Input validation

### 6.3 Performans Testleri
- ✅ Dashboard yükleme süresi
- ✅ Büyük veri setlerinde listeleme
- ✅ Dosya upload performansı
- ✅ API response süreleri

---

## 7. Sonuç

SK Production sistemi, görüntü rejisi ve medya server hizmetleri için kapsamlı bir yönetim platformudur. Sistem, modern web teknolojileri kullanılarak geliştirilmiş, güvenli, ölçeklenebilir ve kullanıcı dostu bir yapıya sahiptir. Tüm temel özellikler tamamlanmış, production'a hazır durumdadır.

**Versiyon**: 2.0.0  
**Durum**: Production Ready ✅  
**Son Güncelleme**: 2026-01-15
