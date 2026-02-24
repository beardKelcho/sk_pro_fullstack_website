# 📅 Calendar Entegrasyonları

> **Tarih**: 2026-01-18  
> **Durum**: Tamamlandı ✅

---

## 📊 Genel Bakış

Proje artık **Google Calendar** ve **Outlook Calendar** ile senkronizasyon desteği sunuyor. Kullanıcılar dış takvimlerini proje takvimi ile senkronize edebilir.

---

## 🎯 Desteklenen Özellikler

### ✅ Tamamlanan Özellikler

1. **Google Calendar Sync**
   - OAuth2 authentication
   - Calendar import (Google'dan projelere)
   - Calendar export (Projelerden Google'a)
   - Token refresh otomatik yönetimi

2. **Outlook Calendar Sync**
   - Microsoft Graph API authentication
   - Calendar import (Outlook'tan projelere)
   - Calendar export (Projelerden Outlook'a)
   - Token refresh otomatik yönetimi

3. **iCal Import/Export**
   - iCal dosyası yükleme
   - iCal dosyası indirme
   - Proje ve bakım etkinlikleri

---

## 🚀 Kurulum

### 1. Google Calendar Entegrasyonu

#### 1.1. Google Cloud Console Setup

1. [Google Cloud Console](https://console.cloud.google.com/) > API & Services > Credentials
2. Create Credentials > OAuth 2.0 Client ID
3. Application type: Web application
4. Authorized redirect URIs: `<your-frontend-url>/admin/calendar/integrations/google/callback` (development)
5. Authorized redirect URIs: `https://yourdomain.com/admin/calendar/integrations/google/callback` (production)
6. Scopes: `https://www.googleapis.com/auth/calendar`
7. Client ID ve Client Secret'ı kopyala

#### 1.2. Environment Variables

```bash
# Google Calendar OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=<your-frontend-url>/admin/calendar/integrations/google/callback
```

---

### 2. Outlook Calendar Entegrasyonu

#### 2.1. Azure Portal Setup

1. [Azure Portal](https://portal.azure.com/) > Azure Active Directory > App registrations
2. New registration
3. Name: SK Production Calendar Integration
4. Supported account types: Accounts in any organizational directory and personal Microsoft accounts
5. Redirect URI: `<your-frontend-url>/admin/calendar/integrations/outlook/callback` (development)
6. Redirect URI: `https://yourdomain.com/admin/calendar/integrations/outlook/callback` (production)
7. API permissions > Add permission > Microsoft Graph > Delegated permissions
   - `Calendars.ReadWrite`
   - `offline_access`
8. Certificates & secrets > New client secret
9. Application (client) ID ve Client secret'ı kopyala

#### 2.2. Environment Variables

```bash
# Outlook Calendar OAuth2
OUTLOOK_CLIENT_ID=your-outlook-client-id
OUTLOOK_CLIENT_SECRET=your-outlook-client-secret
OUTLOOK_REDIRECT_URI=<your-frontend-url>/admin/calendar/integrations/outlook/callback
OUTLOOK_TENANT_ID=common  # veya organization-specific tenant ID
```

---

## 🔧 Kullanım

### API Endpoints

#### Google Calendar

- `GET /api/calendar/integrations/google/auth-url` - OAuth2 auth URL al
- `GET /api/calendar/integrations/google/callback` - OAuth2 callback (Google'dan gelir)
- `POST /api/calendar/integrations/:integrationId/import` - Google'dan projeleri import et
- `POST /api/calendar/integrations/:integrationId/export` - Projeleri Google'a export et

#### Outlook Calendar

- `GET /api/calendar/integrations/outlook/auth-url` - OAuth2 auth URL al
- `GET /api/calendar/integrations/outlook/callback` - OAuth2 callback (Microsoft'tan gelir)
- `POST /api/calendar/integrations/:integrationId/import` - Outlook'tan projeleri import et
- `POST /api/calendar/integrations/:integrationId/export` - Projeleri Outlook'a export et

#### Genel

- `GET /api/calendar/integrations/list` - Tüm entegrasyonları listele
- `DELETE /api/calendar/integrations/:id` - Entegrasyonu sil

---

## 📝 Örnek Kullanım

### Google Calendar Bağlama

```typescript
// 1. Auth URL al
const response = await fetch('/api/calendar/integrations/google/auth-url', {
  headers: { Authorization: `Bearer ${token}` }
});
const { authUrl } = await response.json();

// 2. Kullanıcıyı Google'a yönlendir
window.location.href = authUrl;

// 3. Callback'te token otomatik kaydedilir
```

### Calendar Import

```typescript
// Google'dan projeleri import et
const response = await fetch(`/api/calendar/integrations/${integrationId}/import?startDate=2026-01-01&endDate=2026-12-31`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});
const result = await response.json();
// result.success: başarılı import sayısı
// result.failed: başarısız import sayısı
```

### Calendar Export

```typescript
// Projeleri Google'a export et
const response = await fetch(`/api/calendar/integrations/${integrationId}/export?startDate=2026-01-01&endDate=2026-12-31`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});
const result = await response.json();
// result.success: başarılı export sayısı
```

---

## 🔒 Güvenlik

- **OAuth2 Flow**: Güvenli OAuth2 authorization code flow kullanılır
- **Token Storage**: Access token ve refresh token şifrelenmiş olarak veritabanında saklanır
- **Token Refresh**: Access token'lar otomatik olarak yenilenir
- **State Parameter**: OAuth2 state parametresi ile CSRF koruması

---

## 📁 Dosya Yapısı

```
server/src/
├── models/
│   └── CalendarIntegration.ts          # Calendar entegrasyon modeli
├── controllers/
│   └── calendarIntegration.controller.ts # Calendar entegrasyon controller
├── services/
│   ├── googleCalendarService.ts         # Google Calendar API service
│   └── outlookCalendarService.ts        # Outlook Calendar API service
└── routes/
    └── calendarIntegration.routes.ts     # Calendar entegrasyon routes
```

---

## 🐛 Troubleshooting

### Google Calendar

**"redirect_uri_mismatch" hatası:**
- Google Cloud Console'da redirect URI'nin tam olarak eşleştiğinden emin olun
- Development: `<your-frontend-url>/admin/calendar/integrations/google/callback`
- Production: `https://yourdomain.com/admin/calendar/integrations/google/callback`

**Token refresh hatası:**
- `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET` doğru mu kontrol edin
- Refresh token'ın geçerli olduğundan emin olun

### Outlook Calendar

**"AADSTS50011" hatası:**
- Azure Portal'da redirect URI'nin tam olarak eşleştiğinden emin olun
- Development: `<your-frontend-url>/admin/calendar/integrations/outlook/callback`
- Production: `https://yourdomain.com/admin/calendar/integrations/outlook/callback`

**Token refresh hatası:**
- `OUTLOOK_CLIENT_ID`, `OUTLOOK_CLIENT_SECRET` ve `OUTLOOK_TENANT_ID` doğru mu kontrol edin
- Refresh token'ın geçerli olduğundan emin olun

---

## 💡 Notlar

- **Token Expiration**: Access token'lar genellikle 1 saat geçerlidir, otomatik olarak yenilenir
- **Rate Limiting**: Google ve Microsoft API'leri rate limiting uygular, çok fazla istek yapmayın
- **Calendar ID**: Varsayılan olarak `primary` (Google) veya `calendar` (Outlook) kullanılır
- **Sync Direction**: `bidirectional` (varsayılan), `import` veya `export` olarak ayarlanabilir

---

*Son Güncelleme: 2026-01-18*
