import { Request, Response } from 'express';
import About from '../models/About';
import Contact from '../models/Contact';

// Default data for first-time initialization
const defaultAbout = {
    title: 'SK Production Hakkında',
    description: 'Profesyonel sahne, ışık ve ses sistemleri konusunda uzmanlaşmış ekibimizle, etkinliklerinize değer katıyoruz. Yıllardır sektörde edindiğimiz tecrübe ile müşterilerimize en kaliteli hizmeti sunmayı hedefliyoruz.',
    imageUrl: '',
    stats: [
        { label: 'Yıllık Etkinlik', value: '50+' },
        { label: 'Mutlu Müşteri', value: '100+' },
        { label: 'Ekip Üyesi', value: '15+' },
        { label: 'Tecrübe Yılı', value: '10+' }
    ]
};

const defaultContact = {
    address: 'İstanbul, Türkiye',
    phone: '+90 XXX XXX XX XX',
    email: 'info@skproduction.com',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2str!4v1234567890123!5m2!1sen!2str',
    socialLinks: {
        instagram: 'https://instagram.com/skproduction',
        linkedin: 'https://linkedin.com/company/skproduction'
    }
};

// ==================== ABOUT ====================

// Get About (Public)
export const getAbout = async (req: Request, res: Response) => {
    try {
        let about = await About.findOne();

        // If no about document exists, create default one
        if (!about) {
            about = await About.create(defaultAbout);
        }

        res.status(200).json({
            success: true,
            data: about
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Hakkımızda bilgisi alınamadı',
            error: error.message
        });
    }
};

// Update About (Admin)
export const updateAbout = async (req: Request, res: Response) => {
    try {
        const { title, description, imageUrl, stats } = req.body;

        // Validate required fields
        if (!title || !description || !imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Başlık, açıklama ve görsel zorunludur'
            });
        }

        // Update or create (upsert)
        const about = await About.findOneAndUpdate(
            {},
            { title, description, imageUrl, stats: stats || [] },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Hakkımızda bölümü güncellendi',
            data: about
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Güncelleme başarısız',
            error: error.message
        });
    }
};

// ==================== CONTACT ====================

// Get Contact (Public)
export const getContact = async (req: Request, res: Response) => {
    try {
        let contact = await Contact.findOne();

        // If no contact document exists, create default one
        if (!contact) {
            contact = await Contact.create(defaultContact);
        }

        res.status(200).json({
            success: true,
            data: contact
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'İletişim bilgisi alınamadı',
            error: error.message
        });
    }
};

// Update Contact (Admin)
export const updateContact = async (req: Request, res: Response) => {
    try {
        const { address, phone, email, mapUrl, socialLinks } = req.body;

        // Validate required fields
        if (!address || !phone || !email || !mapUrl) {
            return res.status(400).json({
                success: false,
                message: 'Tüm iletişim bilgileri zorunludur'
            });
        }

        // Update or create (upsert)
        const contact = await Contact.findOneAndUpdate(
            {},
            {
                address,
                phone,
                email,
                mapUrl,
                socialLinks: socialLinks || {}
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'İletişim bilgileri güncellendi',
            data: contact
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Güncelleme başarısız',
            error: error.message
        });
    }
};
