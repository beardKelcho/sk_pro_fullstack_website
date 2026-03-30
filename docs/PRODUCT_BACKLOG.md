# Product Backlog

> Kod tabanı stabil hale geldikten sonra en yüksek değer üretecek sıradaki işler.

---

## P1 - Operasyon ve Güven

1. Render dashboard'da `healthCheckPath=/api/readyz` ayarını kalıcı hale getir.
2. Sentry alarm kurallarını owner listesiyle netleştir.
3. `Production Smoke` workflow sonucunu e-posta veya Slack bildirimine bağla.
4. Uptime monitor ile `www.skpro.com.tr` ve backend `readyz` takibini dışarıdan da aktif et.

---

## P2 - Performans

1. Lighthouse CI sonucunu düzenli raporlayan bir PR veya schedule akışı ekle.
2. En çok kullanılan admin ekranlarında büyük tablo ve sorgu performansı ölçümü yap.
3. Public sayfalarda görsel optimizasyon ve cache hit oranını artır.

---

## P3 - Ürün ve Kullanım Deneyimi

1. Admin için daha görünür incident ve monitoring özeti ekle.
2. Yetki matrisi ekranını okunur rapor veya export ile destekle.
3. Mobile uygulama tarafında kritik admin veya saha senaryolarını netleştir.
4. Audit log filtreleri ve geri alma akışlarını güçlendir.

---

## P4 - Kalite ve Süreklilik

1. Restore tatbikatını takvimli rutin haline getir.
2. Release notu ve changelog üretimini standardize et.
3. Yeni modüller için "test before merge" kontrol listesini ekip standardı yap.
