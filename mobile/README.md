# 📱 SK Production Mobile (Expo + React Native + TypeScript)

## ✅ Amaç (MVP)
- Login (email/telefon + şifre)
- 2FA login verify
- Refresh token (SecureStore) + otomatik access token yenileme
- Dashboard (profil çekerek smoke test)

## Kurulum

```bash
cd mobile
npm install
```

## Çalıştırma

Backend URL’i ayarlayın:

```bash
export EXPO_PUBLIC_API_URL="http://localhost:5001/api"
```

Sonra:

```bash
npm run start
```

## Backend Notu (Mobile Header)
Mobile isteklerinde header olarak şunu gönderiyoruz:
- `x-client: mobile`

Bu sayede backend, **refreshToken**’ı response body’de de döndürüyor (mobilde SecureStore için).

