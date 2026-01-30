import mongoose, { Schema, Document } from 'mongoose';

// Public-facing project showcase for website
// Separate from internal Project management system
export interface IShowcaseProject extends Document {
    title: string;
    category: string;
    description?: string;
    coverUrl?: string;
    videoUrl?: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ShowcaseProjectSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Proje başlığı gereklidir'],
            trim: true,
        },
        category: {
            type: String,
            default: 'Genel',
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        coverUrl: {
            type: String,
            trim: true,
        },
        videoUrl: {
            type: String,
            trim: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
ShowcaseProjectSchema.index({ order: 1, isActive: 1 });

export default mongoose.model<IShowcaseProject>('ShowcaseProject', ShowcaseProjectSchema);
