# 🔌 WebSocket Entegrasyonu

> **Tarih**: 2026-01-18  
> **Durum**: Temel yapı tamamlandı ✅

---

## 📊 Genel Bakış

Proje artık **WebSocket** desteği ile gerçek zamanlı işbirliği özellikleri sunuyor. Socket.io kullanılarak iki yönlü iletişim sağlanır.

---

## 🎯 Özellikler

### ✅ Tamamlanan Özellikler

1. **WebSocket Server**
   - Socket.io entegrasyonu
   - JWT authentication
   - Room-based messaging
   - Role-based messaging
   - User-specific messaging

2. **Collaborative Editing**
   - Proje düzenleme için real-time updates
   - `project:edit` event desteği
   - `project:update` broadcast

3. **Presence System**
   - Kullanıcı bağlantı durumu
   - Room membership tracking

---

## 🚀 Kurulum

### 1. Environment Variables

```bash
# WebSocket'i aktif et
ENABLE_WEBSOCKET=true
```

### 2. Client-side Bağlantı

```typescript
import { io } from 'socket.io-client';

const socket = io('<your-backend-url>', {
  auth: {
    token: localStorage.getItem('accessToken'),
  },
  path: '/socket.io',
});

// Connection events
socket.on('connect', () => {
  console.log('WebSocket bağlandı');
});

socket.on('disconnect', () => {
  console.log('WebSocket bağlantısı kesildi');
});

// Proje düzenleme
socket.on('join:project', (projectId: string) => {
  socket.emit('join:project', projectId);
});

// Proje güncellemelerini dinle
socket.on('project:update', (data: { userId: string; changes: any }) => {
  console.log('Proje güncellendi:', data);
});

// Proje düzenleme gönder
socket.emit('project:edit', {
  projectId: 'project123',
  changes: { name: 'Yeni Proje Adı' },
});
```

---

## 🔧 API

### Server-side Functions

```typescript
import { sendToRole, sendToUser, broadcast, sendToRoom } from './config/websocket';

// Role'e mesaj gönder
sendToRole('ADMIN', 'notification', { message: 'Yeni bildirim' });

// Kullanıcıya mesaj gönder
sendToUser('user123', 'notification', { message: 'Kişisel bildirim' });

// Tüm kullanıcılara broadcast
broadcast('system:update', { message: 'Sistem güncellendi' });

// Room'a mesaj gönder
sendToRoom('project:123', 'project:update', { changes: { name: 'Yeni Ad' } });
```

---

## 📁 Dosya Yapısı

```
server/src/
├── config/
│   └── websocket.ts                    # WebSocket configuration
├── middleware/
│   └── socketAuth.middleware.ts        # Socket.io authentication
└── index.ts                            # WebSocket server initialization
```

---

## 🔒 Güvenlik

- **JWT Authentication**: Tüm WebSocket bağlantıları JWT token ile doğrulanır
- **Room Isolation**: Kullanıcılar sadece yetkili oldukları room'lara katılabilir
- **Role-based Access**: Role bazlı mesajlaşma desteği

---

## 💡 Notlar

- **SSE vs WebSocket**: SSE mevcut bildirimler için yeterli, WebSocket collaborative editing için
- **Production**: `ENABLE_WEBSOCKET=true` environment variable ile aktif edilir
- **Scalability**: Socket.io Redis adapter ile horizontal scaling desteklenir (ileride eklenebilir)

---

*Son Güncelleme: 2026-01-18*
