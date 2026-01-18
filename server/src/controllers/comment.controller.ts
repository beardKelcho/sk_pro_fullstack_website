import { Request, Response } from 'express';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import { Comment } from '../models';
import { notifyUsers } from '../utils/notificationService';
import sanitizeHtml from 'sanitize-html';

const normalizeResourceType = (raw: unknown) => {
  const v = String(raw || '').toUpperCase();
  if (v === 'PROJECT') return 'PROJECT' as const;
  if (v === 'TASK') return 'TASK' as const;
  return null;
};

export const listComments = async (req: Request, res: Response) => {
  try {
    const resourceType = normalizeResourceType(req.query.resourceType);
    const resourceId = String(req.query.resourceId || '');
    const limit = Math.min(parseInt(String(req.query.limit || '50'), 10) || 50, 200);

    if (!resourceType || !mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({ success: false, message: 'resourceType ve geçerli resourceId zorunludur' });
    }

    const comments = await Comment.find({ resourceType, resourceId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('author', 'name email role')
      .lean();

    return res.status(200).json({ success: true, comments });
  } catch (error) {
    logger.error('Yorum listeleme hatası:', error);
    return res.status(500).json({ success: false, message: 'Yorumlar alınamadı' });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Kullanıcı kimlik doğrulaması gerekli' });
    }

    const { resourceType: rtRaw, resourceId: ridRaw, message, mentions } = req.body || {};
    const resourceType = normalizeResourceType(rtRaw);
    const resourceId = String(ridRaw || '');

    if (!resourceType || !mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({ success: false, message: 'resourceType ve geçerli resourceId zorunludur' });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'message zorunludur' });
    }

    // HTML içeriğini sanitize et (XSS koruması)
    const sanitizedMessage = sanitizeHtml(message.trim(), {
      allowedTags: [
        'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3',
        'ul', 'ol', 'li', 'a', 'span',
      ],
      allowedAttributes: {
        a: ['href', 'target', 'rel'],
        span: ['style'],
      },
      allowedStyles: {
        '*': {
          color: [/^#[0-9a-fA-F]{3,6}$/],
          'background-color': [/^#[0-9a-fA-F]{3,6}$/],
        },
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      allowedSchemesByTag: {
        a: ['http', 'https', 'mailto'],
      },
    });

    const mentionIds: mongoose.Types.ObjectId[] = Array.isArray(mentions)
      ? mentions
          .filter((id: any) => mongoose.Types.ObjectId.isValid(String(id)))
          .map((id: any) => new mongoose.Types.ObjectId(String(id)))
      : [];

    const comment = await Comment.create({
      resourceType,
      resourceId: new mongoose.Types.ObjectId(resourceId),
      author: new mongoose.Types.ObjectId(String(userId)),
      message: sanitizedMessage,
      mentions: mentionIds,
    });

    const populated = await Comment.findById(comment._id).populate('author', 'name email role').lean();

    // Mention bildirimi (SYSTEM kullanıyoruz)
    if (mentionIds.length > 0) {
      notifyUsers(
        mentionIds.map((x) => x.toString()),
        'SYSTEM',
        'Yeni Yorum',
        `${(req.user as any)?.name || 'Bir kullanıcı'} size bir yorumda bahsetti.`,
        {
          resourceType,
          resourceId,
          commentId: comment._id.toString(),
        },
        false
      ).catch((err) => logger.error('Mention bildirim hatası:', err));
    }

    return res.status(201).json({ success: true, comment: populated });
  } catch (error) {
    logger.error('Yorum oluşturma hatası:', error);
    return res.status(500).json({ success: false, message: 'Yorum oluşturulamadı' });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Kullanıcı kimlik doğrulaması gerekli' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Geçersiz yorum ID' });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Yorum bulunamadı' });
    }

    // Sadece author veya ADMIN/FIRMA_SAHIBI silebilir
    const role = (req.user as any)?.role;
    const isOwner = comment.author.toString() === String(userId);
    const isPrivileged = role === 'ADMIN' || role === 'FIRMA_SAHIBI';
    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz bulunmuyor' });
    }

    await Comment.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Yorum silindi' });
  } catch (error) {
    logger.error('Yorum silme hatası:', error);
    return res.status(500).json({ success: false, message: 'Yorum silinemedi' });
  }
};

