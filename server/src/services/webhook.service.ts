import crypto from 'crypto';
import logger from '../utils/logger';
import { Webhook, WebhookDelivery } from '../models';
import type { WebhookEventType } from '../models/Webhook';

type EmitOptions = {
  source?: string;
};

const getBackoffMs = (attempt: number) => {
  // attempt 1 => 1m, 2 => 5m, 3 => 15m, 4 => 30m, 5 => 1h, sonra 6h'ya kadar artan
  const schedule = [60_000, 5 * 60_000, 15 * 60_000, 30 * 60_000, 60 * 60_000, 2 * 60 * 60_000, 6 * 60 * 60_000];
  return schedule[Math.min(attempt - 1, schedule.length - 1)];
};

export const emitWebhookEvent = async (event: WebhookEventType, payload: any, options: EmitOptions = {}) => {
  const enabledWebhooks = await Webhook.find({ enabled: true, events: event }).lean();
  if (!enabledWebhooks.length) return;

  const now = new Date();
  const basePayload = {
    event,
    source: options.source || 'skpro',
    timestamp: now.toISOString(),
    data: payload,
  };

  await WebhookDelivery.insertMany(
    enabledWebhooks.map((wh: any) => ({
      webhook: wh._id,
      event,
      payload: basePayload,
      status: 'PENDING',
      attempts: 0,
      nextAttemptAt: now,
    }))
  );
};

const buildSignature = (secret: string, timestamp: string, body: string) => {
  // imza: HMAC_SHA256(secret, `${timestamp}.${body}`)
  const h = crypto.createHmac('sha256', secret);
  h.update(`${timestamp}.${body}`);
  return `sha256=${h.digest('hex')}`;
};

export const deliverPendingWebhooks = async (limit = 50) => {
  const now = new Date();
  const deliveries = await WebhookDelivery.find({
    status: { $in: ['PENDING', 'RETRYING'] },
    nextAttemptAt: { $lte: now },
  })
    .sort({ nextAttemptAt: 1 })
    .limit(limit)
    .populate('webhook')
    .exec();

  for (const delivery of deliveries) {
    const webhook: any = (delivery as any).webhook;
    if (!webhook || !webhook.enabled) {
      delivery.status = 'FAILED';
      delivery.lastError = 'Webhook disabled or missing';
      delivery.lastAttemptAt = new Date();
      await delivery.save();
      continue;
    }

    if (delivery.attempts >= (webhook.maxAttempts || 10)) {
      delivery.status = 'FAILED';
      delivery.lastError = 'Max attempts reached';
      delivery.lastAttemptAt = new Date();
      await delivery.save();
      continue;
    }

    const attemptNo = delivery.attempts + 1;
    const timestamp = Date.now().toString();
    const body = JSON.stringify(delivery.payload);

    const controller = new AbortController();
    const timeoutMs = Number(webhook.timeoutMs || 10000);
    const t = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-SKPRO-Event': delivery.event,
        'X-SKPRO-Delivery-Id': delivery._id.toString(),
        'X-SKPRO-Timestamp': timestamp,
      };
      if (webhook.secret) {
        headers['X-SKPRO-Signature'] = buildSignature(webhook.secret, timestamp, body);
      }

      const res = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      });

      delivery.attempts = attemptNo;
      delivery.lastAttemptAt = new Date();
      delivery.lastStatusCode = res.status;

      if (res.ok) {
        delivery.status = 'SUCCESS';
        delivery.lastError = undefined;
        await delivery.save();
      } else {
        const text = await res.text().catch(() => '');
        delivery.status = attemptNo >= (webhook.maxAttempts || 10) ? 'FAILED' : 'RETRYING';
        delivery.lastError = `HTTP ${res.status}${text ? `: ${text.slice(0, 500)}` : ''}`;
        delivery.nextAttemptAt = new Date(Date.now() + getBackoffMs(attemptNo));
        await delivery.save();
      }
    } catch (err: any) {
      delivery.attempts = attemptNo;
      delivery.lastAttemptAt = new Date();
      delivery.lastStatusCode = undefined;
      delivery.status = attemptNo >= (webhook.maxAttempts || 10) ? 'FAILED' : 'RETRYING';
      delivery.lastError = err?.name === 'AbortError' ? `Timeout (${timeoutMs}ms)` : String(err?.message || err);
      delivery.nextAttemptAt = new Date(Date.now() + getBackoffMs(attemptNo));
      await delivery.save();

      logger.warn('Webhook delivery failed', {
        webhookId: webhook._id?.toString(),
        deliveryId: delivery._id?.toString(),
        event: delivery.event,
        attempt: attemptNo,
        error: delivery.lastError,
      });
    } finally {
      clearTimeout(t);
    }
  }
};

export const sendTestWebhook = async (webhookId: string) => {
  const wh: any = await Webhook.findById(webhookId);
  if (!wh) {
    return { ok: false, message: 'Webhook bulunamadı' as const };
  }

  const testPayload = {
    event: 'PROJECT_STATUS_CHANGED',
    source: 'skpro',
    timestamp: new Date().toISOString(),
    data: {
      test: true,
      message: 'Bu bir test webhook payload’ıdır.',
    },
  };

  const timestamp = Date.now().toString();
  const body = JSON.stringify(testPayload);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-SKPRO-Event': 'PROJECT_STATUS_CHANGED',
    'X-SKPRO-Timestamp': timestamp,
    'X-SKPRO-Delivery-Id': `test-${Date.now()}`,
  };
  if (wh.secret) {
    headers['X-SKPRO-Signature'] = buildSignature(wh.secret, timestamp, body);
  }

  const controller = new AbortController();
  const timeoutMs = Number(wh.timeoutMs || 10000);
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(wh.url, { method: 'POST', headers, body, signal: controller.signal });
    const text = await res.text().catch(() => '');
    return { ok: res.ok, status: res.status, body: text.slice(0, 1000) };
  } finally {
    clearTimeout(t);
  }
};

