import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// .env dosyasını yükle
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

const results: CheckResult[] = [];

// Renk kodları
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg: string) => console.log(`${colors.cyan}${msg}${colors.reset}`),
};

const checkEnvFile = (filePath: string, required: boolean): CheckResult => {
  const exists = fs.existsSync(filePath);
  
  if (!exists) {
    return {
      name: `File: ${path.basename(filePath)}`,
      status: required ? 'fail' : 'warning',
      message: required ? 'Dosya bulunamadı (ZORUNLU)' : 'Dosya bulunamadı (OPSİYONEL)',
      details: `Beklenen konum: ${filePath}`,
    };
  }
  
  return {
    name: `File: ${path.basename(filePath)}`,
    status: 'pass',
    message: 'Dosya mevcut',
    details: filePath,
  };
};

const checkEnvVariable = (varName: string, required: boolean = true): CheckResult => {
  const value = process.env[varName];
  
  if (!value) {
    return {
      name: `Env: ${varName}`,
      status: required ? 'fail' : 'warning',
      message: required ? 'Tanımlı değil (ZORUNLU)' : 'Tanımlı değil (OPSİYONEL)',
    };
  }
  
  // Hassas bilgileri gizle
  const displayValue = varName.includes('SECRET') || varName.includes('PASSWORD') || varName.includes('KEY')
    ? '***' + value.slice(-4)
    : value;
  
  return {
    name: `Env: ${varName}`,
    status: 'pass',
    message: 'Tanımlı',
    details: displayValue,
  };
};

const checkMongoConnection = async (): Promise<CheckResult> => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  
  if (!mongoUri) {
    return {
      name: 'MongoDB Connection',
      status: 'fail',
      message: 'MONGO_URI veya MONGODB_URI tanımlı değil',
    };
  }
  
  try {
    // Bağlantıyı test et
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    const host = mongoose.connection.host || 'unknown';
    
    await mongoose.connection.close();
    
    return {
      name: 'MongoDB Connection',
      status: 'pass',
      message: 'Bağlantı başarılı',
      details: `Host: ${host}, Database: ${dbName}`,
    };
  } catch (error: any) {
    let errorMessage = 'Bağlantı hatası';
    let details = error.message || String(error);
    
    if (error.message?.includes('IP') || error.message?.includes('whitelist')) {
      errorMessage = 'IP Whitelist hatası';
      details = 'MongoDB Atlas Network Access ayarlarını kontrol edin';
    } else if (error.message?.includes('authentication')) {
      errorMessage = 'Kimlik doğrulama hatası';
      details = 'Kullanıcı adı ve şifreyi kontrol edin';
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
      errorMessage = 'Sunucu bulunamadı';
      details = 'Connection string\'i ve internet bağlantınızı kontrol edin';
    }
    
    return {
      name: 'MongoDB Connection',
      status: 'fail',
      message: errorMessage,
      details,
    };
  }
};

const checkClientEnv = (): CheckResult[] => {
  const clientEnvPath = path.join(__dirname, '../../../client/.env.local');
  const results: CheckResult[] = [];
  
  // Dosya kontrolü
  results.push(checkEnvFile(clientEnvPath, false));
  
  if (fs.existsSync(clientEnvPath)) {
    // Client .env.local dosyasını oku
    const envContent = fs.readFileSync(clientEnvPath, 'utf-8');
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    // Gerekli değişkenleri kontrol et
    const requiredVars = ['NEXT_PUBLIC_API_URL'];
    const optionalVars = ['NEXT_PUBLIC_BACKEND_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
    
    requiredVars.forEach((varName) => {
      if (envVars[varName]) {
        results.push({
          name: `Client Env: ${varName}`,
          status: 'pass',
          message: 'Tanımlı',
          details: envVars[varName],
        });
      } else {
        results.push({
          name: `Client Env: ${varName}`,
          status: 'fail',
          message: 'Tanımlı değil (ZORUNLU)',
        });
      }
    });
    
    optionalVars.forEach((varName) => {
      if (envVars[varName]) {
        results.push({
          name: `Client Env: ${varName}`,
          status: 'pass',
          message: 'Tanımlı',
          details: varName.includes('SECRET') ? '***' : envVars[varName],
        });
      }
    });
  }
  
  return results;
};

const main = async () => {
  log.header('\n═══════════════════════════════════════════════════════════');
  log.header('🔍 MongoDB ve Environment Variables Kontrolü');
  log.header('═══════════════════════════════════════════════════════════\n');
  
  // Server .env dosyası kontrolü
  log.info('📁 Server .env Dosyası Kontrolü');
  const serverEnvPath = path.join(__dirname, '../../.env');
  const serverEnvCheck = checkEnvFile(serverEnvPath, true);
  results.push(serverEnvCheck);
  
  if (serverEnvCheck.status === 'pass') {
    log.success(`server/.env dosyası mevcut`);
  } else {
    log.error(`server/.env dosyası bulunamadı!`);
  }
  
  // Server environment variables kontrolü
  log.info('\n⚙️  Server Environment Variables Kontrolü');
  const requiredServerVars = [
    'MONGO_URI',
    'PORT',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];
  
  const optionalServerVars = [
    'CLIENT_URL',
    'CORS_ORIGIN',
    'NODE_ENV',
    'REDIS_URL',
  ];
  
  requiredServerVars.forEach((varName) => {
    const check = checkEnvVariable(varName, true);
    results.push(check);
    if (check.status === 'pass') {
      log.success(`${varName}: ${check.details || 'Tanımlı'}`);
    } else {
      log.error(`${varName}: ${check.message}`);
    }
  });
  
  optionalServerVars.forEach((varName) => {
    const check = checkEnvVariable(varName, false);
    if (check.status === 'pass') {
      results.push(check);
      log.info(`${varName}: ${check.details || 'Tanımlı'}`);
    }
  });
  
  // Client .env.local kontrolü
  log.info('\n📁 Client .env.local Dosyası Kontrolü');
  const clientResults = checkClientEnv();
  results.push(...clientResults);
  
  clientResults.forEach((result) => {
    if (result.status === 'pass') {
      log.success(`${result.name}: ${result.message}`);
    } else if (result.status === 'fail') {
      log.error(`${result.name}: ${result.message}`);
    } else {
      log.warning(`${result.name}: ${result.message}`);
    }
  });
  
  // MongoDB bağlantı testi
  log.info('\n🔌 MongoDB Bağlantı Testi');
  const mongoCheck = await checkMongoConnection();
  results.push(mongoCheck);
  
  if (mongoCheck.status === 'pass') {
    log.success(`MongoDB: ${mongoCheck.message}`);
    if (mongoCheck.details) {
      log.info(`  ${mongoCheck.details}`);
    }
  } else {
    log.error(`MongoDB: ${mongoCheck.message}`);
    if (mongoCheck.details) {
      log.warning(`  ${mongoCheck.details}`);
    }
  }
  
  // Özet
  log.header('\n═══════════════════════════════════════════════════════════');
  log.header('📊 Özet');
  log.header('═══════════════════════════════════════════════════════════\n');
  
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const warnings = results.filter((r) => r.status === 'warning').length;
  
  log.info(`✅ Başarılı: ${passed}`);
  log.error(`❌ Başarısız: ${failed}`);
  log.warning(`⚠️  Uyarı: ${warnings}`);
  
  if (failed > 0) {
    log.error('\n❌ Bazı kontroller başarısız oldu. Lütfen yukarıdaki hataları düzeltin.');
    process.exit(1);
  } else if (warnings > 0) {
    log.warning('\n⚠️  Bazı opsiyonel ayarlar eksik. Test için gerekli olmayabilir.');
    process.exit(0);
  } else {
    log.success('\n✅ Tüm kontroller başarılı! Test için hazırsınız.');
    process.exit(0);
  }
};

main().catch((error) => {
  log.error(`Kontrol sırasında hata oluştu: ${error.message}`);
  process.exit(1);
});
