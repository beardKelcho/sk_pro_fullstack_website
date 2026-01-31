import mongoose, { Schema, Document } from 'mongoose';

export interface IEquipment extends Document {
  name: string;
  category: mongoose.Types.ObjectId;
  location: mongoose.Types.ObjectId;
  trackingType: 'SERIALIZED' | 'BULK';
  serialNumber?: string;
  quantity: number;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED' | 'MISSING';
  brand?: string;
  model?: string;
  purchaseDate?: Date;
  criticalStockLevel: number;
  qrCode?: string;
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
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Kategori gereklidir'],
      index: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Lokasyon gereklidir'],
      index: true,
    },
    trackingType: {
      type: String,
      enum: ['SERIALIZED', 'BULK'],
      required: true,
      default: 'BULK',
    },
    serialNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Sadece dolu olanlar unique olsun
    },
    quantity: {
      type: Number,
      default: 1,
      min: 0,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'MISSING'],
      default: 'AVAILABLE',
      index: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    purchaseDate: {
      type: Date,
    },
    criticalStockLevel: {
      type: Number,
      default: 0,
    },
    qrCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
EquipmentSchema.virtual('history', {
  ref: 'InventoryLog',
  localField: '_id',
  foreignField: 'equipment',
});

// Arama İndeksleri
EquipmentSchema.index({ name: 'text', brand: 'text', model: 'text', serialNumber: 'text', qrCode: 'text' });
EquipmentSchema.index({ trackingType: 1 });

export default mongoose.model<IEquipment>('Equipment', EquipmentSchema);