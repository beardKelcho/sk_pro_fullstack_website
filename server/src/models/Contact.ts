import mongoose, { Document, Schema } from 'mongoose';

export interface ISocialLinks {
    instagram?: string;
    linkedin?: string;
    youtube?: string;
}

export interface IContact extends Document {
    address: string;
    phone: string;
    email: string;
    mapUrl: string;
    socialLinks: ISocialLinks;
    createdAt: Date;
    updatedAt: Date;
}

const SocialLinksSchema = new Schema<ISocialLinks>({
    instagram: {
        type: String,
        trim: true,
        default: ''
    },
    linkedin: {
        type: String,
        trim: true,
        default: ''
    },
    youtube: {
        type: String,
        trim: true,
        default: ''
    }
}, { _id: false });

const ContactSchema = new Schema<IContact>({
    address: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    mapUrl: {
        type: String,
        required: true,
        trim: true
    },
    socialLinks: {
        type: SocialLinksSchema,
        default: {}
    }
}, {
    timestamps: true
});

export default mongoose.model<IContact>('Contact', ContactSchema);
