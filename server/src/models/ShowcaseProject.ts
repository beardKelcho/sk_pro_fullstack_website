import mongoose, { Schema, Document } from 'mongoose';

// Public-facing project showcase for website
// Separate from internal Project management system
export interface IShowcaseProject extends Document {
    type: 'photo' | 'video';
    title: string;
    category: string;
    description?: string;
    coverUrl?: string;
    imageUrls?: string[];  // For photo galleries (multiple images)
    videoUrl?: string;     // For video productions
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ShowcaseProjectSchema: Schema = new Schema(
    {
        type: {
            type: String,
            enum: ['photo', 'video'],
            default: 'photo',
            required: [true, 'Proje tipi gereklidir'],
        },
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
        imageUrls: [{
            type: String,
            trim: true,
        }],
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
