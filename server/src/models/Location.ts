import mongoose, { Schema, Document } from 'mongoose';

export interface ILocation extends Document {
    name: string;
    type: 'WAREHOUSE' | 'VEHICLE' | 'EVENT_SITE' | 'VIRTUAL';
    address?: string;
    createdAt: Date;
    updatedAt: Date;
}

const LocationSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Lokasyon adı gereklidir'],
            trim: true,
        },
        type: {
            type: String,
            enum: ['WAREHOUSE', 'VEHICLE', 'EVENT_SITE', 'VIRTUAL'],
            default: 'WAREHOUSE',
            required: true,
        },
        address: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

export default mongoose.model<ILocation>('Location', LocationSchema);
