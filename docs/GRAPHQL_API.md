# 🔷 GraphQL API

> **Tarih**: 2026-01-18  
> **Durum**: Temel yapı tamamlandı ✅

---

## 📊 Genel Bakış

Proje artık **GraphQL API** desteği sunuyor. REST API ile birlikte çalışır, daha esnek veri çekme imkanı sağlar.

---

## 🎯 Özellikler

### ✅ Tamamlanan Özellikler

1. **GraphQL Server**
   - Apollo Server entegrasyonu
   - JWT authentication
   - Type definitions
   - Resolvers (Projects, Equipment, Tasks, Clients)

2. **Queries**
   - `projects` - Proje listesi
   - `project(id)` - Proje detayı
   - `equipment` - Ekipman listesi
   - `equipmentItem(id)` - Ekipman detayı
   - `tasks` - Görev listesi
   - `task(id)` - Görev detayı
   - `clients` - Müşteri listesi
   - `client(id)` - Müşteri detayı

3. **Mutations**
   - `createProject` - Proje oluştur
   - `updateProject` - Proje güncelle
   - `deleteProject` - Proje sil

---

## 🚀 Kurulum

### 1. Environment Variables

```bash
# GraphQL'i aktif et
ENABLE_GRAPHQL=true
```

### 2. GraphQL Endpoint

- **Development**: `http://localhost:5001/graphql`
- **Production**: `https://yourdomain.com/graphql`

---

## 🔧 Kullanım

### GraphQL Query Örneği

```graphql
query GetProjects {
  projects(limit: 10, offset: 0, status: "ACTIVE") {
    id
    name
    description
    startDate
    endDate
    status
    location
    client {
      id
      name
      email
    }
    team {
      id
      name
      email
    }
    equipment {
      id
      name
      type
    }
  }
}
```

### GraphQL Mutation Örneği

```graphql
mutation CreateProject {
  createProject(input: {
    name: "Yeni Proje"
    description: "Proje açıklaması"
    startDate: "2026-02-01"
    endDate: "2026-02-28"
    status: "APPROVED"
    location: "İstanbul"
    clientId: "client123"
    teamIds: ["user1", "user2"]
    equipmentIds: ["eq1", "eq2"]
  }) {
    id
    name
    status
  }
}
```

### Client-side Kullanım

```typescript
const query = `
  query GetProjects {
    projects(limit: 10) {
      id
      name
      status
    }
  }
`;

const response = await fetch('/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ query }),
});

const { data } = await response.json();
console.log(data.projects);
```

---

## 📁 Dosya Yapısı

```
server/src/
├── config/
│   └── graphql.ts                      # GraphQL configuration
└── index.ts                            # GraphQL server initialization
```

---

## 🔒 Güvenlik

- **JWT Authentication**: Tüm GraphQL istekleri JWT token ile doğrulanır
- **Permission Checks**: Resolver'larda permission kontrolü yapılabilir (ileride eklenebilir)
- **Introspection**: Production'da introspection kapalı

---

## 💡 Notlar

- **REST API**: GraphQL REST API ile birlikte çalışır, REST API'yi değiştirmez
- **Production**: `ENABLE_GRAPHQL=true` environment variable ile aktif edilir
- **Schema**: Schema genişletilebilir, yeni type'lar ve resolver'lar eklenebilir

---

## 🔄 REST API vs GraphQL

### REST API Kullanımı (Önerilen)
- Basit CRUD işlemleri
- Standart endpoint'ler
- Kolay entegrasyon

### GraphQL Kullanımı (Opsiyonel)
- Özel veri çekme ihtiyaçları
- Over-fetching önleme
- Tek istekle çoklu veri çekme

---

*Son Güncelleme: 2026-01-18*
