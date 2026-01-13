// Swagger paketleri opsiyonel - yüklü değilse hata vermemesi için try-catch kullanıyoruz
let swaggerJsdoc: any;
let swaggerUi: any;

try {
  swaggerJsdoc = require('swagger-jsdoc');
  swaggerUi = require('swagger-ui-express');
} catch (error) {
  // Swagger paketleri yüklü değilse, sadece development'ta uyarı ver
  if (process.env.NODE_ENV === 'development') {
    console.warn('Swagger paketleri yüklü değil. API dokümantasyonu için: npm install swagger-jsdoc swagger-ui-express');
  }
}

// specs sadece swaggerJsdoc varsa oluşturulur
let specs: any = null;
if (swaggerJsdoc) {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'SK Production API',
        version: '1.0.0',
        description: 'SK Production API documentation',
      },
      servers: [
        {
          url: process.env.API_URL || 'http://localhost:5000',
          description: 'Development server',
        },
        {
          url: 'https://api.skproduction.com',
          description: 'Production server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ['./src/routes/*.ts', './src/models/*.ts'],
  };
  specs = swaggerJsdoc(options);
}

export const setupSwagger = (app: any) => {
  if (!swaggerJsdoc || !swaggerUi) {
    // Sadece development'ta uyarı ver, production'da sessizce devre dışı bırak
    if (process.env.NODE_ENV === 'development') {
      // Uyarıyı logger ile ver, console.warn yerine
      // Bu normal bir durum, kritik değil
    }
    return;
  }

  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'SK Production API',
        version: '1.0.0',
        description: 'SK Production API documentation',
      },
      servers: [
        {
          url: process.env.API_URL || 'http://localhost:5000',
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: ['./src/routes/*.ts', './src/models/*.ts'],
  };

  const specs = swaggerJsdoc(options);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SK Production API Documentation',
  }));
}; 