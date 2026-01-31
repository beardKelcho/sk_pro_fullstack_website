import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Equipment from '../models/Equipment';
import Category from '../models/Category';
import Location from '../models/Location';
import InventoryLog from '../models/InventoryLog';
import { AppError, AuthenticatedRequest } from '../types/common';
import logger from '../utils/logger';

export class InventoryController {

    // --- CATEGORY ---
    async createCategory(req: Request, res: Response) {
        try {
            const category = await Category.create(req.body);
            res.status(201).json({ success: true, data: category });
        } catch (error) {
            logger.error('Kategori oluşturma hatası:', error);
            res.status(500).json({ success: false, message: 'Sunucu hatası' });
        }
    }

    async getCategories(req: Request, res: Response) {
        try {
            const categories = await Category.find().populate('parent');
            res.status(200).json({ success: true, data: categories });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Sunucu hatası' });
        }
    }

    // --- LOCATION ---
    async createLocation(req: Request, res: Response) {
        try {
            const location = await Location.create(req.body);
            res.status(201).json({ success: true, data: location });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Sunucu hatası' });
        }
    }

    async getLocations(req: Request, res: Response) {
        try {
            const locations = await Location.find();
            res.status(200).json({ success: true, data: locations });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Sunucu hatası' });
        }
    }

    // --- ITEMS (EQUIPMENT) ---

    // 1. Create Item
    async createItem(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const userId = (req as AuthenticatedRequest).user?.id;
            const { trackingType, serialNumber, quantity } = req.body;

            // Validation
            if (trackingType === 'SERIALIZED') {
                if (!serialNumber) throw new AppError('Seri numaralı ürünler için seri no zorunludur', 400);
                req.body.quantity = 1; // Force quantity to 1
            }

            const item = await Equipment.create([req.body], { session });
            const createdItem = item[0];

            // Log creation
            await InventoryLog.create([{
                equipment: createdItem._id,
                user: userId,
                action: 'CHECK_IN',
                quantityChanged: createdItem.quantity,
                toLocation: createdItem.location,
                notes: 'İlk giriş',
                date: new Date()
            }], { session });

            await session.commitTransaction();
            res.status(201).json({ success: true, data: createdItem });
        } catch (error: any) {
            await session.abortTransaction();
            logger.error('Ürün oluşturma hatası:', error);
            res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Sunucu hatası' });
        } finally {
            session.endSession();
        }
    }

    // 2. Get Items
    async getItems(req: Request, res: Response) {
        try {
            const { category, location, status, search, limit = 20, page = 1 } = req.query;
            const query: any = {};

            if (category) query.category = category;
            if (location) query.location = location;
            if (status) query.status = status;

            if (search) {
                query.$text = { $search: search as string };
            }

            const items = await Equipment.find(query)
                .populate('category')
                .populate('location')
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .sort({ createdAt: -1 });

            const total = await Equipment.countDocuments(query);

            res.status(200).json({
                success: true,
                data: items,
                pagination: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Sunucu hatası' });
        }
    }

    // 3. Transfer Stock (The Big Logic)
    async transferStock(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const userId = (req as AuthenticatedRequest).user?.id;
            const { equipmentId, targetLocationId, quantity } = req.body;

            if (!equipmentId || !targetLocationId || !quantity) {
                throw new AppError('Eksik parametreler', 400);
            }

            const sourceItem = await Equipment.findById(equipmentId).session(session);
            if (!sourceItem) throw new AppError('Kaynak ürün bulunamadı', 404);

            const targetLocation = await Location.findById(targetLocationId).session(session);
            if (!targetLocation) throw new AppError('Hedef lokasyon bulunamadı', 404);

            // Control Source Stock
            if (sourceItem.quantity < quantity) {
                throw new AppError(`Yetersiz stok. Mevcut: ${sourceItem.quantity}, İstenen: ${quantity}`, 400);
            }

            // Scenario A: SERIALIZED (Move the item directly)
            if (sourceItem.trackingType === 'SERIALIZED') {
                const oldLocation = sourceItem.location;

                // Update location
                sourceItem.location = new mongoose.Types.ObjectId(targetLocationId);
                await sourceItem.save({ session });

                // Log
                await InventoryLog.create([{
                    equipment: sourceItem._id,
                    user: userId,
                    action: 'MOVE',
                    quantityChanged: 1,
                    fromLocation: oldLocation,
                    toLocation: targetLocationId,
                    notes: 'Transfer (Serialized)',
                    date: new Date()
                }], { session });

                await session.commitTransaction();
                return res.status(200).json({ success: true, message: 'Seri numaralı cihaz transfer edildi', data: sourceItem });
            }

            // Scenario B: BULK (Split / Merge)
            else {
                // Check if exact same item exists in target location
                let targetItem = await Equipment.findOne({
                    name: sourceItem.name,
                    model: sourceItem.model,
                    category: sourceItem.category,
                    location: targetLocationId,
                    trackingType: 'BULK'
                }).session(session);

                let resultItem;

                if (targetItem) {
                    // MERGE: Increase target stock
                    targetItem.quantity += quantity;
                    await targetItem.save({ session });
                    resultItem = targetItem;
                } else {
                    // SPLIT: Create new item clone at target
                    const itemData: any = sourceItem.toObject();
                    delete itemData._id;
                    delete itemData.createdAt;
                    delete itemData.updatedAt;
                    delete itemData.__v;

                    itemData.location = targetLocationId;
                    itemData.quantity = quantity;

                    const newItem = await Equipment.create([itemData], { session });
                    resultItem = newItem[0];
                    targetItem = resultItem; // For logging reference if needed, though resultItem is used
                }

                // Decrease Source Stock
                sourceItem.quantity -= quantity;
                if (sourceItem.quantity === 0) {
                    // Option: Delete if 0, or keep as 0? 
                    // Usually for bulk, if 0, we might want to delete it to keep DB clean, 
                    // OR keep it to preserve history reference. 
                    // Let's keep it as 0 for now to be safe, or maybe delete.
                    // The prompt said: "(Eğer 0 kalırsa kaynak kaydı silme, 0 olarak kalsın veya opsiyonel sil)"
                    // I will keep it as 0.
                    await sourceItem.save({ session });
                } else {
                    await sourceItem.save({ session });
                }

                // Log
                await InventoryLog.create([{
                    equipment: sourceItem._id, // Log against source ID? Or Target? 
                    // Ideally we should log that SOURCE decreased and TARGET increased. 
                    // But the schema links to ONE equipment.
                    // Let's create a log for the MOVEMENT. 
                    // Tracking it on sourceItem makes sense as "Moved Out".
                    user: userId,
                    action: 'MOVE',
                    quantityChanged: quantity,
                    fromLocation: sourceItem.location, // Note: sourceItem.location is still the old location ID object check
                    toLocation: targetLocationId,
                    notes: 'Transfer (Bulk Split/Merge)',
                    date: new Date()
                }], { session });

                await session.commitTransaction();
                return res.status(200).json({ success: true, message: 'Toplu ürün transfer edildi', data: resultItem });
            }

        } catch (error: any) {
            await session.abortTransaction();
            logger.error('Transfer hatası:', error);
            res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Sunucu hatası' });
        } finally {
            session.endSession();
        }
    }

    // 4. Get History
    async getHistory(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const history = await InventoryLog.find({ equipment: id })
                .populate('user', 'name email')
                .populate('fromLocation')
                .populate('toLocation')
                .sort({ date: -1 });

            res.status(200).json({ success: true, data: history });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Sunucu hatası' });
        }
    }

}

export default new InventoryController();
