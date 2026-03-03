import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Case from '../models/Case';
import Equipment from '../models/Equipment';
import Project from '../models/Project';
import InventoryLog from '../models/InventoryLog';
import logger from '../utils/logger';

// Benzersiz Case QR Kodu oluşturucu
const generateUniqueCaseQR = async (): Promise<string> => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const qrPrefix = 'CASE-';
    let isUnique = false;
    let newQrCode = '';

    while (!isUnique) {
        let randomPart = '';
        for (let i = 0; i < 8; i++) {
            randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        newQrCode = qrPrefix + randomPart;

        // Check if exists
        const existing = await Case.findOne({ qrCode: newQrCode });
        if (!existing) {
            isUnique = true;
        }
    }

    return newQrCode;
};

// 1. Kasa Oluştur (Create Case)
export const createCase = async (req: Request, res: Response) => {
    try {
        const { name, description, project, items } = req.body;

        // items expects: [{ equipment: string, quantity: number }]
        // Basic validation
        if (!name || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Kasa adı ve en az bir ekipman gereklidir',
            });
        }

        // QR kodu oluştur
        const qrCode = await generateUniqueCaseQR();

        const newCase = new Case({
            name,
            description,
            project,
            items,
            qrCode,
            createdBy: req.user?.id, // Assumes req.user is populated by auth middleware
            status: 'PENDING',
        });

        await newCase.save();

        res.status(201).json({
            success: true,
            message: 'Kasa başarıyla oluşturuldu',
            case: newCase,
        });
    } catch (error) {
        logger.error('Kasa oluşturma hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kasa oluşturulurken bir hata meydana geldi',
        });
    }
};

// 2. Kasa Listesini Getir (Get all cases)
export const getCases = async (req: Request, res: Response) => {
    try {
        const cases = await Case.find()
            .populate('project', 'name')
            .populate('createdBy', 'name')
            .populate({
                path: 'items.equipment',
                select: 'name model brand serialNumber',
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            cases,
        });
    } catch (error) {
        logger.error('Kasaları getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kasalar getirilirken bir hata meydana geldi',
        });
    }
};

// 3. Tek Kasa Detayını Getir
export const getCaseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const caseItem = await Case.findById(id)
            .populate('project', 'name')
            .populate('createdBy', 'name')
            .populate({
                path: 'items.equipment',
                select: 'name model brand serialNumber currentStock',
            });

        if (!caseItem) {
            return res.status(404).json({
                success: false,
                message: 'Kasa bulunamadı',
            });
        }

        res.status(200).json({
            success: true,
            case: caseItem,
        });
    } catch (error) {
        logger.error('Kasa detayı getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kasa getirilirken bir hata meydana geldi',
        });
    }
};

// 4. Kasa QR Okutma (Kasa İçeriğini İşle)
export const processCaseQR = async (req: Request, res: Response) => {
    try {
        const { qrCode } = req.body;

        if (!qrCode) {
            return res.status(400).json({
                success: false,
                message: 'QR Kod gereklidir',
            });
        }

        const caseItem = await Case.findOne({ qrCode }).populate('project');

        if (!caseItem) {
            return res.status(404).json({
                success: false,
                message: 'Geçersiz Kasa QR Kodu',
            });
        }

        if (caseItem.status === 'PROCESSED') {
            return res.status(400).json({
                success: false,
                message: 'Bu kasa zaten okutulmuş ve işlenmiş',
            });
        }

        if (!caseItem.project) {
            return res.status(400).json({
                success: false,
                message: 'Bu kasaya herhangi bir proje atanmamış, işlem yapılamaz',
            });
        }

        const project = await Project.findById(caseItem.project);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Kasanın atandığı proje bulunamadı',
            });
        }

        // Ekipmanları döngüyle stoktan düş, projeye ekle ve log at
        const errors: string[] = [];
        const userId = req.user?.id;

        for (const item of caseItem.items) {
            const equip = await Equipment.findById((item as unknown).equipment);

            if (!equip) {
                errors.push(`Ekipman bulunamadı (ID: ${(item as unknown).equipment})`);
                continue;
            }

            if (equip.quantity < item.quantity) {
                errors.push(`${equip.name} için yetersiz stok (İstenen: ${item.quantity}, Mevcut: ${equip.quantity})`);
                continue;
            }

            // Stok düş
            equip.quantity -= item.quantity;
            await equip.save();

            // Projeye ekle (eğer daha önceden eklendiyse, burası sadece listeye equipment ID'yi ekler)
            // Varsayım olarak projede aynı equipment ID'nin birden fazla kez bulunmasına izin veriyoruz (veya quantity tutmuyoruz projede sadece ID array'i var).
            // Eğer projedeki equipment dizisi tekil tutulmak isteniyorsa kontrol eklenebilir.
            if (!project.equipment.includes(equip._id as unknown as mongoose.Types.ObjectId)) {
                project.equipment.push(equip._id as unknown as mongoose.Types.ObjectId);
            }

            // Envanter logu at
            await InventoryLog.create({
                equipment: equip._id,
                type: 'OUT',
                quantity: item.quantity,
                project: project._id,
                user: userId,
                notes: `[Kasa: ${caseItem.name}] içeriği projeye atandı.`
            });
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bazı ekipmanlar işlenemedi',
                errors,
            });
        }

        // Projeyi kaydet
        await project.save();

        // Kasayı PROCESSED olarak işaretle
        caseItem.status = 'PROCESSED';
        await caseItem.save();

        res.status(200).json({
            success: true,
            message: 'Kasa başarıyla okutuldu, envanterden düşüldü ve projeye atandı',
            case: caseItem,
        });
    } catch (error) {
        logger.error('Kasa QR işleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kasa işlenirken bir hata meydana geldi',
        });
    }
};
