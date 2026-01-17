# ⚡ Database Query Optimization Rehberi

> **Tarih**: 2026-01-17  
> **Durum**: Query optimization utilities eklendi ✅

---

## 📊 Genel Bakış

Database sorgularını optimize etmek için yardımcı fonksiyonlar ve best practice'ler eklendi.

## 🎯 Optimizasyon Araçları

### 1. Query Explain Plan

Sorgunun performansını analiz eder:

```typescript
import { explainQuery } from '@/utils/queryOptimizer';

const query = Project.find({ status: 'active' });
const explainResult = await explainQuery(query, 'active-projects');
```

### 2. Index Usage Check

Index kullanımını kontrol eder:

```typescript
import { checkIndexUsage } from '@/utils/queryOptimizer';

const usesIndex = await checkIndexUsage('projects', { status: 'active' });
```

### 3. Field Selection (Projection)

Sadece gerekli alanları seç:

```typescript
import { selectFields } from '@/utils/queryOptimizer';

const projects = await Project.find({ status: 'active' })
  .select(selectFields(['name', 'status', 'startDate']))
  .lean();
```

### 4. Pagination Helper

Optimize edilmiş sayfalama:

```typescript
import { paginate } from '@/utils/queryOptimizer';

const { skip, limit } = paginate(page, 50);
const projects = await Project.find({})
  .skip(skip)
  .limit(limit)
  .lean();
```

### 5. Lean Queries

Daha hızlı sorgular için (plain objects):

```typescript
import { leanQuery } from '@/utils/queryOptimizer';

const projects = await leanQuery(Project.find({ status: 'active' }));
```

### 6. Batch Processing

Büyük veri setlerini küçük parçalara böl:

```typescript
import { batchProcess } from '@/utils/queryOptimizer';

await batchProcess(
  Project.find({ status: 'active' }),
  100,
  async (batch) => {
    // Her batch'i işle
    await processBatch(batch);
  }
);
```

### 7. Query Cache

Basit in-memory cache:

```typescript
import { cachedQuery } from '@/utils/queryOptimizer';

const projects = await cachedQuery(
  'active-projects',
  () => Project.find({ status: 'active' }).lean(),
  5 * 60 * 1000 // 5 dakika
);
```

---

## 🔍 Slow Query Detection

Development modunda yavaş sorguları tespit eder:

```bash
# .env dosyasına ekle
DEBUG_SLOW_QUERIES=true
```

1 saniyeden uzun sorgular otomatik olarak loglanır.

---

## 📋 Best Practices

### 1. Index Kullanımı

✅ **Doğru:**
```typescript
// Index'li alan üzerinde sorgu
const projects = await Project.find({ status: 'active' }).lean();
```

❌ **Yanlış:**
```typescript
// Index olmayan alan üzerinde sorgu
const projects = await Project.find({ description: /keyword/ }).lean();
```

### 2. Field Selection

✅ **Doğru:**
```typescript
// Sadece gerekli alanları seç
const projects = await Project.find({})
  .select('name status startDate')
  .lean();
```

❌ **Yanlış:**
```typescript
// Tüm alanları çek
const projects = await Project.find({});
```

### 3. Lean Queries

✅ **Doğru:**
```typescript
// Lean query (daha hızlı)
const projects = await Project.find({}).lean();
```

❌ **Yanlış:**
```typescript
// Mongoose document (daha yavaş)
const projects = await Project.find({});
```

### 4. Pagination

✅ **Doğru:**
```typescript
// Sayfalama kullan
const { skip, limit } = paginate(page, 50);
const projects = await Project.find({})
  .skip(skip)
  .limit(limit)
  .lean();
```

❌ **Yanlış:**
```typescript
// Tüm kayıtları çek
const projects = await Project.find({});
```

### 5. Aggregation Pipeline

✅ **Doğru:**
```typescript
// Index'li alan üzerinde match
const stats = await Project.aggregate([
  { $match: { status: 'active' } }, // Index kullanır
  { $group: { _id: '$category', count: { $sum: 1 } } },
]);
```

❌ **Yanlış:**
```typescript
// Index olmayan alan üzerinde match
const stats = await Project.aggregate([
  { $match: { description: /keyword/ } }, // Index kullanmaz
  { $group: { _id: '$category', count: { $sum: 1 } } },
]);
```

---

## 🔧 Mevcut Index'ler

### Project Model
- `status` (1)
- `startDate` (1)
- `client` (1)
- `createdAt` (-1)

### Task Model
- `project` (1)
- `status` (1)
- `assignedTo` (1)
- `dueDate` (1)

### Equipment Model
- `category` (1)
- `status` (1)
- `serialNumber` (1, unique, sparse)

### User Model
- `email` (1, unique)
- `phone` (1, unique, sparse)
- `role` (1)

---

## 📊 Query Performance Monitoring

### 1. Mongoose Query Monitor

Otomatik olarak query metriklerini toplar:
- Query count
- Average execution time
- Slow queries

### 2. Manual Monitoring

```typescript
import { explainQuery } from '@/utils/queryOptimizer';

const query = Project.find({ status: 'active' });
const explainResult = await explainQuery(query, 'active-projects');

// executionStats kontrolü
const stats = explainResult.executionStats;
console.log('Docs examined:', stats.totalDocsExamined);
console.log('Docs returned:', stats.totalDocsReturned);
console.log('Execution time:', stats.executionTimeMillis, 'ms');
```

---

## 🐛 Troubleshooting

### Query çok yavaş

1. **Index kontrolü:**
   ```typescript
   await checkIndexUsage('projects', { status: 'active' });
   ```

2. **Explain plan analizi:**
   ```typescript
   await explainQuery(query, 'query-name');
   ```

3. **Field selection:**
   ```typescript
   .select('name status') // Sadece gerekli alanlar
   ```

4. **Lean query:**
   ```typescript
   .lean() // Plain objects
   ```

### Index kullanılmıyor

1. **Index var mı kontrol et:**
   ```bash
   db.projects.getIndexes()
   ```

2. **Query pattern kontrol et:**
   - Index'li alan üzerinde sorgu yapıyor musun?
   - Sort index'li alan üzerinde mi?

3. **Yeni index ekle:**
   ```typescript
   // Model'de
   schema.index({ field: 1 });
   ```

---

## 💡 Öneriler

1. **Development'ta:**
   - `DEBUG_QUERIES=true` ile explain plan'ları görüntüle
   - `DEBUG_SLOW_QUERIES=true` ile yavaş sorguları tespit et

2. **Production'da:**
   - Query monitoring'i aktif tut
   - Slow query log'larını izle
   - Index kullanımını düzenli kontrol et

3. **Index Stratejisi:**
   - Sık sorgulanan alanlara index ekle
   - Compound index'ler kullan (birden fazla alan)
   - Unique index'ler için sparse kullan

---

## 🔗 İlgili Dosyalar

- `server/src/utils/queryOptimizer.ts` - Query optimization utilities
- `server/src/utils/monitoring/dbQueryMonitor.ts` - Query monitoring
- `server/src/models/` - Model index tanımlamaları

---

*Son Güncelleme: 2026-01-17*
