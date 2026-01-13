# MongoDB Kurulum Rehberi

## ⚠️ Hata: MongoDB Bağlantı Hatası

MongoDB çalışmıyor veya kurulu değil. İki seçeneğiniz var:

---

## 🚀 Seçenek 1: MongoDB Atlas (ÖNERİLEN - Hızlı ve Kolay)

### Avantajlar:
- ✅ Ücretsiz (M0 Free Tier)
- ✅ 5 dakikada hazır
- ✅ Production'a hazır
- ✅ Otomatik backup
- ✅ Yerel kurulum gerekmez

### Adımlar:

1. **MongoDB Atlas Hesabı Oluştur**
   - https://www.mongodb.com/cloud/atlas/register
   - Email ile kayıt ol

2. **Cluster Oluştur**
   - "Build a Database" → "FREE" seç
   - Cloud Provider: AWS (veya istediğiniz)
   - Region: Frankfurt (eu-central-1) - Türkiye'ye en yakın
   - Cluster Name: `sk-production-cluster`
   - "Create" butonuna tıkla

3. **Database User Oluştur**
   - "Database Access" → "Add New Database User"
   - Authentication Method: Password
   - Username: `skproduction-admin`
   - Password: Güçlü bir şifre (kaydedin!)
   - Database User Privileges: "Atlas admin"
   - "Add User" butonuna tıkla

4. **Network Access Ayarla**
   - "Network Access" → "Add IP Address"
   - "Allow Access from Anywhere" seç (0.0.0.0/0)
   - "Confirm" butonuna tıkla

5. **Connection String Al**
   - "Database" → "Connect" butonuna tıkla
   - "Connect your application" seç
   - Connection string'i kopyala:
     ```
     mongodb+srv://skproduction-admin:<password>@sk-production-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

6. **Environment Variable Ayarla**
   
   `server/.env` dosyasını oluştur/düzenle:
   ```env
   MONGO_URI=mongodb+srv://skproduction-admin:YOUR_PASSWORD@sk-production-cluster.xxxxx.mongodb.net/skproduction?retryWrites=true&w=majority
   ```
   
   **ÖNEMLİ:** `<password>` yerine gerçek şifrenizi yazın!

7. **Seed Script'i Çalıştır**
   ```bash
   cd server
   npm run seed
   ```

---

## 💻 Seçenek 2: Yerel MongoDB Kurulumu

### macOS için (Homebrew):

```bash
# Homebrew ile MongoDB kur
brew tap mongodb/brew
brew install mongodb-community

# MongoDB'yi başlat
brew services start mongodb-community

# Durumu kontrol et
brew services list
```

### Linux için:

```bash
# MongoDB Community Edition kurulumu
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# MongoDB'yi başlat
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Windows için:

1. https://www.mongodb.com/try/download/community adresinden indir
2. Installer'ı çalıştır
3. "Complete" kurulum seç
4. MongoDB Compass'ı da kur (opsiyonel)
5. MongoDB servisini başlat

### Environment Variable:

`server/.env` dosyası:
```env
MONGO_URI=mongodb://localhost:27017/skproduction
```

---

## ✅ Kurulum Sonrası Test

### Seed Script'i Çalıştır:
```bash
cd server
npm run seed
```

**Başarılı çıktı:**
```
MongoDB bağlantısı başarılı
Admin kullanıcı oluşturuldu: admin@skproduction.com
Varsayılan şifre: admin123
```

### Giriş Bilgileri:
- **Email:** `admin@skproduction.com`
- **Şifre:** `admin123`

---

## 🔧 Sorun Giderme

### MongoDB Atlas Bağlantı Hatası:
- IP whitelist'i kontrol edin (0.0.0.0/0 olmalı)
- Connection string'deki şifreyi kontrol edin
- Database user'ın "Atlas admin" yetkisi olduğundan emin olun

### Yerel MongoDB Bağlantı Hatası:
```bash
# MongoDB çalışıyor mu?
brew services list  # macOS
sudo systemctl status mongod  # Linux

# MongoDB'yi yeniden başlat
brew services restart mongodb-community  # macOS
sudo systemctl restart mongod  # Linux

# Port kontrolü
lsof -i :27017
```

---

## 📝 Öneri

**Production için MongoDB Atlas kullanın:**
- Daha güvenli
- Otomatik backup
- Monitoring
- Scaling kolaylığı
- Ücretsiz tier yeterli başlangıç için

