import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  project?: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date;
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Görev başlığı gereklidir'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Atanan kişi gereklidir'],
    },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'TODO',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    dueDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Görev tamamlandığında completedDate'i ayarla
TaskSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'COMPLETED' && !this.completedDate) {
    this.completedDate = new Date();
  }
  if (this.isModified('status') && this.status !== 'COMPLETED') {
    this.completedDate = undefined;
  }
  next();
});

// Performance indexes
// Assigned user ve status ile filtreleme için
TaskSchema.index({ assignedTo: 1, status: 1 });
// Project ile filtreleme için
TaskSchema.index({ project: 1, status: 1 });
// Due date ile sıralama için
TaskSchema.index({ dueDate: 1, status: 1 });
// Priority ve status ile filtreleme için
TaskSchema.index({ priority: 1, status: 1 });
// Arama için text index (title, description)
TaskSchema.index({ title: 'text', description: 'text' });
// Completed date ile sıralama için
TaskSchema.index({ completedDate: -1 });

export default mongoose.model<ITask>('Task', TaskSchema);

