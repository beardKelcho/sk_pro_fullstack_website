import mongoose, { Document, Schema } from 'mongoose';

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
  },
  {
    timestamps: true,
  }
);

// Ekipman statüsü değiştiğinde log oluşturma
EquipmentSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    console.log(`Ekipman statüsü değişti: ${this._id}, Yeni Statü: ${this.get('status')}`);
    // Burada bir log kaydı oluşturulabilir
  }
  next();
});

export default mongoose.model<IEquipment>('Equipment', EquipmentSchema); 