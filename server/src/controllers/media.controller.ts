import { Request, Response } from 'express';
import Media from '../models/Media';
import { uploadToCloudinary } from '../services/cloudinaryService';
import logger from '../utils/logger';

export const getMedia = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const type = req.query.type as string;

        const query: any = {};
        if (type) query.type = type;

        const total = await Media.countDocuments(query);
        const media = await Media.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            success: true,
            data: media,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        logger.error('Get Media Error:', error);
        res.status(500).json({ success: false, message: 'Medya listelenirken hata oluştu' });
    }
};

export const uploadMedia = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Dosya yüklenmedi' });
        }

        const file = req.file;
        // Determine resource type based on mimetype
        const resourceType = file.mimetype.startsWith('video') ? 'video' : 'image';

        // Upload to Cloudinary
        const result = await uploadToCloudinary(file.buffer, file.originalname, {
            folder: 'skproduction/library',
            resource_type: resourceType
        });

        // Save to DB
        const media = await Media.create({
            url: result.secure_url,
            type: resourceType,
            name: file.originalname,
            publicId: result.public_id,
            createdAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Dosya başarıyla yüklendi',
            data: media
        });

    } catch (error) {
        logger.error('Upload Media Error:', error);
        res.status(500).json({ success: false, message: 'Dosya yüklenirken hata oluştu' });
    }
};
