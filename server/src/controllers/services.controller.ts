import { Request, Response } from 'express';
import Service from '../models/Service';
import logger from '../utils/logger';

// GET /api/services - Public endpoint
export const getAllServices = async (req: Request, res: Response) => {
    try {
        const services = await Service.find({ isActive: true })
            .sort({ order: 1, createdAt: -1 })
            .select('-__v');

        res.status(200).json({
            success: true,
            data: services,
        });
    } catch (error) {
        logger.error('Get Services Error:', error);
        res.status(500).json({
            success: false,
            message: 'Hizmetler getirilirken hata oluştu',
        });
    }
};

// GET /api/services/:id - Public endpoint
export const getServiceById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Hizmet bulunamadı',
            });
        }

        res.status(200).json({
            success: true,
            data: service,
        });
    } catch (error) {
        logger.error('Get Service Error:', error);
        res.status(500).json({
            success: false,
            message: 'Hizmet getirilirken hata oluştu',
        });
    }
};

// POST /api/services - Admin only
export const createService = async (req: Request, res: Response) => {
    try {
        const { title, category, description, icon, details, order, isActive } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Hizmet başlığı gereklidir',
            });
        }

        const service = new Service({
            title,
            category: category || 'Video Processing',
            description,
            icon: icon || 'Monitor',
            details: details || [],
            order: order !== undefined ? order : 0,
            isActive: isActive !== undefined ? isActive : true,
        });

        await service.save();

        res.status(201).json({
            success: true,
            data: service,
            message: 'Hizmet başarıyla oluşturuldu',
        });
    } catch (error) {
        logger.error('Create Service Error:', error);
        res.status(500).json({
            success: false,
            message: 'Hizmet oluşturulurken hata oluştu',
        });
    }
};

// PUT /api/services/:id - Admin only
export const updateService = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, category, description, icon, details, order, isActive } = req.body;

        const service = await Service.findByIdAndUpdate(
            id,
            {
                title,
                category,
                description,
                icon,
                details,
                order,
                isActive,
            },
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Hizmet bulunamadı',
            });
        }

        res.status(200).json({
            success: true,
            data: service,
            message: 'Hizmet başarıyla güncellendi',
        });
    } catch (error) {
        logger.error('Update Service Error:', error);
        res.status(500).json({
            success: false,
            message: 'Hizmet güncellenirken hata oluştu',
        });
    }
};

// DELETE /api/services/:id - Admin only
export const deleteService = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const service = await Service.findByIdAndDelete(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Hizmet bulunamadı',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Hizmet başarıyla silindi',
        });
    } catch (error) {
        logger.error('Delete Service Error:', error);
        res.status(500).json({
            success: false,
            message: 'Hizmet silinirken hata oluştu',
        });
    }
};
