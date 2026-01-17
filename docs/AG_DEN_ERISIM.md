# Aynı Ağdan Farklı Bilgisayarlardan Erişim Rehberi

## Sorun

Aynı ağda farklı bir bilgisayardan siteye erişildiğinde resim, yazı, video hiçbir şey gözükmüyor ve console'da `ERR_CONNECTION_REFUSED` hataları görünüyor.

## Çözüm

### 1. Backend Sunucusunun IP Adresini Bulun

Backend sunucusunun çalıştığı bilgisayarda:

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Örnek çıktı: `192.168.1.21` (backend sunucusunun IP adresi)

### 2. Client Environment Variable'ı Ayarlayın

`client/.env.local` dosyasını oluşturun veya düzenleyin:

```env
# Backend sunucusunun IP adresi (farklı bilgisayarlardan erişim için)
NEXT_PUBLIC_BACKEND_URL=http://192.168.1.21:5001

# Opsiyonel: API URL (genelde gerekli değil, rewrites kullanıyoruz)
# NEXT_PUBLIC_API_URL=http://192.168.1.21:5001/api
```

**Önemli:** `192.168.1.21` yerine backend sunucusunun gerçek IP adresini yazın.

### 3. Next.js Dev Server'ı Yeniden Başlatın

Environment variable'ları değiştirdikten sonra Next.js dev server'ı yeniden başlatmanız gerekir:

```bash
cd client
npm run dev
```

### 4. Backend CORS Ayarlarını Kontrol Edin

Backend sunucusunun CORS ayarlarında local network IP'lerinin izinli olduğundan emin olun. `server/src/index.ts` dosyasında zaten local network IP'leri için izin var:

```typescript
// Local network IP'leri için otomatik izin (development)
if (process.env.NODE_ENV === 'development' && origin && 
    (origin.startsWith('http://192.168.') || 
     origin.startsWith('http://10.') || 
     origin.startsWith('http://172.16.') || 
     ...)) {
  callback(null, true);
}
```

### 5. Test Edin

1. Backend sunucusunun çalıştığından emin olun: `http://192.168.1.21:5001/api/health`
2. Frontend'i farklı bir bilgisayardan açın: `http://192.168.1.21:3000`
3. Console'da hata olmamalı ve resimler/videolar yüklenmeli

## Notlar

- **Development:** `NEXT_PUBLIC_BACKEND_URL` environment variable'ı kullanılır
- **Production:** Production'da genelde domain kullanılır (örn: `https://api.skpro.com.tr`)
- **Next.js Rewrites:** `/api/*` istekleri otomatik olarak `NEXT_PUBLIC_BACKEND_URL/api/*` adresine proxy edilir
- **Relative Path:** Client-side kodda artık relative path (`/api`) kullanılıyor, bu sayede farklı bilgisayarlardan erişim sorunsuz çalışıyor

## Sorun Giderme

### Hala `ERR_CONNECTION_REFUSED` hatası alıyorsanız:

1. Backend sunucusunun çalıştığından emin olun
2. Backend sunucusunun IP adresinin doğru olduğundan emin olun
3. Firewall'ın 5001 portunu engellemediğinden emin olun
4. `client/.env.local` dosyasında `NEXT_PUBLIC_BACKEND_URL` değerinin doğru olduğundan emin olun
5. Next.js dev server'ı yeniden başlatın

### Resimler/Videolar yüklenmiyorsa:

1. Backend'de dosyaların `/uploads/` klasöründe olduğundan emin olun
2. Backend'in `/uploads/*` endpoint'lerinin çalıştığından emin olun
3. Browser console'da network tab'ını kontrol edin - hangi istekler başarısız oluyor?
