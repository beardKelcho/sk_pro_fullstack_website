import mongoose, { Document, Schema } from 'mongoose';
import logger from '../utils/logger';

export interface IEquipment extends Omit<Document, 'model'> {
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  purchaseDate: Date;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DAMAGED';
  location: string;
  notes: string;
  responsibleUser: mongoose.Types.ObjectId;
  qrCodeId?: mongoose.Types.ObjectId;
  qrCodeValue?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Ekipman adı gereklidir'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Ekipman tipi gereklidir'],
      enum: ['VIDEO_SWITCHER', 'MEDIA_SERVER', 'MONITOR', 'CABLE', 'AUDIO_EQUIPMENT', 'OTHER'],
    },
    model: {
      type: String,
      trim: true,
    },
    serialNumber: {
      type: String,
      trim: true,
    },
    purchaseDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DAMAGED'],
      default: 'AVAILABLE',
    },
    location: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
    },
    responsibleUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    qrCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QRCode',
      index: true,
    },
    qrCodeValue: {
      type: String,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate: Equipment -> Maintenance (Maintenance.equipment)
EquipmentSchema.virtual('maintenances', {
  ref: 'Maintenance',
  localField: '_id',
  foreignField: 'equipment',
  justOne: false,
});

// Ekipman statüsü değiştiğinde log oluşturma
EquipmentSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    logger.debug(`Ekipman statüsü değişti: ${this._id}, Yeni Statü: ${this.get('status')}`);
    // Burada bir log kaydı oluşturulabilir
  }
  next();
});

// Performance indexes
// Status ve type ile filtreleme için
EquipmentSchema.index({ status: 1, type: 1 });
// Arama için text index (name, model, serialNumber)
EquipmentSchema.index({ name: 'text', model: 'text', serialNumber: 'text' });
// Status ile sıralama için
EquipmentSchema.index({ status: 1, createdAt: -1 });
// Responsible user ile filtreleme için
EquipmentSchema.index({ responsibleUser: 1 });
// Location ile filtreleme için
EquipmentSchema.index({ location: 1 });

export default mongoose.model<IEquipment>('Equipment', EquipmentSchema); 