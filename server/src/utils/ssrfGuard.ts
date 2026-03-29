import dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

/** SSRF koruması: private/internal IP aralıklarına istek engelleniyor */
export const isPrivateOrInternalIp = (ip: string): boolean => {
  if (ip === 'localhost' || ip === '::1' || ip === '127.0.0.1') return true;
  const ipv4Private = [
    /^127\./,
    /^10\./,
    /^192\.168\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^169\.254\./,
    /^0\./,
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  ];
  if (ipv4Private.some(r => r.test(ip))) return true;
  if (/^(fc|fd)/i.test(ip)) return true;
  if (/^fe80:/i.test(ip)) return true;
  if (ip === '::ffff:127.0.0.1') return true;
  return false;
};

/**
 * DNS rebinding koruması: URL'yi parse et, hostname'i resolve et, private IP reddet.
 * Create/update VE gönderim anında çağrılmalı — DNS rebinding riskini kapatır.
 */
export const isValidWebhookUrl = async (value: string): Promise<boolean> => {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    const hostname = u.hostname;
    if (isPrivateOrInternalIp(hostname)) return false;
    try {
      const result = await dnsLookup(hostname, { all: true });
      const addresses = Array.isArray(result) ? result : [result];
      for (const addr of addresses) {
        if (isPrivateOrInternalIp(addr.address)) return false;
      }
    } catch {
      return false; // DNS başarısızsa güvenli tarafta kal
    }
    return true;
  } catch {
    return false;
  }
};
