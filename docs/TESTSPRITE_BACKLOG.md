# TestSprite Backlog (P0 → P3)

Bu doküman, **TestSprite** çalıştırması sonucu **FAILED** olan testleri, aksiyon maddelerine dönüştürür.

- **Run**: 2026-01-19
- **Rapor**: `testsprite_tests/testsprite-mcp-test-report.md`
- **Sonuç**: **22 test** → **10 Passed / 12 Failed**

---

## P0 — Güvenlik / Test Blokajı

### TC017 — Oturum yönetimi: revoke çalışmıyor
- **Hedef (frontend)**
  - `client/src/app/admin/sessions/page.tsx`
  - `client/src/services/sessionService.ts`
- **Hedef (backend)**
  - `server/src/routes/session.routes.ts`
  - `server/src/controllers/session.controller.ts`
- **Kontrol listesi**
  - **UI**: “Sonlandır” ve “Diğer oturumları sonlandır” aksiyonları doğru endpoint çağırıyor mu?
  - **API**: `DELETE /api/sessions/:sessionId` ve `DELETE /api/sessions/all/others` başarılı response dönüyor mu?
  - **Hata yönetimi**: UI toast + error state doğru mu (response message göster)?
  - **Liste yenileme**: revoke sonrası session list refetch/invalidate oluyor mu?
- **Test adımı**
  - Admin login → `/admin/sessions`
  - “Diğer oturumları sonlandır” → başarı toast → listede diğer oturumlar kalkmalı
  - Tek oturumu sonlandır → listeden kaybolmalı

### TC011 — Login rate limiting (429) testleri blokluyor
- **Hedef (backend)**
  - `server/src/middleware/rateLimiters.ts`
  - `server/src/routes/auth.routes.ts`
  - `server/src/index.ts` (rate limiter mount’ları)
- **Kontrol listesi**
  - **Dev/Test**: `NODE_ENV=development|test` iken login limiter max yeterince yüksek mi?
  - **Key strategy**: yalnız IP mi, yoksa user+ip mi?
  - **Skip/whitelist**: test runner için opsiyonel bypass var mı?
- **Test adımı**
  - 20+ ardışık login denemesi → dev/test ortamında 429 gelmemeli
  - TestSprite TC011 koşusunda login bloklanmadan ilerlemeli

---

## P1 — Ana Modüller (Ekipman/Bakım) Kırıkları

### TC005 — Ekipman silme sonrası listede kalıyor
- **Hedef (frontend)**
  - `client/src/app/admin/equipment/page.tsx`
  - `client/src/services/equipmentService.ts`
- **Hedef (backend)**
  - `server/src/controllers/equipment.controller.ts`
  - `server/src/routes/equipment.routes.ts` (varsa)
- **Kontrol listesi**
  - **Delete semantics**: soft/hard delete mi? Response ne dönüyor?
  - **UI refresh**: delete sonrası liste refetch/invalidate oluyor mu?
  - **ID mapping**: UI `id` ↔ backend `_id` eşleşmesi doğru mu?
- **Test adımı**
  - `/admin/equipment` → ekipman oluştur → listede gör → sil → listede yok → refresh → hâlâ yok

### TC010 — Ekipman “Görüntüle” tıklaması checkbox tetikliyor
- **Hedef (frontend)**
  - `client/src/app/admin/equipment/page.tsx`
  - `client/src/app/admin/equipment/view/[id]/page.tsx`
- **Kontrol listesi**
  - Link click event’i checkbox/satır click’i ile çakışıyor mu?
  - “Görüntüle” her zaman `/admin/equipment/view/:id` route’una gidiyor mu?
- **Test adımı**
  - `/admin/equipment` → “Görüntüle” tıkla → detay sayfası açılmalı, checkbox state değişmemeli

### TC006 — Bakım kaydı oluşturma/güncelleme kaydedilemiyor
- **Hedef (frontend)**
  - `client/src/app/admin/equipment/maintenance/page.tsx`
  - `client/src/app/admin/maintenance/add/page.tsx`
  - `client/src/app/admin/maintenance/edit/[id]/page.tsx`
  - `client/src/services/maintenanceService.ts`
- **Hedef (backend)**
  - `server/src/controllers/maintenance.controller.ts`
  - `server/src/routes/maintenance.routes.ts` (varsa)
- **Kontrol listesi**
  - Zorunlu alanlar: `equipment`, `type`, `description`, `scheduledDate`, `assignedTo`
  - Tarih formatı: backend’in beklediği format (ISO) ile frontend uyumlu mu?
  - UI’da 400/500 mesajı görünür ve anlaşılır mı?
- **Test adımı**
  - Bakım oluştur → kaydet → listede görünmeli
  - Bakımı güncelle → kaydet → değişiklik listede görünmeli

---

## P2 — Navigasyon / Yönetim Ekranı Erişimi

### TC008 — “Proje Yönetimi” navigasyon kırık
- **Hedef (frontend)**
  - `client/src/app/admin/tasks/page.tsx`
  - `client/src/app/admin/tasks/view/[id]/page.tsx`
  - `client/src/components/admin/AdminSidebar.tsx`
  - `client/src/constants/routes.ts` (opsiyonel)
- **Kontrol listesi**
  - Buton/link var mı ve doğru path’e mi gidiyor? (`/admin/projects` / `/admin/projects/view/:id`)
  - Permission wrapper’lar linki engelliyor mu?
- **Test adımı**
  - Task view → “Proje Yönetimi” → `/admin/projects` açılmalı
  - Task içindeki proje linki → `/admin/projects/view/:id` açılmalı

### TC012 / TC013 — Import/Export admin UI erişimi yok
- **Hedef (frontend)**
  - `client/src/app/admin/import/page.tsx`
  - `client/src/app/admin/export/page.tsx`
  - `client/src/components/admin/AdminSidebar.tsx`
  - `client/src/components/admin/ImportModal.tsx`
  - `client/src/components/admin/ExportMenu.tsx`
- **Hedef (backend)**
  - `server/src/controllers/import.controller.ts`
  - `server/src/controllers/export.controller.ts`
  - `server/src/routes/import.routes.ts`, `server/src/routes/export.routes.ts` (varsa)
- **Kontrol listesi**
  - Menüden erişim linkleri görünüyor mu?
  - Export endpoint’leri çalışıyor mu (CSV/Excel/PDF)?
  - Import valid/invalid kayıt ayrımı + hata çıktısı doğru mu?
- **Test adımı**
  - `/admin/export` → indirilebilir export olmalı
  - `/admin/import` → dosya yükle → valid/invalid senaryoları çalışmalı

### TC018 — Versiyon geçmişi proje edit’te yok/erişilemiyor
- **Hedef (frontend)**
  - `client/src/app/admin/projects/edit/[id]/page.tsx`
  - `client/src/components/admin/VersionHistoryModal.tsx`
  - `client/src/services/versionHistoryService.ts`
- **Hedef (backend)**
  - `server/src/controllers/versionHistory.controller.ts`
  - `server/src/routes/versionHistory.routes.ts` (varsa)
- **Kontrol listesi**
  - Proje edit ekranında buton var mı?
  - Modal açılıyor mu, liste geliyor mu?
  - Rollback endpoint’i çalışıyor mu?
- **Test adımı**
  - Proje edit → 2 kez kaydet → “Versiyon Geçmişi” → en az 2 kayıt görünmeli → rollback dene

---

## P3 — Takvim + Public Site + Cihaz Kapsamı

### TC009 — Takvimde event görünmüyor / assignee seçilemiyor
- **Hedef (frontend)**
  - `client/src/app/admin/calendar/page.tsx`
  - `client/src/services/userService.ts` (assignee listesi)
  - `client/src/services/api/axios.ts` (calendar endpoint çağrısı)
- **Hedef (backend)**
  - `server/src/controllers/calendar.controller.ts`
- **Kontrol listesi**
  - `/api/calendar/events` response → UI mapping doğru mu?
  - Filtreler eventleri yanlışlıkla saklıyor mu? (`showProjects`, `showEquipment`, `status`)
  - Assignee selection için user listesi geliyor mu?
- **Test adımı**
  - Takvim aç → en az 1 event görünmeli
  - Drag&drop ile tarih güncelle → kaydolmalı (refresh sonrası da)

### TC021 — Public site dil menüsü çalışmıyor
- **Hedef (frontend)**
  - `client/src/components/layout/Header.tsx`
  - `client/src/components/common/FlagIcon.tsx`
  - `client/src/middleware.ts`
  - `client/src/i18n/*`
- **Kontrol listesi**
  - Menü tıklanınca dropdown açılıyor mu? (z-index/overlay)
  - Dil seçince route değişiyor mu? (`/tr` → `/en`)
  - A11y: `aria-haspopup`, `aria-expanded` doğru mu?
- **Test adımı**
  - Public home → dil menüsü aç → EN seç → URL `/en...` olmalı, metinler değişmeli

### TC022 — Responsive + PWA (tablet/mobil kapsam)
- **Hedef (frontend)**
  - `client/src/app/layout.tsx` (manifest, PWA)
  - `client/public/manifest.json` (varsa)
  - Responsive bileşenler: `client/src/components/layout/*`, `client/src/app/page.tsx`
- **Kontrol listesi**
  - Mobil/tablet breakpoint’lerinde layout taşması var mı?
  - Offline indicator ve PWA install prompt smoke
- **Test adımı**
  - Playwright device emulation ile iPhone/Pixel/iPad viewport
  - Kritik sayfalar (home, `/admin/login`, `/admin/dashboard`) render OK
  - PWA/offline smoke PASS

