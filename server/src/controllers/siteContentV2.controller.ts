import { Request, Response } from 'express';
import { SiteContent } from '../models/SiteContent';
import { AppError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

/**
 * Get all active site content (Public endpoint)
 */
export const getAllPublicContent = async (req: Request, res: Response) => {
    try {
        const content = await SiteContent.find({ isActive: true }).select('-__v');

        // Transform to key-value format for easier frontend consumption
        const contentMap: Record<string, any> = {};
        content.forEach((item) => {
            contentMap[item.section] = item.data;
        });

        res.json({
            success: true,
            data: contentMap,
        });
    } catch (error) {
        throw new AppError('Failed to fetch site content', 500);
    }
};

/**
 * Get content by section (Public endpoint)
 */
export const getPublicContentBySection = async (req: Request, res: Response) => {
    try {
        const { section } = req.params;

        const content = await SiteContent.findOne({ section, isActive: true }).select('-__v');

        if (!content) {
            return res.json({
                success: true,
                data: null,
            });
        }

        res.json({
            success: true,
            data: content.data,
        });
    } catch (error) {
        throw new AppError('Failed to fetch section content', 500);
    }
};

/**
 * Get all content including inactive (Admin endpoint)
 */
export const getAllContent = async (req: Request, res: Response) => {
    try {
        const content = await SiteContent.find()
            .select('-__v')
            .populate('updatedBy', 'name email')
            .sort({ updatedAt: -1 });

        res.json({
            success: true,
            data: content,
        });
    } catch (error) {
        throw new AppError('Failed to fetch site content', 500);
    }
};

/**
 * Create or update content by section (Admin endpoint)
 */
export const upsertContent = async (req: Request, res: Response) => {
    try {
        const { section, isActive, data } = req.body;
        const userId = req.user?.id;

        if (!section || !data) {
            throw new AppError('Section and data are required', 400);
        }

        const validSections = ['hero', 'about', 'services', 'contact', 'footer'];
        if (!validSections.includes(section)) {
            throw new AppError('Invalid section', 400);
        }

        const content = await SiteContent.findOneAndUpdate(
            { section },
            {
                section,
                isActive: isActive !== undefined ? isActive : true,
                data,
                updatedBy: userId,
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
            }
        );

        res.json({
            success: true,
            message: 'Content updated successfully',
            data: content,
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to update content', 500);
    }
};

/**
 * Toggle section active status (Admin endpoint)
 */
export const toggleSectionStatus = async (req: Request, res: Response) => {
    try {
        const { section } = req.params;
        const userId = req.user?.id;

        const content = await SiteContent.findOne({ section });

        if (!content) {
            throw new AppError('Section not found', 404);
        }

        content.isActive = !content.isActive;
        content.updatedBy = userId ? new mongoose.Types.ObjectId(userId) : undefined;
        await content.save();

        res.json({
            success: true,
            message: `Section ${content.isActive ? 'activated' : 'deactivated'}`,
            data: { section, isActive: content.isActive },
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to toggle section status', 500);
    }
};

/**
 * Delete content section (Admin endpoint)
 */
export const deleteContent = async (req: Request, res: Response) => {
    try {
        const { section } = req.params;

        const content = await SiteContent.findOneAndDelete({ section });

        if (!content) {
            throw new AppError('Section not found', 404);
        }

        res.json({
            success: true,
            message: 'Content deleted successfully',
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to delete content', 500);
    }
};
