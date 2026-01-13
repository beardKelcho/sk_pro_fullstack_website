import mongoose, { Document, Schema } from 'mongoose';

export interface IQRCode extends Document {
  code: string; // QR kod içeriği (unique identifier)
  type: 'EQUIPMENT' | 'PROJECT' | 'CUSTOM'; // QR kod tipi
  relatedId: mongoose.Types.ObjectId; // İlişkili kayıt ID (Equipment, Project vb.)
  relatedType: 'Equipment' | 'Project' | 'Other'; // İlişkili model tipi
  title?: string; // QR kod başlığı
  description?: string; // Açıklama
  isActive: boolean; // Aktif mi?
  scanCount: number; // Kaç kez tarandı
  lastScannedAt?: Date; // Son tarama zamanı
  lastScannedBy?: mongoose.Types.ObjectId; // Son tarayan kullanıcı
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId; // Oluşturan kullanıcı
}

const QRCodeSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: [true, 'QR kod gereklidir'],
      unique: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['EQUIPMENT', 'PROJECT', 'CUSTOM'],
      required: [true, 'QR kod tipi gereklidir'],
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      required: [true, 'İlişkili kayıt ID gereklidir'],
      index: true,
    },
    relatedType: {
      type: String,
      enum: ['Equipment', 'Project', 'Other'],
      required: [true, 'İlişkili model tipi gereklidir'],
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    scanCount: {
      type: Number,
      default: 0,
    },
    lastScannedAt: {
      type: Date,
    },
    lastScannedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Oluşturan kullanıcı gereklidir'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: relatedId + relatedType için hızlı arama
QRCodeSchema.index({ relatedId: 1, relatedType: 1 });
QRCodeSchema.index({ code: 1, isActive: 1 });

// QR kod tarama sayısını artır
QRCodeSchema.methods.incrementScan = async function (userId?: mongoose.Types.ObjectId) {
  this.scanCount += 1;
  this.lastScannedAt = new Date();
  if (userId) {
    this.lastScannedBy = userId;
  }
  await this.save();
};

const QRCode = mongoose.model<IQRCode>('QRCode', QRCodeSchema);

export default QRCode;

