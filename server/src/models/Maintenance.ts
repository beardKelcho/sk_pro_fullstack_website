import mongoose, { Document, Schema } from 'mongoose';

export interface IMaintenance extends Document {
  equipment: mongoose.Types.ObjectId;
  type: 'ROUTINE' | 'REPAIR' | 'INSPECTION' | 'UPGRADE';
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTo: mongoose.Types.ObjectId;
  cost?: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceSchema: Schema = new Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Ekipman gereklidir'],
    },
    type: {
      type: String,
      enum: ['ROUTINE', 'REPAIR', 'INSPECTION', 'UPGRADE'],
      required: [true, 'Bakım tipi gereklidir'],
    },
    description: {
      type: String,
      required: [true, 'Açıklama gereklidir'],
      trim: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Planlanan tarih gereklidir'],
    },
    completedDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Atanan kişi gereklidir'],
    },
    cost: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hooks removed and logic moved to controller

// Performance indexes
// Equipment ve status ile filtreleme için
MaintenanceSchema.index({ equipment: 1, status: 1 });
// Scheduled date ile sıralama için (yaklaşan bakımlar)
MaintenanceSchema.index({ scheduledDate: 1, status: 1 });
// Assigned user ile filtreleme için
MaintenanceSchema.index({ assignedTo: 1, status: 1 });
// Type ve status ile filtreleme için
MaintenanceSchema.index({ type: 1, status: 1 });
// Arama için text index (description)
MaintenanceSchema.index({ description: 'text' });
// Completed date ile sıralama için
MaintenanceSchema.index({ completedDate: -1 });

export default mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema);

