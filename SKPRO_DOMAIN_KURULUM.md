# 🌐 skpro.com.tr Domain Kurulum Rehberi

> **skpro.com.tr Domain'i İçin Detaylı Kurulum**  
> Domain'inizi Vercel ve Render'a bağlama rehberi

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Frontend (Vercel) Domain Kurulumu](#frontend-vercel-domain-kurulumu)
3. [Backend (Render) Domain Kurulumu](#backend-render-domain-kurulumu)
4. [DNS Ayarları](#dns-ayarları)
5. [SSL Sertifikası](#ssl-sertifikası)
6. [Test ve Doğrulama](#test-ve-doğrulama)

---

## 🎯 Genel Bakış

### Domain Yapısı

```
skpro.com.tr          → Frontend (Vercel)
www.skpro.com.tr      → Frontend (Vercel)
api.skpro.com.tr      → Backend (Render) - Opsiyonel
```

### Önerilen Yapı

**Seçenek 1: Subdomain ile (Önerilen)**
- `skpro.com.tr` → Frontend
- `api.skpro.com.tr` → Backend

**Seçenek 2: Subdomain olmadan**
- `skpro.com.tr` → Frontend
- Backend'i Render URL'i ile kullan (frontend'den proxy)

---

## 🎨 Frontend (Vercel) Domain Kurulumu

### Adım 1: Vercel'de Domain Ekleme

1. **Vercel Dashboard** → Projeniz → **Settings** → **Domains**
2. **Add Domain** butonuna tıklayın
3. Domain'i ekleyin:
   - `skpro.com.tr`
   - `www.skpro.com.tr`
4. Vercel size DNS kayıtlarını gösterecek

### Adım 2: DNS Kayıtları (Vercel'den)

Vercel size şu kayıtları verecek:

```
Type    Name    Value
A       @       76.76.21.21 (örnek - Vercel'den alınacak)
CNAME   www     cname.vercel-dns.com
```

**Not:** IP adresi Vercel tarafından otomatik verilir, her proje için farklı olabilir.

---

## 🔧 Backend (Render) Domain Kurulumu

### Seçenek 1: Subdomain ile (api.skpro.com.tr)

1. **Render Dashboard** → Servisiniz → **Settings** → **Custom Domains**
2. **Add Custom Domain** butonuna tıklayın
3. Domain'i ekleyin: `api.skpro.com.tr`
4. Render size DNS kaydını gösterecek:

```
Type    Name    Value
CNAME   api     skproduction-api.onrender.com
```

### Seçenek 2: Subdomain Olmadan

Backend'i direkt Render URL'i ile kullan:
- `https://skproduction-api.onrender.com`

Frontend'de environment variable:
```env
NEXT_PUBLIC_API_URL=https://skproduction-api.onrender.com/api
```

---

## 📡 DNS Ayarları

### Domain Sağlayıcınızda (Turhost, Natro, vs.)

Domain sağlayıcınızın DNS yönetim paneline girin ve şu kayıtları ekleyin:

#### Frontend için (Vercel)

```
Type    Name    Value                    TTL
A       @       76.76.21.21              3600
CNAME   www     cname.vercel-dns.com     3600
```

**Önemli:** `@` kaydındaki IP adresini Vercel dashboard'dan alın!

#### Backend için (Render) - Opsiyonel

```
Type    Name    Value                              TTL
CNAME   api     skproduction-api.onrender.com      3600
```

### DNS Yayılma Süresi

- **TTL 3600**: Değişiklikler 1 saat içinde yayılır
- **İlk kurulum**: 24-48 saat sürebilir
- **Sonraki değişiklikler**: 1-2 saat

---

## 🔒 SSL Sertifikası

### Otomatik SSL (Vercel & Render)

✅ **Vercel**: Otomatik SSL sertifikası (Let's Encrypt)  
✅ **Render**: Otomatik SSL sertifikası (Let's Encrypt)

**Yapmanız gereken:** Hiçbir şey! Domain eklendikten sonra otomatik olarak SSL aktif olur.

### SSL Doğrulama

Domain eklendikten sonra:
1. Vercel/Render SSL sertifikasını otomatik oluşturur
2. 5-10 dakika içinde aktif olur
3. `https://skpro.com.tr` çalışır

---

## ✅ Test ve Doğrulama

### 1. DNS Kontrolü

```bash
# A Record kontrolü
dig skpro.com.tr A

# CNAME kontrolü
dig www.skpro.com.tr CNAME
dig api.skpro.com.tr CNAME
```

### 2. SSL Kontrolü

```bash
# SSL sertifikası kontrolü
openssl s_client -connect skpro.com.tr:443 -servername skpro.com.tr
```

### 3. Web Kontrolü

Tarayıcıda test edin:
- ✅ `https://skpro.com.tr` → Frontend yüklenmeli
- ✅ `https://www.skpro.com.tr` → Frontend yüklenmeli
- ✅ `https://api.skpro.com.tr/api/health` → Backend health check

### 4. CORS Kontrolü

Backend'de CORS ayarlarını kontrol edin:

```env
CLIENT_URL=https://skpro.com.tr
CORS_ORIGIN=https://skpro.com.tr
```

---

## 🚨 Sorun Giderme

### Domain Çalışmıyor

1. **DNS yayılma süresi bekleyin** (24-48 saat)
2. **DNS kayıtlarını kontrol edin** (doğru IP/CNAME?)
3. **TTL değerini düşürün** (300-600)
4. **DNS cache'i temizleyin**:
   ```bash
   # macOS/Linux
   sudo dscacheutil -flushcache
   
   # Windows
   ipconfig /flushdns
   ```

### SSL Sertifikası Çalışmıyor

1. **Domain'in doğru yapılandırıldığını kontrol edin**
2. **Vercel/Render log'larını kontrol edin**
3. **24 saat bekleyin** (Let's Encrypt rate limit)
4. **Manuel SSL yenileme** (Vercel/Render dashboard)

### Backend'e Bağlanamıyor

1. **CORS ayarlarını kontrol edin**
2. **Environment variables'ı kontrol edin**
3. **Backend log'larını kontrol edin**
4. **API URL'ini kontrol edin**

---

## 📝 Örnek DNS Yapılandırması

### Turhost DNS Ayarları

```
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
CNAME   api     skproduction-api.onrender.com
```

### Natro DNS Ayarları

```
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
CNAME   api     skproduction-api.onrender.com
```

### GoDaddy DNS Ayarları

```
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
CNAME   api     skproduction-api.onrender.com
```

---

## 🎯 Hızlı Kontrol Listesi

### Frontend (Vercel)

- [ ] Vercel hesabı oluşturuldu
- [ ] Proje deploy edildi
- [ ] Domain eklendi (`skpro.com.tr`, `www.skpro.com.tr`)
- [ ] DNS A Record eklendi
- [ ] DNS CNAME eklendi (www)
- [ ] SSL aktif (otomatik)
- [ ] `https://skpro.com.tr` çalışıyor

### Backend (Render)

- [ ] Render hesabı oluşturuldu
- [ ] Backend deploy edildi
- [ ] Custom domain eklendi (`api.skpro.com.tr`) - Opsiyonel
- [ ] DNS CNAME eklendi (api) - Opsiyonel
- [ ] Environment variables ayarlandı
- [ ] CORS ayarları yapıldı
- [ ] `https://api.skpro.com.tr/api/health` çalışıyor

---

## 💡 İpuçları

1. **DNS yayılma süresi**: İlk kurulumda 24-48 saat bekleyin
2. **SSL sertifikası**: Otomatik oluşur, 5-10 dakika sürer
3. **TTL değeri**: Test için düşük (300), production için yüksek (3600)
4. **Subdomain**: `api.skpro.com.tr` kullanmak daha profesyonel
5. **Backup domain**: `www.skpro.com.tr` mutlaka ekleyin

---

## 📞 Yardım

Sorun yaşıyorsanız:

1. **Vercel Support**: https://vercel.com/support
2. **Render Support**: https://render.com/docs/support
3. **Domain sağlayıcı desteği**: DNS ayarları için

---

**Başarılar! 🚀**

*Son Güncelleme: 2026-01-08*
