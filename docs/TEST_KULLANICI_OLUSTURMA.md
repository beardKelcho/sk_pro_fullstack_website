# Test Kullanıcısı Oluşturma

> **Tarih**: 2026-01-19  
> **Durum**: ✅ **TAMAMLANDI**

Bu doküman, Cypress E2E testleri için özel test kullanıcısının nasıl oluşturulduğunu açıklar.

---

## 📋 Test Kullanıcısı Bilgileri

| Özellik | Değer |
|---------|-------|
| **Email** | `test@skpro.com.tr` |
| **Şifre** | `Test123!` |
| **Rol** | `ADMIN` |
| **2FA** | ❌ **Kapalı** |
| **Durum** | ✅ Aktif |

---

## 🚀 Test Kullanıcısı Oluşturma

### Komut

```bash
# Root'tan
npm run create:test-user

# Veya server dizininden
cd server
npm run create:test-user
```

### Script Yolu

```
server/src/scripts/createTestUser.ts
```

---

## 🔧 Script Özellikleri

1. **Mevcut Kullanıcı Kontrolü**: Eğer test kullanıcısı zaten varsa, günceller
2. **2FA Kapatma**: Test kullanıcısının 2FA'sını kapatır
3. **Şifre Güncelleme**: Şifreyi belirtilen değere günceller
4. **Doğrulama**: Şifre doğrulaması yapar ve kullanıcı durumunu gösterir

---

## 📝 Script Çıktısı

Script çalıştırıldığında şu bilgileri gösterir:

```
✅ Test kullanıcısı hazır!
═══════════════════════════════════════════════════════════
📧 Email: test@skpro.com.tr
🔑 Şifre: Test123!
👤 Rol: ADMIN
🔒 2FA: Kapalı

Cypress testlerinde bu bilgileri kullanabilirsiniz:
  cy.loginAsUser('test@skpro.com.tr', 'Test123!')
═══════════════════════════════════════════════════════════
```

---

## 🔄 Cypress Testlerinde Kullanım

### Otomatik Kullanım

Cypress testleri artık otomatik olarak test kullanıcısını kullanır:

```typescript
// cypress/support/commands.ts
cy.loginAsAdmin() // Otomatik olarak test@skpro.com.tr kullanır
```

### Environment Variables

Cypress config'de environment variables tanımlı:

```typescript
// cypress.config.ts
env: {
  TEST_USER_EMAIL: 'test@skpro.com.tr',
  TEST_USER_PASSWORD: 'Test123!',
}
```

### Manuel Kullanım

Test dosyalarında manuel olarak da kullanılabilir:

```typescript
const TEST_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
const TEST_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

cy.loginAsUser(TEST_EMAIL, TEST_PASSWORD);
```

---

## ⚙️ Güncellenen Dosyalar

1. **`server/src/scripts/createTestUser.ts`** (YENİ)
   - Test kullanıcısı oluşturma scripti

2. **`server/package.json`**
   - `create:test-user` script eklendi

3. **`package.json`** (root)
   - `create:test-user` script eklendi

4. **`client/cypress/support/commands.ts`**
   - `loginAsAdmin()` artık test kullanıcısını kullanıyor

5. **`client/cypress.config.ts`**
   - Test kullanıcısı environment variables eklendi

6. **`client/cypress/e2e/admin-workflows.cy.ts`**
   - Test kullanıcısı bilgileri kullanılıyor

7. **`client/cypress/e2e/full-application.cy.ts`**
   - Test kullanıcısı bilgileri kullanılıyor

---

## ✅ Avantajlar

1. **2FA Sorunu Yok**: Test kullanıcısının 2FA'sı kapalı, login sorunsuz
2. **Tutarlılık**: Tüm testler aynı kullanıcıyı kullanır
3. **Kolay Yönetim**: Tek komutla test kullanıcısı oluşturulur/güncellenir
4. **Güvenlik**: Test kullanıcısı production'da kullanılmaz (sadece test için)

---

## 🔒 Güvenlik Notları

1. **Production'da Kullanmayın**: Bu kullanıcı sadece test için
2. **Şifre Güvenliği**: Test ortamında güçlü şifre kullanılabilir
3. **2FA Kapalı**: Test kolaylığı için 2FA kapalı, production'da açık olmalı

---

## 🧪 Test Çalıştırma

Test kullanıcısı oluşturulduktan sonra:

```bash
# E2E testleri çalıştır
npm run test:e2e

# Veya tüm testler
npm run test:all
```

---

## 📊 Durum

- ✅ Test kullanıcısı oluşturuldu
- ✅ 2FA kapalı
- ✅ Cypress testleri güncellendi
- ✅ Script hazır ve çalışıyor

---

**Son Güncelleme**: 2026-01-19  
**Durum**: ✅ **TAMAMLANDI**
