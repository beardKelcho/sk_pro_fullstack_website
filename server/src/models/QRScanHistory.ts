import mongoose, { Document, Schema } from 'mongoose';

export interface IQRScanHistory extends Document {
  qrCode: mongoose.Types.ObjectId; // QR kod referansı
  scannedBy: mongoose.Types.ObjectId; // Tarayan kullanıcı
  action: 'VIEW' | 'CHECK_IN' | 'CHECK_OUT' | 'MAINTENANCE' | 'OTHER'; // Yapılan işlem
  relatedItem?: mongoose.Types.ObjectId; // İşlemle ilgili kayıt (Project, Maintenance vb.)
  relatedItemType?: 'Project' | 'Maintenance' | 'Other'; // İşlem tipi
  notes?: string; // Notlar
  location?: string; // Tarama konumu (opsiyonel)
  scannedAt: Date; // Tarama zamanı
}

const QRScanHistorySchema: Schema = new Schema(
  {
    qrCode: {
      type: Schema.Types.ObjectId,
      ref: 'QRCode',
      required: [true, 'QR kod referansı gereklidir'],
      index: true,
    },
    scannedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tarayan kullanıcı gereklidir'],
    },
    action: {
      type: String,
      enum: ['VIEW', 'CHECK_IN', 'CHECK_OUT', 'MAINTENANCE', 'OTHER'],
      required: [true, 'İşlem tipi gereklidir'],
    },
    relatedItem: {
      type: Schema.Types.ObjectId,
    },
    relatedItemType: {
      type: String,
      enum: ['Project', 'Maintenance', 'Other'],
    },
    notes: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    scannedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index'ler
QRScanHistorySchema.index({ qrCode: 1, scannedAt: -1 });
QRScanHistorySchema.index({ scannedBy: 1, scannedAt: -1 });

const QRScanHistory = mongoose.model<IQRScanHistory>('QRScanHistory', QRScanHistorySchema);

export default QRScanHistory;

