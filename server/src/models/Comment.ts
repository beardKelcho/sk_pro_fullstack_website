import mongoose, { Document, Schema } from 'mongoose';

export type CommentResourceType = 'PROJECT' | 'TASK';

export interface IComment extends Document {
  resourceType: CommentResourceType;
  resourceId: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  message: string;
  mentions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    resourceType: {
      type: String,
      enum: ['PROJECT', 'TASK'],
      required: true,
      index: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

CommentSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
CommentSchema.index({ author: 1, createdAt: -1 });

export default mongoose.model<IComment>('Comment', CommentSchema);

