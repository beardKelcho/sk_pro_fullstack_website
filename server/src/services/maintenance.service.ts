import mongoose, { ClientSession } from 'mongoose';
import { Maintenance, Equipment, InventoryLog } from '../models';
import { IMaintenance } from '../models/Maintenance';
import { AppError } from '../types/common';

interface CreateMaintenanceData {
    equipment: string;
    type: string;
    description: string;
    scheduledDate: Date;
    status?: string;
    assignedTo: string;
    cost?: number;
    notes?: string;
    userId: string; // For logging
}

interface UpdateMaintenanceData {
    equipment?: string;
    type?: string;
    description?: string;
    scheduledDate?: Date;
    completedDate?: Date;
    status?: string;
    assignedTo?: string;
    cost?: number;
    notes?: string;
    userId: string; // For logging
}

class MaintenanceService {
    /**
     * Create Maintenance Record
     */
    async createMaintenance(data: CreateMaintenanceData, session?: ClientSession): Promise<IMaintenance> {
        // Validation handled by controller or model mostly, but we can add business checks here

        // 1. Create Maintenance
        const [maintenance] = await Maintenance.create([{
            equipment: data.equipment,
            type: data.type,
            description: data.description,
            scheduledDate: data.scheduledDate,
            status: data.status || 'SCHEDULED',
            assignedTo: data.assignedTo,
            cost: data.cost,
            notes: data.notes
        }], { session });

        // 2. If IN_PROGRESS, update equipment and log
        if (data.status === 'IN_PROGRESS') {
            await Equipment.findByIdAndUpdate(
                data.equipment,
                { status: 'MAINTENANCE' },
                { session }
            );

            await InventoryLog.create([{
                equipment: data.equipment,
                user: data.userId,
                action: 'MAINTENANCE_START',
                quantityChanged: 0,
                notes: `Maintenance Started: ${data.type}`,
                date: new Date()
            }], { session });
        }

        return maintenance;
    }

    /**
     * Update Maintenance Record
     */
    async updateMaintenance(id: string, data: UpdateMaintenanceData, session?: ClientSession): Promise<IMaintenance | null> {
        const oldMaintenance = await Maintenance.findById(id).session(session || null);
        if (!oldMaintenance) {
            throw new AppError('Bakım bulunamadı', 404);
        }

        const updateData: any = { ...data };
        delete updateData.userId; // Don't save userId to maintenance doc

        // Complete date logic
        if (data.status === 'COMPLETED' && !data.completedDate) {
            updateData.completedDate = new Date();
        }

        const maintenance = await Maintenance.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true, session }
        );

        if (!maintenance) return null;

        // Status Change Logic
        if (data.status && data.status !== oldMaintenance.status) {
            // Completed
            if (data.status === 'COMPLETED') {
                await Equipment.findByIdAndUpdate(
                    oldMaintenance.equipment,
                    { status: 'AVAILABLE' },
                    { session }
                );

                await InventoryLog.create([{
                    equipment: oldMaintenance.equipment,
                    user: data.userId,
                    action: 'MAINTENANCE_END',
                    quantityChanged: 0,
                    notes: `Maintenance Completed`,
                    date: new Date()
                }], { session });
            }
            // Started (if not already started)
            else if (data.status === 'IN_PROGRESS') {
                await Equipment.findByIdAndUpdate(
                    oldMaintenance.equipment,
                    { status: 'MAINTENANCE' },
                    { session }
                );

                await InventoryLog.create([{
                    equipment: oldMaintenance.equipment,
                    user: data.userId,
                    action: 'MAINTENANCE_START',
                    quantityChanged: 0,
                    notes: `Maintenance Started`,
                    date: new Date()
                }], { session });
            }
        }

        return maintenance;
    }
}

export default new MaintenanceService();
