import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'FIRMA_SAHIBI' | 'PROJE_YONETICISI' | 'DEPO_SORUMLUSU' | 'TEKNISYEN';
  permissions?: string[]; // Özel yetkiler (rol yetkilerine ek olarak veya rol yetkilerini override eder)
  isActive: boolean;
  phone?: string;
  address?: string;
  // 2FA (İki Faktörlü Kimlik Doğrulama) - Opsiyonel
  is2FAEnabled: boolean;
  twoFactorSecret?: string; // TOTP secret (sadece setup sırasında gösterilir, sonra hash'lenir)
  twoFactorSecretHash?: string; // Hash'lenmiş secret
  backupCodes?: string[]; // Backup kodlar (hash'lenmiş)
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'İsim gereklidir'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email gereklidir'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Lütfen geçerli bir email adresi giriniz'],
    },
    password: {
      type: String,
      required: [true, 'Şifre gereklidir'],
      minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
    },
    role: {
      type: String,
      enum: ['ADMIN', 'FIRMA_SAHIBI', 'PROJE_YONETICISI', 'DEPO_SORUMLUSU', 'TEKNISYEN'],
      default: 'TEKNISYEN',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    // 2FA (İki Faktörlü Kimlik Doğrulama) - Opsiyonel
    is2FAEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false, // Varsayılan olarak query'lerde döndürülmez
    },
    twoFactorSecretHash: {
      type: String,
      select: false,
    },
    backupCodes: [{
      type: String,
      select: false,
    }],
  },
  {
    timestamps: true,
  }
);

// Şifre hashleme middleware'i
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Şifre karşılaştırma methodu
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Performance indexes
// Email zaten unique index'e sahip (unique: true)
// Role ve isActive ile filtreleme için
UserSchema.index({ role: 1, isActive: 1 });
// Arama için text index (name, email)
UserSchema.index({ name: 'text', email: 'text' });

export default mongoose.model<IUser>('User', UserSchema); 