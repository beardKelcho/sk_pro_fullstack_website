import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import logger from '../utils/logger';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SK Production API',
      version: '1.0.0',
      description: 'SK Production API Documentation - Equipment Management, Project Tracking, and Task Management System',
      contact: {
        name: 'SK Production',
        email: 'info@skproduction.com',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5001/api',
        description: 'Development server',
      },
      {
        url: 'https://api.skproduction.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token ile kimlik doğrulama. Format: Bearer {token}',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
          description: 'Refresh token cookie ile kimlik doğrulama',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Bir hata oluştu',
            },
            errors: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'İşlem başarılı',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              example: 'Ahmet Yılmaz',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'ahmet@example.com',
            },
            role: {
              type: 'string',
              enum: ['admin', 'proje yöneticisi', 'teknisyen', 'depocu', 'firma sahibi', 'depo sorumlusu'],
              example: 'admin',
            },
            department: {
              type: 'string',
              example: 'Teknik',
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Equipment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              example: 'Analog Way Aquilon RS4',
            },
            type: {
              type: 'string',
              enum: ['VideoSwitcher', 'MediaServer', 'Camera', 'Display', 'Audio', 'Lighting', 'Cable', 'Accessory'],
              example: 'VideoSwitcher',
            },
            model: {
              type: 'string',
              example: 'Aquilon RS4',
            },
            serialNumber: {
              type: 'string',
              example: 'AW-RS4-2024-001',
            },
            status: {
              type: 'string',
              enum: ['Available', 'InUse', 'Maintenance', 'Broken'],
              example: 'Available',
            },
            location: {
              type: 'string',
              example: 'Depo A',
            },
            purchaseDate: {
              type: 'string',
              format: 'date',
            },
            lastMaintenanceDate: {
              type: 'string',
              format: 'date',
            },
            nextMaintenanceDate: {
              type: 'string',
              format: 'date',
            },
          },
        },
        Project: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              example: 'Acme Corp Konferansı',
            },
            description: {
              type: 'string',
              example: 'Yıllık konferans etkinliği',
            },
            status: {
              type: 'string',
              enum: ['Planlama', 'Devam Ediyor', 'Tamamlandı', 'İptal Edildi'],
              example: 'Devam Ediyor',
            },
            startDate: {
              type: 'string',
              format: 'date',
            },
            endDate: {
              type: 'string',
              format: 'date',
            },
            location: {
              type: 'string',
              example: 'İstanbul, Türkiye',
            },
            client: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
          },
        },
        Task: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            title: {
              type: 'string',
              example: 'Ekipman kurulumu',
            },
            description: {
              type: 'string',
              example: 'LED wall kurulumu ve test',
            },
            status: {
              type: 'string',
              enum: ['Beklemede', 'Devam Ediyor', 'Tamamlandı', 'İptal Edildi'],
              example: 'Devam Ediyor',
            },
            priority: {
              type: 'string',
              enum: ['Düşük', 'Orta', 'Yüksek', 'Acil'],
              example: 'Yüksek',
            },
            dueDate: {
              type: 'string',
              format: 'date',
            },
            assignedTo: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            project: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Kimlik doğrulama endpoint\'leri',
      },
      {
        name: 'Equipment',
        description: 'Ekipman yönetimi endpoint\'leri',
      },
      {
        name: 'Projects',
        description: 'Proje yönetimi endpoint\'leri',
      },
      {
        name: 'Tasks',
        description: 'Görev yönetimi endpoint\'leri',
      },
      {
        name: 'Users',
        description: 'Kullanıcı yönetimi endpoint\'leri',
      },
      {
        name: 'Clients',
        description: 'Müşteri yönetimi endpoint\'leri',
      },
      {
        name: 'Maintenance',
        description: 'Bakım takibi endpoint\'leri',
      },
      {
        name: 'Dashboard',
        description: 'Dashboard istatistikleri endpoint\'leri',
      },
      {
        name: 'Upload',
        description: 'Dosya yükleme endpoint\'leri',
      },
      {
        name: 'Export',
        description: 'Veri export endpoint\'leri',
      },
      {
        name: 'Site Images',
        description: 'Site resim yönetimi endpoint\'leri',
      },
      {
        name: 'Site Content',
        description: 'Site içerik yönetimi endpoint\'leri',
      },
      {
        name: 'QR Codes',
        description: 'QR kod yönetimi endpoint\'leri',
      },
      {
        name: 'Notifications',
        description: 'Bildirim yönetimi endpoint\'leri',
      },
      {
        name: 'Audit Logs',
        description: 'Aktivite logları endpoint\'leri',
      },
      {
        name: 'Search',
        description: 'Global arama endpoint\'leri',
      },
      {
        name: 'Bulk Operations',
        description: 'Toplu işlem endpoint\'leri',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  try {
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'SK Production API Documentation',
        customCssUrl: undefined,
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          filter: true,
          tryItOutEnabled: true,
        },
      })
    );

    logger.info('Swagger UI başarıyla yapılandırıldı: /api-docs');
  } catch (error) {
    logger.error('Swagger UI yapılandırma hatası:', error);
  }
};

export default specs;
