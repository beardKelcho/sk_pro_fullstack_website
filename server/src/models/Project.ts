import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
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
      enum: ['PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'PLANNING',
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

// Proje oluşturulduğunda ekipmanları 'IN_USE' olarak işaretleme
ProjectSchema.post('save', async function () {
  const doc = this as unknown as IProject;
  if (doc.status === 'ACTIVE' && doc.equipment && doc.equipment.length > 0) {
    const Equipment = mongoose.model('Equipment');
    await Equipment.updateMany(
      { _id: { $in: doc.equipment } },
      { $set: { status: 'IN_USE' } }
    );
  }
});

// Proje tamamlandığında ekipmanları 'AVAILABLE' olarak işaretleme
ProjectSchema.pre('findOneAndUpdate', async function (next) {
  const update: any = this.getUpdate();
  
  if (update && (update.status === 'COMPLETED' || update.status === 'CANCELLED')) {
    const projectId = this.getQuery()._id;
    const Project = mongoose.model<IProject>('Project');
    const project = await Project.findById(projectId);
    
    if (project && project.equipment && project.equipment.length > 0) {
      const Equipment = mongoose.model('Equipment');
      await Equipment.updateMany(
        { _id: { $in: project.equipment } },
        { $set: { status: 'AVAILABLE' } }
      );
    }
  }
  
  next();
});

export default mongoose.model<IProject>('Project', ProjectSchema); 