import mongoose, { Document, Schema } from 'mongoose';

export interface IClient extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Müşteri adı gereklidir'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Lütfen geçerli bir email adresi giriniz'],
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Müşterinin daha önce çalıştığı proje sayısını döndüren metot
ClientSchema.virtual('projectCount', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'client',
  count: true,
});

// Müşterinin aktif projelerini döndüren metot
ClientSchema.virtual('activeProjects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'client',
  match: { status: 'ACTIVE' },
});

// toJSON virtuals ekleme
ClientSchema.set('toJSON', { virtuals: true });
ClientSchema.set('toObject', { virtuals: true });

// Performance indexes
// Arama için text index (name, email, phone)
ClientSchema.index({ name: 'text', email: 'text', phone: 'text' });
// Name ile sıralama için
ClientSchema.index({ name: 1 });

export default mongoose.model<IClient>('Client', ClientSchema); 