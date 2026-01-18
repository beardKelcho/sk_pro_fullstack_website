/**
 * Log Transports
 * Winston transport konfigürasyonları (ELK, CloudWatch, vb.)
 */

import winston from 'winston';
import logger from './logger';

/**
 * CloudWatch Logs Transport
 * AWS CloudWatch Logs'a log gönderir
 */
export const createCloudWatchTransport = (): winston.transport | null => {
  try {
    // CloudWatch Logs sadece production'da ve AWS credentials varsa aktif
    if (process.env.NODE_ENV !== 'production' || !process.env.AWS_REGION) {
      return null;
    }

    // @ts-ignore - winston-cloudwatch paketi type tanımları eksik olabilir
    const CloudWatchTransport = require('winston-cloudwatch');
    
    return new CloudWatchTransport({
      logGroupName: process.env.CLOUDWATCH_LOG_GROUP || 'sk-production-api',
      logStreamName: process.env.CLOUDWATCH_LOG_STREAM || `${process.env.NODE_ENV}-${new Date().toISOString().split('T')[0]}`,
      awsRegion: process.env.AWS_REGION,
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
      messageFormatter: (info: any) => {
        return JSON.stringify({
          level: info.level,
          message: info.message,
          timestamp: info.timestamp,
          ...info.metadata,
        });
      },
      jsonMessage: true,
    });
  } catch (error) {
    logger.warn('CloudWatch transport oluşturulamadı:', error);
    return null;
  }
};

/**
 * Elasticsearch Transport
 * ELK stack'e log gönderir
 * 
 * NOT: winston-elasticsearch paketi opsiyonel dependency'dir
 * Kullanmak için: npm install winston-elasticsearch --save
 */
export const createElasticsearchTransport = (): winston.transport | null => {
  try {
    // Elasticsearch sadece production'da ve ELASTICSEARCH_URL varsa aktif
    if (process.env.NODE_ENV !== 'production' || !process.env.ELASTICSEARCH_URL || process.env.ENABLE_ELASTICSEARCH_LOGS !== 'true') {
      return null;
    }

    // winston-elasticsearch paketi yüklü mü kontrol et
    let ElasticsearchTransport;
    try {
      ElasticsearchTransport = require('winston-elasticsearch');
    } catch (error) {
      logger.warn('winston-elasticsearch paketi bulunamadı. Elasticsearch transport devre dışı. Yüklemek için: npm install winston-elasticsearch --save');
      return null;
    }
    
    // @ts-ignore - winston-elasticsearch paketi type tanımları eksik olabilir
    return new ElasticsearchTransport({
      level: process.env.LOG_LEVEL || 'info',
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL,
        auth: process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD ? {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD,
        } : undefined,
      },
      index: process.env.ELASTICSEARCH_INDEX || 'sk-production-logs',
      indexTemplate: {
        index_patterns: [process.env.ELASTICSEARCH_INDEX || 'sk-production-logs'],
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
        },
        mappings: {
          properties: {
            timestamp: { type: 'date' },
            level: { type: 'keyword' },
            message: { type: 'text' },
            service: { type: 'keyword' },
            requestId: { type: 'keyword' },
          },
        },
      },
      transformer: (logData: any) => {
        return {
          '@timestamp': logData.timestamp || new Date().toISOString(),
          level: logData.level,
          message: logData.message,
          service: logData.metadata?.service || 'sk-production-api',
          requestId: logData.metadata?.requestId,
          ...logData.metadata,
        };
      },
    });
  } catch (error) {
    logger.warn('Elasticsearch transport oluşturulamadı:', error);
    return null;
  }
};

/**
 * File Transport (JSON format)
 * Log dosyalarına JSON formatında yazar (log aggregation için)
 */
export const createFileTransport = (): winston.transport | null => {
  try {
    const logDir = process.env.LOG_DIR || 'logs';
    const fs = require('fs');
    const path = require('path');
    
    // Log klasörünü oluştur
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    return new winston.transports.File({
      filename: path.join(logDir, 'app.json'),
      format: winston.format.json(),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    });
  } catch (error) {
    logger.warn('File transport oluşturulamadı:', error);
    return null;
  }
};

/**
 * Tüm log transport'larını oluştur
 * Environment variable'lara göre aktif transport'ları döndürür
 */
export const createLogTransports = (): winston.transport[] => {
  const transports: winston.transport[] = [];

  // Console transport (her zaman aktif)
  transports.push(
    new winston.transports.Console({
      format: process.env.LOG_CONSOLE_FORMAT === 'json'
        ? winston.format.json()
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
    })
  );

  // File transport (JSON format)
  const fileTransport = createFileTransport();
  if (fileTransport) {
    transports.push(fileTransport);
  }

  // CloudWatch transport (production + AWS credentials varsa)
  if (process.env.ENABLE_CLOUDWATCH_LOGS === 'true') {
    const cloudWatchTransport = createCloudWatchTransport();
    if (cloudWatchTransport) {
      transports.push(cloudWatchTransport);
    }
  }

  // Elasticsearch transport (production + ELASTICSEARCH_URL varsa)
  if (process.env.ENABLE_ELASTICSEARCH_LOGS === 'true') {
    const elasticsearchTransport = createElasticsearchTransport();
    if (elasticsearchTransport) {
      transports.push(elasticsearchTransport);
    }
  }

  return transports;
};
