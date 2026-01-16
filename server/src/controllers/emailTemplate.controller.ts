import { Request, Response } from 'express';
import EmailTemplate from '../models/EmailTemplate';
import logger from '../utils/logger';
import { renderInlineTemplate } from '../utils/emailTemplateRenderer';

const isNonEmptyString = (v: any) => typeof v === 'string' && v.trim().length > 0;

export const listEmailTemplates = async (_req: Request, res: Response) => {
  try {
    const items = await EmailTemplate.find({}).sort({ updatedAt: -1 }).lean();
    return res.status(200).json({ success: true, data: items });
  } catch (e) {
    logger.error('Email template list hatası:', e);
    return res.status(500).json({ success: false, message: 'Email template listesi alınamadı' });
  }
};

export const getEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await EmailTemplate.findById(id).lean();
    if (!item) return res.status(404).json({ success: false, message: 'Email template bulunamadı' });
    return res.status(200).json({ success: true, data: item });
  } catch (e) {
    logger.error('Email template get hatası:', e);
    return res.status(500).json({ success: false, message: 'Email template alınamadı' });
  }
};

export const createEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { key, name, description, enabled, variants } = req.body || {};

    if (!isNonEmptyString(key) || !isNonEmptyString(name)) {
      return res.status(400).json({ success: false, message: 'key ve name zorunludur' });
    }
    if (!Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ success: false, message: 'En az 1 variant zorunludur' });
    }

    const created = await EmailTemplate.create({
      key: String(key).trim(),
      name: String(name).trim(),
      description: isNonEmptyString(description) ? String(description).trim() : undefined,
      enabled: typeof enabled === 'boolean' ? enabled : true,
      variants,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (e: any) {
    if (e?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Bu key ile email template zaten var' });
    }
    logger.error('Email template create hatası:', e);
    return res.status(500).json({ success: false, message: 'Email template oluşturulamadı' });
  }
};

export const updateEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, enabled, variants } = req.body || {};

    const existing = await EmailTemplate.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Email template bulunamadı' });

    if (name !== undefined) existing.name = String(name).trim();
    if (description !== undefined) existing.description = isNonEmptyString(description) ? String(description).trim() : '';
    if (enabled !== undefined) existing.enabled = Boolean(enabled);
    if (variants !== undefined) {
      if (!Array.isArray(variants) || variants.length === 0) {
        return res.status(400).json({ success: false, message: 'variants boş olamaz' });
      }
      existing.variants = variants;
    }

    await existing.save();
    return res.status(200).json({ success: true, data: existing });
  } catch (e) {
    logger.error('Email template update hatası:', e);
    return res.status(500).json({ success: false, message: 'Email template güncellenemedi' });
  }
};

export const deleteEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await EmailTemplate.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ success: false, message: 'Email template bulunamadı' });
    return res.status(200).json({ success: true, message: 'Silindi' });
  } catch (e) {
    logger.error('Email template delete hatası:', e);
    return res.status(500).json({ success: false, message: 'Email template silinemedi' });
  }
};

export const previewEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { id, key, locale, variantName, data, template: inlineTemplate } = req.body || {};

    let template: any = null;
    if (inlineTemplate && typeof inlineTemplate === 'object') {
      template = inlineTemplate;
      if (!template.key && isNonEmptyString(key)) template.key = String(key).trim();
    } else {
      if (id) template = await EmailTemplate.findById(id).lean();
      if (!template && isNonEmptyString(key)) template = await EmailTemplate.findOne({ key: String(key).trim() }).lean();
    }
    if (!template) return res.status(404).json({ success: false, message: 'Email template bulunamadı' });

    const variants = Array.isArray(template.variants) ? template.variants : [];
    if (variants.length === 0) {
      return res.status(400).json({ success: false, message: 'Template variants boş' });
    }

    const selected = variantName ? variants.find((v: any) => v.name === variantName) : variants[0];
    const localeKeys = selected?.locales ? Object.keys(selected.locales) : [];
    const chosenLocale = locale && localeKeys.includes(locale) ? locale : localeKeys.includes('tr') ? 'tr' : localeKeys[0];
    const localized = selected?.locales?.[chosenLocale] || selected?.locales?.tr || selected?.locales?.[localeKeys[0]];
    if (!localized?.subject || !localized?.html) {
      return res.status(400).json({ success: false, message: 'Template içeriği eksik' });
    }

    const rendered = renderInlineTemplate({ subject: localized.subject, html: localized.html }, data || {});
    return res.status(200).json({
      success: true,
      data: {
        subject: rendered.subject,
        html: rendered.html,
        used: {
          templateKey: template.key || String(key || ''),
          variantName: selected.name,
          locale: chosenLocale || 'tr',
        },
      },
    });
  } catch (e) {
    logger.error('Email template preview hatası:', e);
    return res.status(500).json({ success: false, message: 'Preview alınamadı' });
  }
};

