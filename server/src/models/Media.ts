import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia extends Document {
    url: string;
    type: 'video' | 'image';
    name: string;
    publicId?: string; // Cloudinary Public ID
    createdAt: Date;
}

const MediaSchema: Schema = new Schema({
    url: { type: String, required: true },
    type: { type: String, enum: ['video', 'image'], required: true },
    name: { type: String, required: true },
    publicId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IMedia>('Media', MediaSchema);
