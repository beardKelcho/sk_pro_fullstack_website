import mongoose, { Document, Schema } from 'mongoose';

export interface IContactMessage extends Document {
    name: string;
    email: string;
    subject: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>({
    name: {
        type: String,
        required: [true, 'İsim zorunludur'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email zorunludur'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Geçerli bir email adresi giriniz']
    },
    subject: {
        type: String,
        required: [true, 'Konu zorunludur'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Mesaj zorunludur'],
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
