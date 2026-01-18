# Log Aggregation Rehberi

## Genel Bakış

SK Production API için log aggregation desteği. ELK Stack (Elasticsearch, Logstash, Kibana) ve AWS CloudWatch Logs entegrasyonları.

## Özellikler

### 1. CloudWatch Logs Entegrasyonu

AWS CloudWatch Logs'a otomatik log gönderimi.

#### Kurulum

1. **AWS Credentials Ayarları**:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
ENABLE_CLOUDWATCH_LOGS=true
CLOUDWATCH_LOG_GROUP=sk-production-api
CLOUDWATCH_LOG_STREAM=production-2026-01-18
```

2. **Winston CloudWatch Paketi** (opsiyonel):
```bash
npm install winston-cloudwatch --save
```

#### Kullanım

CloudWatch transport otomatik olarak aktif olur:
- `NODE_ENV=production`
- `AWS_REGION` environment variable'ı set edilmiş
- `ENABLE_CLOUDWATCH_LOGS=true`

### 2. Elasticsearch (ELK Stack) Entegrasyonu

Elasticsearch'e log gönderimi için entegrasyon.

#### Kurulum

1. **Elasticsearch Ayarları**:
```env
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_INDEX=sk-production-logs
ENABLE_ELASTICSEARCH_LOGS=true
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your-password
```

2. **Winston Elasticsearch Paketi** (opsiyonel):
```bash
npm install winston-elasticsearch --save
```

#### Kullanım

Elasticsearch transport otomatik olarak aktif olur:
- `NODE_ENV=production`
- `ELASTICSEARCH_URL` environment variable'ı set edilmiş
- `ENABLE_ELASTICSEARCH_LOGS=true`

### 3. File Transport (JSON)

Log dosyalarına JSON formatında yazma (log aggregation araçları için).

#### Konfigürasyon

```env
LOG_DIR=logs  # Log dosyalarının yazılacağı klasör
```

Log dosyası: `logs/app.json` (JSON format, 10MB max, 5 dosya rotation)

## Log Formatı

Tüm loglar JSON formatında:

```json
{
  "level": "info",
  "message": "Request completed",
  "timestamp": "2026-01-18 10:30:45",
  "service": "sk-production-api",
  "requestId": "abc123",
  "metadata": {
    "method": "GET",
    "path": "/api/projects",
    "statusCode": 200,
    "duration": 45
  }
}
```

## Environment Variables

### CloudWatch

- `AWS_REGION`: AWS bölgesi (örn: us-east-1)
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `ENABLE_CLOUDWATCH_LOGS`: CloudWatch'ı aktif et (true/false)
- `CLOUDWATCH_LOG_GROUP`: Log group adı (default: sk-production-api)
- `CLOUDWATCH_LOG_STREAM`: Log stream adı (default: production-YYYY-MM-DD)

### Elasticsearch

- `ELASTICSEARCH_URL`: Elasticsearch URL (örn: http://localhost:9200)
- `ELASTICSEARCH_INDEX`: Index adı (default: sk-production-logs)
- `ENABLE_ELASTICSEARCH_LOGS`: Elasticsearch'ü aktif et (true/false)
- `ELASTICSEARCH_USERNAME`: Elasticsearch kullanıcı adı (opsiyonel)
- `ELASTICSEARCH_PASSWORD`: Elasticsearch şifresi (opsiyonel)

### Genel

- `LOG_LEVEL`: Log seviyesi (debug, info, warn, error)
- `LOG_DIR`: Log dosyalarının yazılacağı klasör (default: logs)
- `LOG_CONSOLE_FORMAT`: Console format (json veya default)

## Örnek Konfigürasyonlar

### Development

```env
LOG_LEVEL=debug
LOG_CONSOLE_FORMAT=default
# CloudWatch ve Elasticsearch kapalı
```

### Production (CloudWatch)

```env
NODE_ENV=production
LOG_LEVEL=info
LOG_CONSOLE_FORMAT=json
ENABLE_CLOUDWATCH_LOGS=true
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
CLOUDWATCH_LOG_GROUP=sk-production-api
```

### Production (ELK Stack)

```env
NODE_ENV=production
LOG_LEVEL=info
LOG_CONSOLE_FORMAT=json
ENABLE_ELASTICSEARCH_LOGS=true
ELASTICSEARCH_URL=https://elasticsearch.example.com:9200
ELASTICSEARCH_INDEX=sk-production-logs
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=xxx
```

## Log Aggregation Araçları

### 1. Filebeat (ELK Stack için)

Filebeat ile `logs/app.json` dosyasını Elasticsearch'e gönderebilirsiniz:

```yaml
# filebeat.yml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /path/to/logs/app.json
    json.keys_under_root: true
    json.add_error_key: true

output.elasticsearch:
  hosts: ["http://localhost:9200"]
  index: "sk-production-logs"
```

### 2. CloudWatch Logs Insights

CloudWatch Logs'ta sorgular:

```
fields @timestamp, level, message, requestId
| filter level = "error"
| sort @timestamp desc
| limit 100
```

### 3. Kibana (ELK Stack)

Kibana'da log görselleştirme ve analiz:
- Index pattern: `sk-production-logs`
- Time field: `@timestamp`

## Best Practices

1. **Production'da JSON Format**: Console output'u JSON formatında kullanın
2. **Log Rotation**: File transport otomatik rotation yapar (10MB, 5 dosya)
3. **Request ID**: Her request için unique `requestId` kullanın (correlation için)
4. **Structured Logging**: Metadata'yı structured format'ta tutun
5. **Error Tracking**: Error loglarını Sentry ile de entegre edin

## Monitoring

### CloudWatch Metrics

CloudWatch'ta log-based metrics oluşturabilirsiniz:
- Error rate
- Request count
- Response time

### Elasticsearch Dashboards

Kibana'da dashboard'lar oluşturun:
- Error rate over time
- Top endpoints
- Slow queries
- User activity

## Troubleshooting

### CloudWatch Logs Görünmüyor

1. AWS credentials kontrol edin
2. IAM permissions kontrol edin (logs:CreateLogGroup, logs:CreateLogStream, logs:PutLogEvents)
3. `ENABLE_CLOUDWATCH_LOGS=true` olduğundan emin olun

### Elasticsearch Bağlantı Hatası

1. `ELASTICSEARCH_URL` doğru mu kontrol edin
2. Network erişimi var mı kontrol edin
3. Authentication bilgileri doğru mu kontrol edin

### Log Dosyaları Oluşmuyor

1. `LOG_DIR` klasörü yazılabilir mi kontrol edin
2. Disk space yeterli mi kontrol edin
3. File permissions kontrol edin

## Sonuç

Log aggregation ile:
- Merkezi log yönetimi
- Gerçek zamanlı log analizi
- Hata takibi ve debugging
- Performans monitoring
- Compliance ve audit
