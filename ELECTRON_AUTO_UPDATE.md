# SK Production - Masaüstü Otomatik Güncelleme (Auto-Update) Altyapısı

Bu dokümantasyon, SK Production masaüstü uygulaması için kurulan `electron-updater` tabanlı otomatik güncelleme sisteminin detaylarını içermektedir.

## 1. Neler Yapıldı?

- **Bağımlılıklar Eklendi:** `electron-updater` (otomatik güncelleme yöneticisi) ve `electron-log` (güncelleme sürecini takip etmek amaçlı loglayıcı) projeye dâhil edildi.
- **`main.js` Güncellendi:** Uygulama ayağa kalktığında (`ready` eventi) sadece canlı ortamda (production) çalışacak şekilde `autoUpdater.checkForUpdatesAndNotify()` fonksiyonu eklendi.
- **Log Mekanizması Kuruldu:** İndirme yüzdesi, hatalar, bulunan güncellemeler ve sürüm uygunluk durumları `electron-log` üzerinden sisteme yazdırılacak şekilde ayarlandı (Kullanıcı bilgisayarlarında MacOS için `~/Library/Logs/SK Production/main.log`, Windows için `%USERPROFILE%\AppData\Roaming\SK Production\logs\main.log` konumunda bulunur).
- **Kullanıcı Onayı:** Yeni bir sürüm indirildiğinde (`update-downloaded` durumunda) "Kapat ve Güncelle" mi yoksa "Daha Sonra" mı diye soran `Yeniden Başlat` diyalog penceresi (Native App Dialog) eklendi.
- **Hedef Rota Ayarlandı:** Uygulama web sitesi yerine doğrudan Yönetim Paneli'nde (`/admin`) başlayacak şekilde ana root `/admin.html` rotasına devredildi.
- **Publish (GitHub) Provider Eklendi:** `package.json` içerisine Electron-Builder için GitHub Releases bağlantı ayarları şablon olarak kuruldu.

## 2. GitHub Üzerinden Güncellemeleri Yayınlama

Uygulamayı bir sonraki sürüme geçirmek ve kullanıcıların bilgisayarındaki uygulamaların arka planda kendi kendini güncellemesini tetiklemek için şu adımları izlemelisiniz:

### Adım 1: GitHub Settings (Repo Bilgileri)
Şu an `client/package.json` dosyasında bulunan `"publish"` alanı varsayılan (placeholder) veriler içeriyor:
```json
"publish": [
  {
    "provider": "github",
    "owner": "skproduction", 
    "repo": "skpro-app"
  }
]
```
Kendi GitHub Deponuzun özelliklerine göre bu **"owner"** (kullanıcı adınız, örn: `beardKelcho`) ve **"repo"** (depo adı, örn: `sk_pro_fullstack_website`) kısımlarını kendi bilgilerinizle değiştirmelisiniz. Not: Otomatik güncellemelerin Github tabanlı çalışabilmesi için *Private* (Gizli) depolarda GH_TOKEN ayarlamaları yapılması gerekir; depo açık (Public) ise direkt çalışır.

### Adım 2: Sürüm Atlama (Version Bump)
Kodu güncelleyip yeni bir versiyon yayınlamak istediğinizde öncelikle `client/package.json` dosyasındaki versiyonu artırın (örneğin `"version": "0.1.0"` yerine `"version": "0.1.1"` yapın).

### Adım 3: Github Releases Kullanma
Eğer Github Actions kullanıyorsanız, `electron-builder --publish always` komutu otomatik olarak tüm taslak paketleri build edip ilgili depoda **Release** oluşturur ve `.dmg` veya `.exe` dosyasının yanı sıra bir adet de `latest-mac.yml` (veya `.yml`) manifest dosyası yükler. Bu `.yml` manifestosu, kullanıcı bilgisayarındaki `electron-updater` eklentisi tarafından sürekli dinlenir. Yeni versiyon görüldüğünde uygulama arkada kendiliğinden indirmeye başlar.

Uygulamanın GitHub ayarlarını güncelleyip Build aldıktan sonra, kullanıcılar için otomatik güncellemelerin sorunsuzca işlediğini loglardan test edebilirsiniz.
