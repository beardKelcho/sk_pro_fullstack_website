import { Request, Response } from 'express';
import About from '../models/About';
import Contact from '../models/Contact';
import { SiteContent } from '../models/SiteContent';

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
    address: 'Zincirlidere Caddesi No:52/C Şişli/İstanbul',
    phone: '+90 544 644 93 04',
    email: process.env.CONTACT_FORM_TO_EMAIL || 'info@skpro.com.tr',
    mapUrl: 'https://maps.google.com/maps?q=Zincirlidere%20Caddesi%20No%3A52%2FC%20%C5%9Ei%C5%9Fli%2F%C4%B0stanbul&t=&z=16&ie=UTF8&iwloc=&output=embed',
    socialLinks: {
        instagram: 'https://www.instagram.com/skprotr/?hl=tr',
        linkedin: 'https://www.linkedin.com/company/skpro/'
    }
};

const mergeAboutPayload = (siteContentData?: Record<string, unknown> | null, legacyAbout?: Record<string, unknown> | null) => ({
    title: (siteContentData?.title as string) || (legacyAbout?.title as string) || defaultAbout.title,
    description: (siteContentData?.description as string) || (legacyAbout?.description as string) || defaultAbout.description,
    imageUrl:
        (siteContentData?.imageUrl as string) ||
        (siteContentData?.image as string) ||
        (legacyAbout?.imageUrl as string) ||
        defaultAbout.imageUrl,
    stats:
        (Array.isArray(siteContentData?.stats) && siteContentData?.stats.length > 0
            ? siteContentData?.stats
            : Array.isArray(legacyAbout?.stats) && legacyAbout?.stats.length > 0
                ? legacyAbout?.stats
                : defaultAbout.stats) as typeof defaultAbout.stats,
});

const mergeContactPayload = (siteContentData?: Record<string, unknown> | null, legacyContact?: Record<string, unknown> | null) => ({
    address: (siteContentData?.address as string) || (legacyContact?.address as string) || defaultContact.address,
    phone: (siteContentData?.phone as string) || (legacyContact?.phone as string) || defaultContact.phone,
    email: (siteContentData?.email as string) || (legacyContact?.email as string) || defaultContact.email,
    mapUrl: (siteContentData?.mapUrl as string) || (legacyContact?.mapUrl as string) || defaultContact.mapUrl,
    socialLinks: {
        instagram:
            (siteContentData?.socialLinks as Record<string, unknown> | undefined)?.instagram as string ||
            (legacyContact?.socialLinks as Record<string, unknown> | undefined)?.instagram as string ||
            defaultContact.socialLinks.instagram,
        linkedin:
            (siteContentData?.socialLinks as Record<string, unknown> | undefined)?.linkedin as string ||
            (legacyContact?.socialLinks as Record<string, unknown> | undefined)?.linkedin as string ||
            defaultContact.socialLinks.linkedin,
    },
});

// ==================== ABOUT ====================

// Get About (Public)
export const getAbout = async (req: Request, res: Response) => {
    try {
        let [about, siteContent] = await Promise.all([
            About.findOne(),
            SiteContent.findOne({ section: 'about' }),
        ]);

        const mergedAbout = mergeAboutPayload(
            (siteContent?.data as Record<string, unknown> | null) || null,
            (about?.toObject?.() as Record<string, unknown> | undefined) || null
        );

        if (!about) {
            about = await About.create(mergedAbout);
        }

        if (!siteContent) {
            siteContent = await SiteContent.create({
                section: 'about',
                isActive: true,
                data: mergedAbout,
            });
        }

        res.status(200).json({
            success: true,
            data: {
                ...mergedAbout,
                updatedAt: siteContent?.updatedAt || about?.updatedAt,
            }
        });
    } catch (error: unknown) {
        res.status(500).json({
            success: false,
            message: 'Hakkımızda bilgisi alınamadı',
            error: error instanceof Error ? (error as Error).message : 'Bilinmeyen hata'
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

        const normalizedAbout = {
            title,
            description,
            imageUrl,
            stats: stats || [],
        };

        const [about, siteContent] = await Promise.all([
            About.findOneAndUpdate(
                {},
                normalizedAbout,
                { new: true, upsert: true, runValidators: true }
            ),
            SiteContent.findOneAndUpdate(
                { section: 'about' },
                {
                    section: 'about',
                    isActive: true,
                    data: normalizedAbout,
                    updatedBy: req.user?.id,
                },
                { new: true, upsert: true, runValidators: true }
            ),
        ]);

        res.status(200).json({
            success: true,
            message: 'Hakkımızda bölümü güncellendi',
            data: {
                ...normalizedAbout,
                updatedAt: siteContent?.updatedAt || about?.updatedAt,
            }
        });
    } catch (error: unknown) {
        res.status(500).json({
            success: false,
            message: 'Güncelleme başarısız',
            error: error instanceof Error ? (error as Error).message : 'Bilinmeyen hata'
        });
    }
};

// ==================== CONTACT ====================

// Get Contact (Public)
export const getContact = async (req: Request, res: Response) => {
    try {
        let [contact, siteContent] = await Promise.all([
            Contact.findOne(),
            SiteContent.findOne({ section: 'contact' }),
        ]);

        const mergedContact = mergeContactPayload(
            (siteContent?.data as Record<string, unknown> | null) || null,
            (contact?.toObject?.() as Record<string, unknown> | undefined) || null
        );

        if (!contact) {
            contact = await Contact.create(mergedContact);
        }

        if (!siteContent) {
            siteContent = await SiteContent.create({
                section: 'contact',
                isActive: true,
                data: mergedContact,
            });
        }

        res.status(200).json({
            success: true,
            data: {
                ...mergedContact,
                updatedAt: siteContent?.updatedAt || contact?.updatedAt,
            }
        });
    } catch (error: unknown) {
        res.status(500).json({
            success: false,
            message: 'İletişim bilgisi alınamadı',
            error: error instanceof Error ? (error as Error).message : 'Bilinmeyen hata'
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

        const normalizedContact = {
            address,
            phone,
            email,
            mapUrl,
            socialLinks: socialLinks || {},
        };

        const [contact, siteContent] = await Promise.all([
            Contact.findOneAndUpdate(
                {},
                normalizedContact,
                { new: true, upsert: true, runValidators: true }
            ),
            SiteContent.findOneAndUpdate(
                { section: 'contact' },
                {
                    section: 'contact',
                    isActive: true,
                    data: normalizedContact,
                    updatedBy: req.user?.id,
                },
                { new: true, upsert: true, runValidators: true }
            ),
        ]);

        res.status(200).json({
            success: true,
            message: 'İletişim bilgileri güncellendi',
            data: {
                ...normalizedContact,
                updatedAt: siteContent?.updatedAt || contact?.updatedAt,
            }
        });
    } catch (error: unknown) {
        res.status(500).json({
            success: false,
            message: 'Güncelleme başarısız',
            error: (error as Error).message
        });
    }
};
