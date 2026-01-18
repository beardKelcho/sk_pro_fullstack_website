# Aggregation Pipeline Optimizasyonu

## Genel Bakış

MongoDB aggregation pipeline'larını optimize etmek için utility fonksiyonları ve best practice'ler.

## Özellikler

### 1. Pipeline Optimizasyonu

`optimizeAggregation()` fonksiyonu:
- `$match` stage'lerini mümkün olduğunca erken taşır
- `$sort` ve `$limit` stage'lerini birleştirir
- `$project` stage'lerinde gereksiz alanları kaldırır
- Index kullanımını optimize eder

### 2. Memory Optimizasyonu

`optimizeForMemory()` fonksiyonu:
- Büyük veri setleri için `allowDiskUse` önerir
- `$group` stage'lerinde memory kullanımını azaltır

### 3. Index Önerileri

`suggestIndexesForAggregation()` fonksiyonu:
- `$match` ve `$sort` stage'lerinde kullanılan alanları analiz eder
- Compound index önerileri sunar

## Kullanım

### Temel Kullanım

```typescript
import { optimizeAggregation } from '../utils/aggregationOptimizer';

const pipeline = [
  { $match: { status: 'ACTIVE' } },
  { $group: { _id: '$category', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
];

const optimized = optimizeAggregation(pipeline);
const results = await Model.aggregate(optimized, { allowDiskUse: true });
```

### Memory Optimizasyonu

```typescript
import { optimizeForMemory } from '../utils/aggregationOptimizer';

const { pipeline, options } = optimizeForMemory(pipeline, estimatedDataSize);
const results = await Model.aggregate(pipeline, options);
```

### Index Önerileri

```typescript
import { suggestIndexesForAggregation } from '../utils/aggregationOptimizer';

const suggestions = suggestIndexesForAggregation(pipeline);
console.log('Index önerileri:', suggestions);
```

## Best Practices

1. **$match'i Erken Kullan**: Filtreleme stage'lerini mümkün olduğunca erken kullanın
2. **$limit'i $lookup'tan Önce Kullan**: $lookup'tan önce $limit kullanarak performansı artırın
3. **$project'i Optimize Et**: Sadece gerekli alanları projeksiyon yapın
4. **allowDiskUse Kullan**: Büyük veri setleri için `allowDiskUse: true` kullanın
5. **Index Kullan**: $match ve $sort stage'lerinde kullanılan alanlar için index oluşturun

## Connection Pool Optimizasyonu

### Environment Variables

```env
# MongoDB Connection Pool Ayarları
MONGODB_MAX_POOL_SIZE=20        # Maksimum bağlantı sayısı
MONGODB_MIN_POOL_SIZE=5         # Minimum bağlantı sayısı
MONGODB_MAX_IDLE_TIME_MS=30000  # Idle kalma süresi (ms)
MONGODB_HEARTBEAT_FREQUENCY_MS=10000  # Heartbeat sıklığı (ms)
```

### Önerilen Ayarlar

- **Development**: maxPoolSize=10, minPoolSize=2
- **Production**: maxPoolSize=50, minPoolSize=10
- **High Traffic**: maxPoolSize=100, minPoolSize=20

## Performans İzleme

Development modunda aggregation explain sonuçları loglanır:

```env
DEBUG_QUERIES=true
```

Bu ayar ile aggregation pipeline'ların execution plan'ı ve index kullanımı görüntülenebilir.

## Örnekler

### Analytics Controller

Analytics controller'da aggregation pipeline'lar optimize edilmiştir:

```typescript
const projectByStatusPipeline = optimizeAggregation([
  { $match: projectMatch },
  { $group: { _id: '$status', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);

const projectByStatus = await Project.aggregate(projectByStatusPipeline, { allowDiskUse: true });
```

### Dashboard Controller

Dashboard controller'da da aggregation pipeline'lar optimize edilmiştir:

```typescript
const equipmentStatusPipeline = optimizeAggregation([
  { $group: { _id: '$status', count: { $sum: 1 } } }
]);
const equipmentStatus = await Equipment.aggregate(equipmentStatusPipeline);
```

## Sonuç

Aggregation pipeline optimizasyonu ile:
- Query performansı %30-50 artabilir
- Memory kullanımı azalır
- Index kullanımı optimize edilir
- Büyük veri setlerinde daha iyi performans sağlanır
