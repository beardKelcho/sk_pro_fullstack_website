import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedSearch extends Document {
  name: string;
  userId: mongoose.Types.ObjectId;
  resource: 'Equipment' | 'Project' | 'Task' | 'Client' | 'Maintenance' | 'All';
  filters: {
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SavedSearchSchema = new Schema<ISavedSearch>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resource: {
      type: String,
      enum: ['Equipment', 'Project', 'Task', 'Client', 'Maintenance', 'All'],
      required: true,
    },
    filters: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index'ler
SavedSearchSchema.index({ userId: 1, resource: 1 });
SavedSearchSchema.index({ userId: 1, createdAt: -1 });

export const SavedSearch = mongoose.model<ISavedSearch>('SavedSearch', SavedSearchSchema);

