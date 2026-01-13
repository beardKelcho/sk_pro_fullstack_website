import mongoose, { Document, Schema } from 'mongoose';

export interface IWidget extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'STAT_CARD' | 'PIE_CHART' | 'DONUT_CHART' | 'LINE_CHART' | 'BAR_CHART' | 'TABLE' | 'LIST' | 'CUSTOM';
  title: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  settings: {
    [key: string]: any;
  };
  isVisible: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const WidgetSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Kullanıcı ID gereklidir'],
      index: true,
    },
    type: {
      type: String,
      enum: ['STAT_CARD', 'PIE_CHART', 'DONUT_CHART', 'LINE_CHART', 'BAR_CHART', 'TABLE', 'LIST', 'CUSTOM'],
      required: [true, 'Widget tipi gereklidir'],
    },
    title: {
      type: String,
      required: [true, 'Widget başlığı gereklidir'],
      trim: true,
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      w: { type: Number, default: 4, min: 1, max: 12 },
      h: { type: Number, default: 4, min: 1, max: 12 },
    },
    settings: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
WidgetSchema.index({ userId: 1, order: 1 });
WidgetSchema.index({ userId: 1, type: 1 });
WidgetSchema.index({ userId: 1, isVisible: 1 });

export default mongoose.model<IWidget>('Widget', WidgetSchema);

