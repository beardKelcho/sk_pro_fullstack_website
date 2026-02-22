import { Request, Response } from 'express';
import ContactMessage from '../models/ContactMessage';
import { createEmailTransporter, createContactEmailTemplate, ContactEmailData } from '../config/email.config';
import logger from '../utils/logger';

// Send Contact Message
export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Tüm alanlar zorunludur'
            });
        }

        // Email format validation
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir email adresi giriniz'
            });
        }

        // STEP 1: Save to database (PRIORITY)
        const contactMessage = await ContactMessage.create({
            name,
            email,
            subject,
            message
        });

        logger.info('Contact message saved to database', { id: contactMessage._id });

        // STEP 2: Attempt to send email (NON-BLOCKING)
        try {
            const transporter = createEmailTransporter();

            if (transporter) {
                const emailData: ContactEmailData = { name, email, subject, message };
                const mailOptions = createContactEmailTemplate(emailData);

                await transporter.sendMail(mailOptions);
                logger.info('Email sent successfully', { to: process.env.SMTP_USER });
            } else {
                logger.warn('Email transporter not available. Message saved to DB only.');
            }
        } catch (emailError: any) {
            // Email failed, but DB save was successful
            logger.error('Email sending failed', { error: emailError.message });
            logger.info('Message still saved to database. Email notification skipped.');
        }

        // Always return success if DB save worked
        res.status(200).json({
            success: true,
            message: 'Mesajınız başarıyla alındı. En kısa sürede size dönüş yapacağız.',
            data: {
                id: contactMessage._id,
                name: contactMessage.name,
                createdAt: contactMessage.createdAt
            }
        });

    } catch (error: any) {
        logger.error('Contact message error', { error });

        // Check if it's a validation error
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz veri formatı',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Mesaj gönderilirken bir hata oluştu',
            error: error.message
        });
    }
};

// Get all contact messages (Admin only - we'll add this route later)
export const getAllMessages = async (req: Request, res: Response) => {
    try {
        const messages = await ContactMessage.find()
            .sort({ createdAt: -1 })
            .select('-__v');

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Mesajlar alınamadı',
            error: error.message
        });
    }
};

// Mark message as read (Admin only)
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const message = await ContactMessage.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Mesaj bulunamadı'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Mesaj okundu olarak işaretlendi',
            data: message
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'İşlem başarısız',
            error: error.message
        });
    }
};
