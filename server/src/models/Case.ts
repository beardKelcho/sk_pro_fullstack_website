import mongoose, { Document, Schema } from 'mongoose';

export interface ICaseItem {
    equipment: mongoose.Types.ObjectId;
    quantity: number;
}

export interface ICase extends Document {
    name: string;
    description?: string;
    project?: mongoose.Types.ObjectId;
    items: ICaseItem[];
    status: 'PENDING' | 'PROCESSED';
    qrCode: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CaseSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
        },
        items: [
            {
                equipment: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Equipment',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
            },
        ],
        status: {
            type: String,
            enum: ['PENDING', 'PROCESSED'],
            default: 'PENDING',
        },
        qrCode: {
            type: String,
            unique: true,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
CaseSchema.index({ status: 1 });
CaseSchema.index({ project: 1 });
CaseSchema.index({ qrCode: 1 }, { unique: true });

export default mongoose.model<ICase>('Case', CaseSchema);
