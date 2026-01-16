import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
// import sanitizeHtml from 'sanitize-html'; // Şimdilik kullanılmıyor
import { FilterXSS } from 'xss';

// XSS koruması için özel filtre
const xssFilter = new FilterXSS({
  whiteList: {
    a: ['href', 'title', 'target'],
    p: [],
    br: [],
    strong: [],
    em: [],
    ul: [],
    ol: [],
    li: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script'],
});

// Genel input sanitizasyonu
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Request body'deki tüm string değerleri sanitize et
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xssFilter.process(req.body[key] as string);
      }
    });
  }

  // Query parametrelerini sanitize et
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xssFilter.process(req.query[key] as string);
      }
    });
  }

  next();
};

// Kullanıcı girişi validasyonu
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('E-posta veya telefon gereklidir')
    .bail()
    .custom((value) => {
      const v = String(value || '').trim();
      const isEmail = /^\S+@\S+\.\S+$/.test(v);
      const normalizedPhone = v.replace(/[^\d+]/g, '');
      const isPhone = /^\+?[0-9]{10,15}$/.test(normalizedPhone);
      return isEmail || isPhone;
    })
    .withMessage('Geçerli bir e-posta veya telefon giriniz')
    .bail()
    .customSanitizer((value) => {
      const v = String(value || '').trim();
      if (v.includes('@')) return v.toLowerCase();
      return v.replace(/[^\d+]/g, '');
    }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Kullanıcı kaydı validasyonu
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır')
    .matches(/\d/)
    .withMessage('Şifre en az bir rakam içermelidir')
    .matches(/[a-z]/)
    .withMessage('Şifre en az bir küçük harf içermelidir')
    .matches(/[A-Z]/)
    .withMessage('Şifre en az bir büyük harf içermelidir'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('İsim en az 2 karakter olmalıdır')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage('İsim sadece harf içermelidir'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Ekipman ekleme/düzenleme validasyonu
export const validateEquipment = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Ekipman adı en az 2 karakter olmalıdır'),
  body('type')
    .isIn(['VIDEO_SWITCHER', 'MEDIA_SERVER', 'MONITOR', 'CABLE', 'AUDIO_EQUIPMENT', 'OTHER'])
    .withMessage('Geçersiz ekipman tipi'),
  body('status')
    .isIn(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DAMAGED'])
    .withMessage('Geçersiz ekipman durumu'),
  body('serialNumber')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Seri numarası en az 3 karakter olmalıdır'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Proje ekleme/düzenleme validasyonu
export const validateProject = [
  body('name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3 })
    .withMessage('Proje adı en az 3 karakter olmalıdır'),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value) => {
      if (value && value.length > 0 && value.length < 10) {
        throw new Error('Proje açıklaması en az 10 karakter olmalıdır');
      }
      return true;
    }),
  body('startDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Geçerli bir başlangıç tarihi giriniz'),
  body('endDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Geçerli bir bitiş tarihi giriniz'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Müşteri ekleme/düzenleme validasyonu
export const validateClient = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Müşteri adı en az 2 karakter olmalıdır'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Kullanıcı ekleme/düzenleme validasyonu
export const validateUser = [
  body('name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('İsim en az 2 karakter olmalıdır'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz'),
  body('role')
    .optional({ checkFalsy: true })
    .isIn(['ADMIN', 'FIRMA_SAHIBI', 'PROJE_YONETICISI', 'DEPO_SORUMLUSU', 'TEKNISYEN'])
    .withMessage('Geçersiz kullanıcı rolü'),
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array() 
      });
    }
    next();
  }
];

// Kullanıcı oluşturma validasyonu (password zorunlu)
export const validateCreateUser = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('İsim en az 2 karakter olmalıdır'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'FIRMA_SAHIBI', 'PROJE_YONETICISI', 'DEPO_SORUMLUSU', 'TEKNISYEN'])
    .withMessage('Geçersiz kullanıcı rolü'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array() 
      });
    }
    next();
  }
]; 