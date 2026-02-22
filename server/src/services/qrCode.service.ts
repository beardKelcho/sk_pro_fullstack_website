import { QRCode, QRScanHistory, Equipment, Project } from '../models';
import { AppError } from '../types/common';
import { generateQRCodeContent, generateQRCodeImage, parseQRCodeContent } from '../utils/qrGenerator';


// Types (could be moved to models/QRCode.ts or types/qr.ts)
export interface CreateQRCodeData {
    type: 'EQUIPMENT' | 'PROJECT' | 'CUSTOM';
    relatedId: string;
    relatedType: 'Equipment' | 'Project';
    title?: string;
    description?: string;
    userId: string;
}

export interface ScanQRCodeData {
    qrContent: string;
    action?: string;
    relatedItem?: string;
    relatedItemType?: string;
    notes?: string;
    location?: string;
    userId?: string;
}

class QrCodeService {

    async listQRCodes(page: number = 1, limit: number = 10, type?: string, isActive?: boolean, relatedType?: string) {
        const filters: any = {};
        if (type) filters.type = type;
        if (isActive !== undefined) filters.isActive = isActive;
        if (relatedType) filters.relatedType = relatedType;

        const skip = (page - 1) * limit;

        const [qrCodes, total] = await Promise.all([
            QRCode.find(filters)
                .select('-__v')
                .populate('createdBy', 'name email')
                .populate('lastScannedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            QRCode.countDocuments(filters)
        ]);

        return {
            qrCodes,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    async createQRCode(data: CreateQRCodeData) {
        if (!data.type || !data.relatedId || !data.relatedType) {
            throw new AppError('QR kod tipi, ilişkili ID ve tip gereklidir', 400);
        }

        // Validate Related Item
        let relatedExists = false;
        if (data.relatedType === 'Equipment') {
            relatedExists = !!(await Equipment.findById(data.relatedId));
        } else if (data.relatedType === 'Project') {
            relatedExists = !!(await Project.findById(data.relatedId));
        }

        if (!relatedExists) {
            throw new AppError('İlişkili kayıt bulunamadı', 404);
        }

        const code = generateQRCodeContent(data.type, data.relatedId);

        const qrCode = new QRCode({
            code,
            type: data.type,
            relatedId: data.relatedId,
            relatedType: data.relatedType,
            title: data.title,
            description: data.description,
            createdBy: data.userId,
            isActive: true
        });

        // Handle duplicate code error explicitly (usually Mongoose 11000)
        // Wrapped in caller or here? Error wrapper in controller handles unknown, but let's check duplicates first?
        // Rely on index, catch in controller is safer for concurrency.

        await qrCode.save();
        const qrImage = await generateQRCodeImage(code);

        return { qrCode, qrImage };
    }

    async scanQRCode(data: ScanQRCodeData) {
        if (!data.qrContent) throw new AppError('QR kod içeriği gereklidir', 400);

        const parsed = parseQRCodeContent(data.qrContent);
        if (!parsed.isValid) throw new AppError('Geçersiz QR kod formatı', 400);

        const qrCode = await QRCode.findOne({ code: data.qrContent });
        if (!qrCode) throw new AppError('QR kod bulunamadı', 404);

        if (!qrCode.isActive) throw new AppError('Bu QR kod aktif değil', 403);

        qrCode.scanCount += 1;
        qrCode.lastScannedAt = new Date();
        // If logged in
        if (data.userId) {
            // We can update lastScannedBy if schema allows? Schema populate suggests it exists.
            // Need to check schema but safe to assume based on populate call above.
            (qrCode as any).lastScannedBy = data.userId;
        }
        await qrCode.save();

        let relatedItemData = null;
        if (qrCode.relatedType === 'Equipment') {
            relatedItemData = await Equipment.findById(qrCode.relatedId);
        } else if (qrCode.relatedType === 'Project') {
            relatedItemData = await Project.findById(qrCode.relatedId);
        }

        // Create History
        const scanHistory = new QRScanHistory({
            qrCode: qrCode._id,
            scannedBy: data.userId,
            action: data.action || 'VIEW',
            relatedItem: data.relatedItem,
            relatedItemType: data.relatedItemType,
            notes: data.notes,
            location: data.location
        });
        await scanHistory.save();

        return {
            qrCode,
            relatedItem: relatedItemData,
            scanHistory
        };
    }

    async getQRCodeById(id: string) {
        const qrCode = await QRCode.findById(id)
            .populate('createdBy', 'name email')
            .populate('lastScannedBy', 'name email');

        if (!qrCode) throw new AppError('QR kod bulunamadı', 404);

        let relatedItem = null;
        if (qrCode.relatedType === 'Equipment') {
            relatedItem = await Equipment.findById(qrCode.relatedId);
        } else if (qrCode.relatedType === 'Project') {
            relatedItem = await Project.findById(qrCode.relatedId);
        }

        const scanHistory = await QRScanHistory.find({ qrCode: qrCode._id })
            .select('-__v')
            .populate('scannedBy', 'name email')
            .sort({ scannedAt: -1 })
            .limit(50)
            .lean();

        return {
            qrCode,
            relatedItem,
            scanHistory
        };
    }

    async updateQRCode(id: string, data: { title?: string, description?: string, isActive?: boolean }) {
        const qrCode = await QRCode.findById(id);
        if (!qrCode) throw new AppError('QR kod bulunamadı', 404);

        if (data.title !== undefined) qrCode.title = data.title;
        if (data.description !== undefined) qrCode.description = data.description;
        if (data.isActive !== undefined) qrCode.isActive = data.isActive;

        await qrCode.save();
        return qrCode;
    }

    async deleteQRCode(id: string) {
        const qrCode = await QRCode.findById(id);
        if (!qrCode) throw new AppError('QR kod bulunamadı', 404);

        await QRScanHistory.deleteMany({ qrCode: qrCode._id });
        await qrCode.deleteOne();
    }

    async regenerateQRImage(id: string) {
        const qrCode = await QRCode.findById(id);
        if (!qrCode) throw new AppError('QR kod bulunamadı', 404);

        return await generateQRCodeImage(qrCode.code);
    }
}

export default new QrCodeService();
