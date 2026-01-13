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

// Bakım başladığında ekipman statüsünü 'MAINTENANCE' yap
MaintenanceSchema.pre('save', async function (next) {
  if (this.isModified('status') && this.status === 'IN_PROGRESS') {
    const Equipment = mongoose.model('Equipment');
    await Equipment.findByIdAndUpdate(this.equipment, { status: 'MAINTENANCE' });
  }
  next();
});

// Bakım tamamlandığında ekipman statüsünü 'AVAILABLE' yap
MaintenanceSchema.pre('findOneAndUpdate', async function (next) {
  const update: any = this.getUpdate();
  
  if (update && update.status === 'COMPLETED') {
    const maintenanceId = this.getQuery()._id;
    const Maintenance = mongoose.model<IMaintenance>('Maintenance');
    const maintenance = await Maintenance.findById(maintenanceId);
    
    if (maintenance) {
      const Equipment = mongoose.model('Equipment');
      await Equipment.findByIdAndUpdate(maintenance.equipment, { status: 'AVAILABLE' });
    }
  }
  
  next();
});

export default mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema);

