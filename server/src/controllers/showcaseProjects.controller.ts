import { Request, Response } from 'express';
import ShowcaseProject from '../models/ShowcaseProject';
import logger from '../utils/logger';

// GET /api/showcase-projects - Public endpoint
export const getShowcaseProjects = async (req: Request, res: Response) => {
    try {
        const projects = await ShowcaseProject.find({ isActive: true })
            .sort({ order: 1, createdAt: -1 })
            .select('-__v');

        res.status(200).json({
            success: true,
            data: projects,
        });
    } catch (error) {
        logger.error('Get Showcase Projects Error:', error);
        res.status(500).json({
            success: false,
            message: 'Projeler getirilirken hata oluştu',
        });
    }
};

// GET /api/showcase-projects/:id - Public endpoint  
export const getShowcaseProjectById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const project = await ShowcaseProject.findById(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Proje bulunamadı',
            });
        }

        res.status(200).json({
            success: true,
            data: project,
        });
    } catch (error) {
        logger.error('Get Showcase Project Error:', error);
        res.status(500).json({
            success: false,
            message: 'Proje getirilirken hata oluştu',
        });
    }
};

// POST /api/showcase-projects - Admin only
export const createShowcaseProject = async (req: Request, res: Response) => {
    try {
        const { type, title, category, description, coverUrl, imageUrls, videoUrl, order, isActive } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Proje başlığı gereklidir',
            });
        }

        const project = new ShowcaseProject({
            type: type || 'photo',
            title,
            category: category || 'Genel',
            description,
            coverUrl,
            imageUrls: imageUrls || [],
            videoUrl,
            order: order !== undefined ? order : 0,
            isActive: isActive !== undefined ? isActive : true,
        });

        await project.save();

        res.status(201).json({
            success: true,
            data: project,
            message: 'Proje başarıyla oluşturuldu',
        });
    } catch (error) {
        logger.error('Create Showcase Project Error:', error);
        res.status(500).json({
            success: false,
            message: 'Proje oluşturulurken hata oluştu',
        });
    }
};

// PUT /api/showcase-projects/:id - Admin only
export const updateShowcaseProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { type, title, category, description, coverUrl, imageUrls, videoUrl, order, isActive } = req.body;

        const project = await ShowcaseProject.findByIdAndUpdate(
            id,
            {
                type,
                title,
                category,
                description,
                coverUrl,
                imageUrls,
                videoUrl,
                order,
                isActive,
            },
            { new: true, runValidators: true }
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Proje bulunamadı',
            });
        }

        res.status(200).json({
            success: true,
            data: project,
            message: 'Proje başarıyla güncellendi',
        });
    } catch (error) {
        logger.error('Update Showcase Project Error:', error);
        res.status(500).json({
            success: false,
            message: 'Proje güncellenirken hata oluştu',
        });
    }
};

// DELETE /api/showcase-projects/:id - Admin only
export const deleteShowcaseProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const project = await ShowcaseProject.findByIdAndDelete(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Proje bulunamadı',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Proje başarıyla silindi',
        });
    } catch (error) {
        logger.error('Delete Showcase Project Error:', error);
        res.status(500).json({
            success: false,
            message: 'Proje silinirken hata oluştu',
        });
    }
};
