# Yetki Matrisi Özeti

## Roller

1. **ADMIN (Admin)**
2. **FIRMA_SAHIBI (Firma Sahibi)**
3. **PROJE_YONETICISI (Proje Yöneticisi)**
4. **DEPO_SORUMLUSU (Depo Sorumlusu)**
5. **TEKNISYEN (Teknisyen)**

---

## Yetki Detayları

### 🔴 ADMIN (Admin)
**Tüm yetkilere sahiptir:**
- ✅ Kullanıcı yönetimi (görüntüleme, oluşturma, güncelleme, silme, rol atama)
- ✅ Proje yönetimi (görüntüleme, oluşturma, güncelleme, silme)
- ✅ Görev yönetimi (görüntüleme, oluşturma, güncelleme, silme)
- ✅ Müşteri yönetimi (görüntüleme, oluşturma, güncelleme, silme)
- ✅ Ekipman yönetimi (görüntüleme, oluşturma, güncelleme, silme)
- ✅ Bakım yönetimi (görüntüleme, oluşturma, güncelleme, silme)
- ✅ Veri export
- ✅ Dosya yükleme/silme

---

### 🔴 FIRMA_SAHIBI (Firma Sahibi)
**Admin ile aynı yetkilere sahiptir:**
- ✅ Kullanıcı yönetimi (görüntüleme, oluşturma, güncelleme, silme, rol atama)
- ✅ Proje yönetimi (görüntüleme, oluşturma, güncelleme, silme)
- ✅ Görev yönetimi (görüntüleme, oluşturma, güncelleme, silme)
- ✅ Müşteri yönetimi (görüntüleme, oluşturma, güncelleme, silme)
- ✅ Ekipman yönetimi (görüntüleme, oluşturma, güncelleme, silme)
- ✅ Bakım yönetimi (görüntüleme, oluşturma, güncelleme, silme)
- ✅ Veri export
- ✅ Dosya yükleme/silme

---

### 🔵 PROJE_YONETICISI (Proje Yöneticisi)
**Proje ve görev odaklı yetkiler:**
- ✅ Proje yönetimi (görüntüleme, oluşturma, güncelleme, silme)
- ✅ Görev yönetimi (görüntüleme, oluşturma, güncelleme, silme)
- ✅ Müşteri yönetimi (görüntüleme, oluşturma, güncelleme, silme)
- ✅ Ekipman görüntüleme (sadece okuma)
- ✅ Bakım görüntüleme (sadece okuma)
- ✅ Kullanıcı görüntüleme (sadece okuma)
- ✅ Veri export
- ❌ Ekipman ekleme/çıkarma (malzeme yönetimi yapamaz)
- ❌ Bakım oluşturma/güncelleme
- ❌ Kullanıcı yönetimi

---

### 🟡 DEPO_SORUMLUSU (Depo Sorumlusu)
**Ekipman ve bakım odaklı yetkiler:**
- ✅ Ekipman yönetimi (görüntüleme, oluşturma, güncelleme, silme)
- ✅ Bakım yönetimi (görüntüleme, oluşturma, güncelleme, silme)
- ✅ Proje görüntüleme (sadece okuma)
- ✅ Müşteri görüntüleme (sadece okuma)
- ✅ Veri export
- ❌ Görev oluşturma/güncelleme (görev giremez)
- ❌ Proje oluşturma/güncelleme
- ❌ Müşteri oluşturma/güncelleme
- ❌ Kullanıcı yönetimi

---

### 🟢 TEKNISYEN (Teknisyen)
**Sadece görüntüleme yetkisi:**
- ✅ Proje görüntüleme
- ✅ Görev görüntüleme
- ✅ Müşteri görüntüleme
- ✅ Ekipman görüntüleme
- ✅ Bakım görüntüleme
- ✅ Kullanıcı görüntüleme
- ❌ Hiçbir veri oluşturma/güncelleme/silme yetkisi yok
- ❌ Export yetkisi yok
- ❌ Dosya yükleme yetkisi yok

---

## Yetki Karşılaştırma Tablosu

| Özellik | Admin | Firma Sahibi | Proje Yöneticisi | Depo Sorumlusu | Teknisyen |
|---------|-------|--------------|------------------|---------------|-----------|
| **Kullanıcı Yönetimi** |
| Görüntüleme | ✅ | ✅ | ✅ | ❌ | ✅ |
| Oluşturma/Güncelleme/Silme | ✅ | ✅ | ❌ | ❌ | ❌ |
| Rol Atama | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Proje Yönetimi** |
| Görüntüleme | ✅ | ✅ | ✅ | ✅ | ✅ |
| Oluşturma/Güncelleme/Silme | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Görev Yönetimi** |
| Görüntüleme | ✅ | ✅ | ✅ | ❌ | ✅ |
| Oluşturma/Güncelleme/Silme | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Müşteri Yönetimi** |
| Görüntüleme | ✅ | ✅ | ✅ | ✅ | ✅ |
| Oluşturma/Güncelleme/Silme | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Ekipman Yönetimi** |
| Görüntüleme | ✅ | ✅ | ✅ | ✅ | ✅ |
| Oluşturma/Güncelleme/Silme | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Bakım Yönetimi** |
| Görüntüleme | ✅ | ✅ | ✅ | ✅ | ✅ |
| Oluşturma/Güncelleme/Silme | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Diğer** |
| Veri Export | ✅ | ✅ | ✅ | ✅ | ❌ |
| Dosya Yükleme/Silme | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## Önemli Notlar

1. **Admin ve Firma Sahibi**: Her iki rol de tam yetkiye sahiptir ve birbirinden ayırt edilemez yetki seviyesindedir.

2. **Proje Yöneticisi**: Malzeme (ekipman) ekleyip çıkaramaz, sadece görüntüleyebilir. Görev ve proje yönetiminde tam yetkilidir.

3. **Depo Sorumlusu**: Görev giremez, sadece ekipman ve bakım yönetimi yapabilir.

4. **Teknisyen**: Sadece görüntüleme yetkisine sahiptir, hiçbir veri oluşturamaz, güncelleyemez veya silemez.

5. **Yetki Yönetimi**: Admin, kullanıcılara rol atayabilir ve yetkilerini yönetebilir. Bu işlem için özel bir yetki yönetimi sayfası mevcuttur.

