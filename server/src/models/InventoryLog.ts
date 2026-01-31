import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryLog extends Document {
    equipment: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    action: 'CHECK_IN' | 'CHECK_OUT' | 'MAINTENANCE_START' | 'MAINTENANCE_END' | 'MOVE' | 'COUNT_UPDATE';
    quantityChanged: number;
    fromLocation?: mongoose.Types.ObjectId;
    toLocation?: mongoose.Types.ObjectId;
    project?: mongoose.Types.ObjectId;
    notes?: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

const InventoryLogSchema: Schema = new Schema(
    {
        equipment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Equipment',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            enum: ['CHECK_IN', 'CHECK_OUT', 'MAINTENANCE_START', 'MAINTENANCE_END', 'MOVE', 'COUNT_UPDATE'],
            required: true,
        },
        quantityChanged: {
            type: Number,
            default: 0,
        },
        fromLocation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
        },
        toLocation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
        },
        notes: {
            type: String,
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Performans için indeksler
InventoryLogSchema.index({ equipment: 1, date: -1 });
InventoryLogSchema.index({ project: 1 });
InventoryLogSchema.index({ action: 1 });

export default mongoose.model<IInventoryLog>('InventoryLog', InventoryLogSchema);
