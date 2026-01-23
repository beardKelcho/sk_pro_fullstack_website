import mongoose from 'mongoose';
import { Equipment } from '../models';
import { IEquipment } from '../models/Equipment';
import { AppError } from '../types/common';



export interface PaginatedEquipment {
    equipment: IEquipment[];
    total: number;
    page: number;
    totalPages: number;
}

export interface CreateEquipmentData {
    name: string;
    type: string;
    model?: string;
    serialNumber?: string;
    purchaseDate?: Date;
    status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DAMAGED';
    location?: string;
    notes?: string;
    responsibleUser?: string;
    userId?: string; // For QR code generation context or owner
}

export interface UpdateEquipmentData {
    name?: string;
    type?: string;
    model?: string;
    serialNumber?: string;
    purchaseDate?: Date;
    status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DAMAGED';
    location?: string;
    notes?: string;
    responsibleUser?: string;
}

class EquipmentService {
    /**
     * List equipment with filtering and pagination
     */
    async listEquipment(
        page: number = 1,
        limit: number = 20,
        sort: string = '-createdAt',
        search?: string,
        type?: string,
        status?: string,
        warehouse?: string // location
    ): Promise<PaginatedEquipment> {
        const filters: mongoose.FilterQuery<IEquipment> = {};

        if (type && type !== 'all') filters.type = type;
        if (status && status !== 'all') filters.status = status;
        if (warehouse) filters.location = warehouse;

        if (search) {
            filters.$text = { $search: search };
        }

        const skip = (page - 1) * limit;
        const sortOrder = sort.startsWith('-') ? -1 : 1;
        const sortField = sort.startsWith('-') ? sort.substring(1) : sort;

        // Handle text score sorting if search is present and sort is not specified or relevant
        const sortOptions: any = {};
        if (search && sort === 'relevance') {
            sortOptions.score = { $meta: 'textScore' };
        } else {
            sortOptions[sortField] = sortOrder;
        }

        const [equipment, total] = await Promise.all([
            Equipment.find(filters)
                .populate('responsibleUser', 'name email')
                .populate('currentProject', 'name')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit),
            Equipment.countDocuments(filters)
        ]);

        return {
            equipment: equipment,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Get equipment by ID
     */
    async getEquipmentById(id: string): Promise<IEquipment> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError('Geçersiz ekipman ID', 400);
        }

        const equipment = await Equipment.findById(id)
            .populate('responsibleUser', 'name email')
            .populate('currentProject', 'name')
            .populate('qrCodeId'); // assuming qrCodeId ref exists as per schema

        if (!equipment) {
            throw new AppError('Ekipman bulunamadı', 404);
        }

        return equipment as any;
    }

    /**
     * Create new equipment
     */
    async createEquipment(data: CreateEquipmentData): Promise<IEquipment> {
        // Validate required fields
        if (!data.name || !data.type) {
            throw new AppError('Ekipman adı ve tipi gereklidir', 400);
        }

        // Check duplicate serial number if provided
        if (data.serialNumber) {
            const existing = await Equipment.findOne({ serialNumber: data.serialNumber });
            if (existing) {
                throw new AppError('Bu seri numarası ile kayıtlı başka bir ekipman var', 400);
            }
        }

        const equipment = await Equipment.create({
            name: data.name,
            type: data.type,
            model: data.model,
            serialNumber: data.serialNumber,
            purchaseDate: data.purchaseDate,
            status: data.status || 'AVAILABLE',
            location: data.location || 'DEFAULT',
            notes: data.notes,
            responsibleUser: data.responsibleUser || data.userId,
        });

        // QR Code generation is handled separately via QRCode controller/service


        return equipment as any;
    }

    /**
     * Update equipment
     */
    async updateEquipment(id: string, data: UpdateEquipmentData): Promise<IEquipment> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError('Geçersiz ekipman ID', 400);
        }

        const equipment = await Equipment.findById(id);
        if (!equipment) {
            throw new AppError('Ekipman bulunamadı', 404);
        }

        // Check serial uniqueness if changing
        if (data.serialNumber && data.serialNumber !== equipment.serialNumber) {
            const existing = await Equipment.findOne({ serialNumber: data.serialNumber });
            if (existing) {
                throw new AppError('Bu seri numarası ile kayıtlı başka bir ekipman var', 400);
            }
        }

        if (data.name) equipment.name = data.name;
        if (data.type) equipment.type = data.type;
        if (data.model) (equipment as any).model = data.model;
        if (data.serialNumber) equipment.serialNumber = data.serialNumber;
        if (data.purchaseDate) equipment.purchaseDate = data.purchaseDate;
        if (data.status) equipment.status = data.status;
        if (data.location) equipment.location = data.location;
        if (data.notes) equipment.notes = data.notes;
        if (data.responsibleUser) equipment.responsibleUser = new mongoose.Types.ObjectId(data.responsibleUser);

        await equipment.save();
        return equipment as any;
    }

    /**
     * Delete equipment
     */
    async deleteEquipment(id: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError('Geçersiz ekipman ID', 400);
        }

        const equipment = await Equipment.findById(id);
        if (!equipment) {
            throw new AppError('Ekipman bulunamadı', 404);
        }

        // Check if active in a project? This logic was missing in old controller but good to have.
        // For now, strict parity with old controller.

        await equipment.deleteOne();
    }

    /**
     * Get Stats
     */
    async getStats(): Promise<any> {
        const [
            totalCount,
            availableCount,
            inUseCount,
            maintenanceCount,
            damagedCount,
            // totalValue placeholder
        ] = await Promise.all([
            Equipment.countDocuments(),
            Equipment.countDocuments({ status: 'AVAILABLE' }),
            Equipment.countDocuments({ status: 'IN_USE' }),
            Equipment.countDocuments({ status: 'MAINTENANCE' }),
            Equipment.countDocuments({ status: 'DAMAGED' }),
            Promise.resolve(0) // No price field in schema
        ]);

        return {
            total: totalCount,
            available: availableCount,
            inUse: inUseCount,
            maintenance: maintenanceCount,
            damaged: damagedCount
        };
    }
}

export default new EquipmentService();
