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

// Proje oluşturulduğunda ekipmanları 'IN_USE' olarak işaretleme
ProjectSchema.post('save', async function () {
  const doc = this as unknown as IProject;
  if (doc.status === 'ACTIVE' && doc.equipment && doc.equipment.length > 0) {
    const Equipment = mongoose.model('Equipment');
    // Sadece boşta olanları bu projeye rezerve et
    await Equipment.updateMany(
      {
        _id: { $in: doc.equipment },
        status: 'AVAILABLE',
        $or: [{ currentProject: { $exists: false } }, { currentProject: null }],
      },
      { $set: { status: 'IN_USE', currentProject: (doc as any)._id } }
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
        { _id: { $in: project.equipment }, currentProject: project._id },
        { $set: { status: 'AVAILABLE' }, $unset: { currentProject: 1 } }
      );
    }
  }
  
  next();
});

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