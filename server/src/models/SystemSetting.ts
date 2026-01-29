import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSetting extends Document {
    key: string;
    value: any; // Can be boolean, string, number, object, array
    description?: string;
    updatedAt: Date;
    updatedBy?: mongoose.Types.ObjectId;
}

const SystemSettingSchema: Schema = new Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        value: {
            type: Schema.Types.Mixed,
            required: true,
        },
        description: {
            type: String,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Index for fast key lookup
SystemSettingSchema.index({ key: 1 });

export const SystemSetting = mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);
