# 📱 SK Production Mobile (Expo + React Native + TypeScript)

## ✅ Özellikler (MVP Faz-1 Tamamlandı)
- ✅ Login (email/telefon + şifre)
- ✅ 2FA login verify
- ✅ Refresh token (SecureStore) + otomatik access token yenileme
- ✅ Dashboard (API metrikleri: ekipman, proje, görev istatistikleri)
- ✅ Tasks (Liste + Detay + Durum güncelleme)
- ✅ Equipment (Liste + Arama + Detay + Durum güncelleme)
- ✅ Calendar (Aylık/Haftalık görünüm)
- ✅ Bottom Tab Navigator
- ✅ Push Notifications (Expo Notifications)
- ✅ Offline Mode (Queue-based sync)

## 📋 Gereksinimler

- Node.js 18+ ve npm
- Expo CLI: `npm install -g expo-cli` (opsiyonel, `npx expo` da kullanılabilir)
- iOS için: Xcode (Mac'te)
- Android için: Android Studio veya fiziksel cihaz

## 🚀 Kurulum

```bash
cd mobile
npm install
```

## ⚙️ Yapılandırma

### 1. Backend URL'ini Ayarlayın

**Seçenek 1: Environment Variable (Önerilen)**
```bash
# Terminal'de
export EXPO_PUBLIC_API_URL="http://localhost:5001/api"

# Veya .env dosyası oluşturun (mobile/.env)
EXPO_PUBLIC_API_URL=http://localhost:5001/api
```

**Seçenek 2: app.json'da (varsayılan)**
`app.json` dosyasında `extra.apiUrl` zaten tanımlı, environment variable yoksa `http://localhost:5001/api` kullanılır.

### 2. Backend'in Çalıştığından Emin Olun

Backend server'ın `http://localhost:5001` adresinde çalıştığından emin olun:

```bash
# Server klasöründe
cd ../server
npm run dev
```

## 🏃 Çalıştırma

### Development Mode

```bash
cd mobile
npm run start
```

Bu komut Expo DevTools'u açar. Şu seçeneklerden birini seçin:

- **`i`** → iOS Simulator'da aç (Mac gerekli)
- **`a`** → Android Emulator'da aç (Android Studio gerekli)
- **QR Kod** → Expo Go uygulaması ile telefonunuzda açın

### Fiziksel Cihazda Test (Önerilen)

1. **Expo Go** uygulamasını telefonunuza indirin:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Terminal'de `npm run start` çalıştırın

3. QR kodu Expo Go ile tarayın

4. **Önemli**: Telefon ve bilgisayar aynı WiFi ağında olmalı!

### Platform-Specific

```bash
# iOS Simulator (sadece Mac)
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

## 🔧 Sorun Giderme

### "Network request failed" Hatası

1. Backend'in çalıştığından emin olun (`http://localhost:5001`)
2. Fiziksel cihaz kullanıyorsanız, `localhost` yerine bilgisayarınızın IP adresini kullanın:
   ```bash
   # Mac/Linux: IP adresinizi bulun
   ifconfig | grep "inet "
   
   # Windows: IP adresinizi bulun
   ipconfig
   
   # Örnek: 192.168.1.100 ise
   export EXPO_PUBLIC_API_URL="http://192.168.1.100:5001/api"
   ```

### "Module not found" Hatası

```bash
cd mobile
rm -rf node_modules
npm install
```

### Expo Go'da Push Notifications Çalışmıyor

Push notifications sadece **development build** veya **production build**'de çalışır. Expo Go'da test edemezsiniz. Production build için:

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## 📱 Build ve Deployment

### EAS Build (Expo Application Services)

1. EAS CLI'yi kurun:
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. `eas.json` dosyası oluşturun (opsiyonel, varsayılan ayarlar kullanılabilir)

3. Build alın:
   ```bash
   eas build --platform ios
   eas build --platform android
   ```

### Local Build

```bash
# iOS (Mac gerekli)
npm run ios

# Android
npm run android
```

## 🔐 Backend Notu (Mobile Header)

Mobile isteklerinde header olarak şunu gönderiyoruz:
- `x-client: mobile`

Bu sayede backend, **refreshToken**'ı response body'de de döndürüyor (mobilde SecureStore için).

## 📚 Ek Bilgiler

- **Expo Dokümantasyonu**: https://docs.expo.dev/
- **React Navigation**: https://reactnavigation.org/
- **Expo Notifications**: https://docs.expo.dev/versions/latest/sdk/notifications/

