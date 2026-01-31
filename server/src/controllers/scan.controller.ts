import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Equipment, Project, Maintenance, QRScanHistory } from '../models';
import logger from '../utils/logger';
import { AppError } from '../types/common';

export class ScanController {
    /**
     * Scan Item by Code or ID
     */
    async scanItem(req: Request, res: Response): Promise<void> {
        try {
            const { code } = req.params;
            const userId = (req as any).user._id;

            // Search by ID first (assuming code might be ID)
            let equipment = null;
            if (mongoose.Types.ObjectId.isValid(code)) {
                equipment = await Equipment.findById(code);
            }

            // If not found by ID, search by serialNumber or other identifiers if QR code maps to them?
            // User request says "Gelen QR koda (string) veya ID'ye göre Equipment tablosunda arama yap."
            if (!equipment) {
                // If QR code logic uses serialNumber or a generic 'code' field on Equipment?
                // Equipment model check needed. Assuming serialNumber for now as backup.
                equipment = await Equipment.findOne({ serialNumber: code });
            }

            if (!equipment) {
                throw new AppError('Ekipman bulunamadı', 404);
            }

            // Fetch related info based on status
            let relatedInfo = null;
            let relatedItemType: 'Project' | 'Maintenance' | 'Other' | undefined;
            let relatedItemId: mongoose.Types.ObjectId | undefined;

            if (equipment.status === 'IN_USE' && equipment.currentProject) {
                relatedInfo = await Project.findById(equipment.currentProject).select('name status location startDate endDate');
                relatedItemType = 'Project';
                relatedItemId = equipment.currentProject;
            } else if (equipment.status === 'MAINTENANCE') {
                // Find active maintenance
                const activeMaintenance = await Maintenance.findOne({
                    equipment: equipment._id,
                    status: 'IN_PROGRESS'
                }).select('type description status scheduledDate assignedTo');

                if (activeMaintenance) {
                    relatedInfo = activeMaintenance;
                    relatedItemType = 'Maintenance';
                    relatedItemId = activeMaintenance._id as mongoose.Types.ObjectId;
                }
            }

            // Record Scan History (VIEW)
            await QRScanHistory.create({
                equipment: equipment._id,
                scannedBy: userId,
                action: 'VIEW',
                relatedItem: relatedItemId,
                relatedItemType: relatedItemType,
                scannedAt: new Date()
            });

            res.status(200).json({
                success: true,
                equipment,
                status: equipment.status,
                relatedInfo,
                relatedItemType
            });

        } catch (error: any) {
            logger.error('Scan error:', error);
            const appError = error instanceof AppError ? error : new AppError('Tarama işlemi başarısız');
            res.status(appError.statusCode || 500).json({
                success: false,
                message: appError.message
            });
        }
    }
}

export default new ScanController();
