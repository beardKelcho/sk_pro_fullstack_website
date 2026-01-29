import { Request, Response } from 'express';
import { SystemSetting } from '../models/SystemSetting';
import { AppError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

/**
 * Get maintenance mode status (Public endpoint - fast check)
 */
export const getMaintenanceStatus = async (req: Request, res: Response) => {
    try {
        const setting = await SystemSetting.findOne({ key: 'maintenance_mode' });

        res.json({
            success: true,
            data: {
                isMaintenanceMode: setting?.value || false,
                message: setting?.description || null,
            },
        });
    } catch (error) {
        throw new AppError('Failed to fetch maintenance status', 500);
    }
};

/**
 * Get all system settings (Admin endpoint)
 */
export const getAllSettings = async (req: Request, res: Response) => {
    try {
        const settings = await SystemSetting.find()
            .select('-__v')
            .populate('updatedBy', 'name email')
            .sort({ key: 1 });

        res.json({
            success: true,
            data: settings,
        });
    } catch (error) {
        throw new AppError('Failed to fetch settings', 500);
    }
};

/**
 * Get setting by key (Admin endpoint)
 */
export const getSettingByKey = async (req: Request, res: Response) => {
    try {
        const { key } = req.params;

        const setting = await SystemSetting.findOne({ key });

        if (!setting) {
            return res.json({
                success: true,
                data: null,
            });
        }

        res.json({
            success: true,
            data: setting,
        });
    } catch (error) {
        throw new AppError('Failed to fetch setting', 500);
    }
};

/**
 * Update setting by key (Admin endpoint)
 */
export const updateSetting = async (req: Request, res: Response) => {
    try {
        const { key } = req.params;
        const { value, description } = req.body;
        const userId = req.user?.id;

        if (value === undefined) {
            throw new AppError('Value is required', 400);
        }

        const setting = await SystemSetting.findOneAndUpdate(
            { key },
            {
                key,
                value,
                description: description || undefined,
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
            message: 'Setting updated successfully',
            data: setting,
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to update setting', 500);
    }
};

/**
 * Toggle maintenance mode (Admin endpoint - convenience method)
 */
export const toggleMaintenanceMode = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const setting = await SystemSetting.findOne({ key: 'maintenance_mode' });

        const newValue = setting ? !setting.value : true;

        const updatedSetting = await SystemSetting.findOneAndUpdate(
            { key: 'maintenance_mode' },
            {
                key: 'maintenance_mode',
                value: newValue,
                description: req.body.message || 'Site bakımdadır. Kısa süre içinde yeniden hizmette olacağız.',
                updatedBy: userId,
            },
            {
                new: true,
                upsert: true,
            }
        );

        res.json({
            success: true,
            message: `Maintenance mode ${newValue ? 'enabled' : 'disabled'}`,
            data: {
                isMaintenanceMode: newValue,
                message: updatedSetting.description,
            },
        });
    } catch (error) {
        throw new AppError('Failed to toggle maintenance mode', 500);
    }
};

/**
 * Delete setting (Admin endpoint)
 */
export const deleteSetting = async (req: Request, res: Response) => {
    try {
        const { key } = req.params;

        const setting = await SystemSetting.findOneAndDelete({ key });

        if (!setting) {
            throw new AppError('Setting not found', 404);
        }

        res.json({
            success: true,
            message: 'Setting deleted successfully',
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to delete setting', 500);
    }
};
