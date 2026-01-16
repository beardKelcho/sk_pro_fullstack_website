import { Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import logger from '../utils/logger';
import { Webhook, WebhookDelivery } from '../models';
import { sendTestWebhook } from '../services/webhook.service';

const isValidUrl = (value: string) => {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
};

export const listWebhooks = async (_req: Request, res: Response) => {
  const webhooks = await Webhook.find({}).sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, webhooks });
};

export const getWebhook = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Geçersiz webhook ID' });
  }
  const webhook = await Webhook.findById(id).lean();
  if (!webhook) {
    return res.status(404).json({ success: false, message: 'Webhook bulunamadı' });
  }
  res.status(200).json({ success: true, webhook });
};

export const createWebhook = async (req: Request, res: Response) => {
  try {
    const { name, url, events, enabled = true, secret, maxAttempts, timeoutMs } = req.body || {};

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'Webhook adı zorunludur' });
    }
    if (!url || typeof url !== 'string' || !isValidUrl(url)) {
      return res.status(400).json({ success: false, message: 'Geçerli bir URL zorunludur' });
    }
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ success: false, message: 'En az 1 event seçilmelidir' });
    }

    const generatedSecret = secret && typeof secret === 'string' ? secret : crypto.randomBytes(24).toString('hex');

    const webhook = await Webhook.create({
      name,
      url,
      enabled: Boolean(enabled),
      events,
      secret: generatedSecret,
      maxAttempts: maxAttempts ?? 10,
      timeoutMs: timeoutMs ?? 10000,
    });

    res.status(201).json({ success: true, webhook });
  } catch (error) {
    logger.error('Webhook create hatası:', error);
    res.status(500).json({ success: false, message: 'Webhook oluşturulamadı' });
  }
};

export const updateWebhook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Geçersiz webhook ID' });
    }

    const { name, url, events, enabled, secret, maxAttempts, timeoutMs } = req.body || {};
    const update: any = {};

    if (name !== undefined) update.name = name;
    if (url !== undefined) {
      if (typeof url !== 'string' || !isValidUrl(url)) {
        return res.status(400).json({ success: false, message: 'Geçerli bir URL zorunludur' });
      }
      update.url = url;
    }
    if (events !== undefined) {
      if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).json({ success: false, message: 'En az 1 event seçilmelidir' });
      }
      update.events = events;
    }
    if (enabled !== undefined) update.enabled = Boolean(enabled);
    if (secret !== undefined) update.secret = secret;
    if (maxAttempts !== undefined) update.maxAttempts = maxAttempts;
    if (timeoutMs !== undefined) update.timeoutMs = timeoutMs;

    const webhook = await Webhook.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!webhook) {
      return res.status(404).json({ success: false, message: 'Webhook bulunamadı' });
    }
    res.status(200).json({ success: true, webhook });
  } catch (error) {
    logger.error('Webhook update hatası:', error);
    res.status(500).json({ success: false, message: 'Webhook güncellenemedi' });
  }
};

export const deleteWebhook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Geçersiz webhook ID' });
    }

    const webhook = await Webhook.findByIdAndDelete(id);
    if (!webhook) {
      return res.status(404).json({ success: false, message: 'Webhook bulunamadı' });
    }

    await WebhookDelivery.deleteMany({ webhook: webhook._id });

    res.status(200).json({ success: true, message: 'Webhook silindi' });
  } catch (error) {
    logger.error('Webhook delete hatası:', error);
    res.status(500).json({ success: false, message: 'Webhook silinemedi' });
  }
};

export const testWebhook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Geçersiz webhook ID' });
    }

    const result = await sendTestWebhook(id);
    if (!result.ok) {
      return res.status(400).json({ success: false, message: result.message || 'Test başarısız', result });
    }
    res.status(200).json({ success: true, result });
  } catch (error) {
    logger.error('Webhook test hatası:', error);
    res.status(500).json({ success: false, message: 'Webhook test edilemedi' });
  }
};

export const listDeliveries = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Geçersiz webhook ID' });
  }

  const { status, limit = '50' } = req.query;
  const filters: any = { webhook: new mongoose.Types.ObjectId(id) };
  if (status) filters.status = status;

  const deliveries = await WebhookDelivery.find(filters)
    .sort({ createdAt: -1 })
    .limit(Math.min(parseInt(String(limit), 10) || 50, 200))
    .lean();

  res.status(200).json({ success: true, deliveries });
};

