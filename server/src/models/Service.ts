import mongoose, { Schema, Document } from 'mongoose';

// Service model for Video Engineering services and equipment
// Focus: LED Display Management, Watchout Systems, Analog Way, Signal Processing
export interface IService extends Document {
    title: string;
    category: string;
    description?: string;
    icon: string;  // Lucide icon name (e.g., 'Monitor', 'Server', 'Cpu', 'Layers', 'Activity')
    details: string[];  // Technical specifications/features list
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ServiceSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Hizmet başlığı gereklidir'],
            trim: true,
        },
        category: {
            type: String,
            default: 'Video Processing',
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        icon: {
            type: String,
            default: 'Monitor',
            trim: true,
        },
        details: [{
            type: String,
            trim: true,
        }],
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
ServiceSchema.index({ order: 1, isActive: 1 });

export default mongoose.model<IService>('Service', ServiceSchema);
