import mongoose, { Schema, Document } from 'mongoose';

export interface IVersionHistory extends Document {
  resource: 'Equipment' | 'Project' | 'Task' | 'Client' | 'Maintenance';
  resourceId: mongoose.Types.ObjectId;
  version: number;
  data: any; // Tam veri snapshot'ı
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  changedBy: mongoose.Types.ObjectId;
  changedAt: Date;
  comment?: string;
  isRolledBack: boolean;
  createdAt: Date;
}

const VersionHistorySchema = new Schema<IVersionHistory>(
  {
    resource: {
      type: String,
      enum: ['Equipment', 'Project', 'Task', 'Client', 'Maintenance'],
      required: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    changes: [{
      field: {
        type: String,
        required: true,
      },
      oldValue: Schema.Types.Mixed,
      newValue: Schema.Types.Mixed,
    }],
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    comment: {
      type: String,
      trim: true,
    },
    isRolledBack: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
VersionHistorySchema.index({ resource: 1, resourceId: 1, version: -1 });
VersionHistorySchema.index({ changedBy: 1, changedAt: -1 });

export const VersionHistory = mongoose.model<IVersionHistory>('VersionHistory', VersionHistorySchema);

