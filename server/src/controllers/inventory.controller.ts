import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Equipment from '../models/Equipment';
import Category from '../models/Category';
import Location from '../models/Location';
import Project from '../models/Project';
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

    async updateCategory(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
            if (!category) return res.status(404).json({ success: false, message: 'Kategori bulunamadı' });
            res.status(200).json({ success: true, data: category });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Sunucu hatası' });
        }
    }

    async deleteCategory(req: Request, res: Response) {
        try {
            const { id } = req.params;
            // Check if used
            const used = await Equipment.exists({ category: id });
            if (used) return res.status(400).json({ success: false, message: 'Bu kategori kullanılıyor, silinemez' });

            const category = await Category.findByIdAndDelete(id);
            if (!category) return res.status(404).json({ success: false, message: 'Kategori bulunamadı' });
            res.status(200).json({ success: true, message: 'Kategori silindi' });
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

    // 3. Assign To Project
    async assignToProject(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const userId = (req as AuthenticatedRequest).user?.id;
            const { equipmentId, projectId, quantity } = req.body;

            if (!equipmentId || !projectId || !quantity) {
                throw new AppError('Eksik parametreler', 400);
            }

            const item = await Equipment.findById(equipmentId).session(session);
            if (!item) throw new AppError('Ekipman bulunamadı', 404);

            const project = await Project.findById(projectId).session(session);
            if (!project) throw new AppError('Proje bulunamadı', 404);

            if (item.status !== 'AVAILABLE') {
                // Allow if already IN_USE? Maybe not for simplification. Only AVAILABLE items can be assigned.
                // User request says "Ürün ya depodadır ya projede".
                // If item is already in a project, it should be returned first? Or can we transfer Project->Project directly?
                // For simplification: Warehouse -> Project only.
                if (item.status === 'IN_USE' && item.currentProject?.toString() !== projectId) {
                    throw new AppError('Bu ekipman şu an başka bir projede kullanımda', 400);
                }
                // If status is maintenance etc.
                if (item.status !== 'IN_USE') {
                    throw new AppError(`Ekipman şu an müsait değil (${item.status})`, 400);
                }
            }

            // SERIALIZED
            if (item.trackingType === 'SERIALIZED') {
                if (item.currentProject) {
                    throw new AppError('Seri numaralı ürün zaten bir projede', 400);
                }
                item.status = 'IN_USE';
                item.currentProject = new mongoose.Types.ObjectId(projectId);
                // item.location remains Warehouse or we can change it to a "Project" location type if exists.
                // User said "location alanını null yap veya 'Projede' olarak işaretle".
                // Since location is required in Schema, we must keep it valid. 
                // Let's assume we keep the 'Warehouse' location ID but logic knows it's out.
                // OR we have a special 'Project' location. 
                // Let's just keep the physical location ID as is (Warehouse) but status=IN_USE and currentProject set.
                // Re-reading user request: "location alanını null yap veya "Projede" olarak işaretle."
                // Since schema requires location, and changing schema validation is risky right now without migration,
                // I will keep the location ID as the originating warehouse.

                await item.save({ session });
            }
            // BULK
            else {
                // Check if enough quantity
                if (item.quantity < quantity) {
                    throw new AppError(`Yetersiz stok. Mevcut: ${item.quantity}`, 400);
                }

                // Split Logic:
                // 1. Decrease source (Warehouse)
                item.quantity -= quantity;
                if (item.quantity === 0) {
                    // If 0, we can delete the warehouse record IF we are confident.
                    // But safer to keep it as 0 holder? 
                    // Or maybe we treat BULK items in project as separate records.
                    // Let's create a new record for the Project assignment
                }
                await item.save({ session });

                // 2. Create/Update Project Item
                // Check if this equipment (same name/model) is already in project
                let projectItem = await Equipment.findOne({
                    name: item.name,
                    model: item.model,
                    currentProject: projectId,
                    trackingType: 'BULK'
                }).session(session);

                if (projectItem) {
                    projectItem.quantity += quantity;
                    await projectItem.save({ session });
                } else {
                    // Create new
                    const newItemData: any = item.toObject();
                    delete newItemData._id;
                    delete newItemData.createdAt;
                    delete newItemData.updatedAt;
                    delete newItemData.__v;
                    newItemData.quantity = quantity;
                    newItemData.status = 'IN_USE';
                    newItemData.currentProject = projectId;
                    // Location ID must be valid. Let's keep source location ID or specific dummy.
                    // Keeping source location ID (Warehouse)

                    await Equipment.create([newItemData], { session });
                }
            }

            // Log
            await InventoryLog.create([{
                equipment: equipmentId, // Log on source ID
                user: userId,
                action: 'CHECK_OUT', // "Projeye Çık"
                quantityChanged: quantity,
                toLocation: projectId, // logging project ID as destination
                notes: `Projeye çıkış: ${project.name}`,
                date: new Date()
            }], { session });

            await session.commitTransaction();
            res.status(200).json({ success: true, message: 'Ürün projeye atandı' });
        } catch (error: any) {
            await session.abortTransaction();
            logger.error('Proje atama hatası:', error);
            res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Sunucu hatası' });
        } finally {
            session.endSession();
        }
    }

    // 4. Return To Warehouse
    async returnToWarehouse(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const userId = (req as AuthenticatedRequest).user?.id;
            const { equipmentId, quantity } = req.body;

            const item = await Equipment.findById(equipmentId).session(session);
            if (!item) throw new AppError('Ekipman bulunamadı', 404);

            if (!item.currentProject) {
                throw new AppError('Bu ekipman bir projede değil', 400);
            }

            // Find Warehouse Item to merge back into
            // We assume 'location' field on the item holds the Warehouse ID.
            const warehouseId = item.location;

            if (item.trackingType === 'SERIALIZED') {
                item.status = 'AVAILABLE';
                item.currentProject = undefined; // Clear project
                await item.save({ session });
            } else {
                // BULK
                if (quantity > item.quantity) {
                    throw new AppError('İade edilecek miktar mevcut miktardan fazla', 400);
                }

                // 1. Decrease Project Stock
                item.quantity -= quantity;
                if (item.quantity === 0) {
                    await Equipment.findByIdAndDelete(item._id).session(session);
                } else {
                    await item.save({ session });
                }

                // 2. Increase Warehouse Stock
                const warehouseItem = await Equipment.findOne({
                    name: item.name,
                    model: item.model,
                    location: warehouseId,
                    status: 'AVAILABLE', // Warehouse stock is available
                    trackingType: 'BULK',
                    currentProject: null // Important: Warehouse item has no project
                }).session(session);

                if (warehouseItem) {
                    warehouseItem.quantity += quantity;
                    await warehouseItem.save({ session });
                } else {
                    // This creates a new "Available" item in warehouse if original was exhausted/deleted
                    const newItemData: any = item.toObject();
                    delete newItemData._id;
                    delete newItemData.createdAt;
                    delete newItemData.updatedAt;
                    delete newItemData.__v;
                    newItemData.quantity = quantity;
                    newItemData.status = 'AVAILABLE';
                    newItemData.currentProject = null;
                    newItemData.location = warehouseId;

                    await Equipment.create([newItemData], { session });
                }
            }

            // Log
            await InventoryLog.create([{
                equipment: equipmentId,
                user: userId,
                action: 'CHECK_IN', // "İade Al"
                quantityChanged: quantity,
                fromLocation: item.currentProject,
                toLocation: warehouseId,
                notes: 'Projeden iade',
                date: new Date()
            }], { session });

            await session.commitTransaction();
            res.status(200).json({ success: true, message: 'Ürün depoya iade edildi' });

        } catch (error: any) {
            await session.abortTransaction();
            logger.error('İade hatası:', error);
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

    // 5. Update Item
    async updateItem(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, brand, model, serialNumber, category, status, criticalStockLevel } = req.body;

            const item = await Equipment.findById(id);
            if (!item) {
                return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
            }

            // Update allowed fields
            if (name) item.name = name;
            if (brand) item.brand = brand;
            if (model) item.model = model;
            if (serialNumber) item.serialNumber = serialNumber;
            if (category) item.category = category;
            if (status) item.status = status;
            if (criticalStockLevel !== undefined) item.criticalStockLevel = criticalStockLevel;

            await item.save();

            res.status(200).json({ success: true, data: item });
        } catch (error) {
            logger.error('Ürün güncelleme hatası:', error);
            res.status(500).json({ success: false, message: 'Sunucu hatası' });
        }
    }

    // 6. Delete Item
    async deleteItem(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const item = await Equipment.findByIdAndDelete(id);

            if (!item) {
                return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
            }

            // Optional: Clean up execution logs or keep them?
            // Usually we keep logs even if item is deleted, but formatted carefully.
            // For now, simple deletion.

            res.status(200).json({ success: true, message: 'Ürün başarıyla silindi' });
        } catch (error) {
            logger.error('Ürün silme hatası:', error);
            res.status(500).json({ success: false, message: 'Sunucu hatası' });
        }
    }

}

export default new InventoryController();
