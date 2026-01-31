import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  status: 'PLANNING' | 'PENDING_APPROVAL' | 'APPROVED' | 'ON_HOLD' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  location: string;
  client: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId[];
  equipment: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Proje adı gereklidir'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Başlangıç tarihi gereklidir'],
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      // PLANNING legacy (geriye uyumluluk): UI'da kullanılmıyor; PENDING_APPROVAL ile aynı anlamda ele alınır
      enum: ['PLANNING', 'PENDING_APPROVAL', 'APPROVED', 'ON_HOLD', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING_APPROVAL',
    },
    location: {
      type: String,
      trim: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Müşteri gereklidir'],
    },
    team: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    equipment: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
    }],
  },
  {
    timestamps: true,
  }
);

// Hooks removed and logic moved to controller


// Performance indexes
// Status ile filtreleme ve sıralama için
ProjectSchema.index({ status: 1, createdAt: -1 });
// Client ile filtreleme için
ProjectSchema.index({ client: 1, status: 1 });
// Tarih aralığı sorguları için
ProjectSchema.index({ startDate: 1, endDate: 1 });
// Arama için text index (name, description, location)
ProjectSchema.index({ name: 'text', description: 'text', location: 'text' });
// Team member ile filtreleme için
ProjectSchema.index({ team: 1 });
// Equipment ile filtreleme için
ProjectSchema.index({ equipment: 1 });

export default mongoose.model<IProject>('Project', ProjectSchema); 