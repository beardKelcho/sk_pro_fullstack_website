import mongoose, { Document, Schema } from 'mongoose';

export interface IStat {
    label: string;
    value: string;
}

export interface IAbout extends Document {
    title: string;
    description: string;
    imageUrl: string;
    stats: IStat[];
    createdAt: Date;
    updatedAt: Date;
}

const StatSchema = new Schema<IStat>({
    label: {
        type: String,
        required: true,
        trim: true
    },
    value: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });

const AboutSchema = new Schema<IAbout>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true
    },
    stats: {
        type: [StatSchema],
        default: []
    }
}, {
    timestamps: true
});

export default mongoose.model<IAbout>('About', AboutSchema);
