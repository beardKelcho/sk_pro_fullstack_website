import type { Response } from 'express';

type RealtimeClient = {
  id: string;
  userId: string;
  role: string;
  permissions: string[];
  res: Response;
  createdAt: number;
};

const clientsById = new Map<string, RealtimeClient>();
const clientIdsByUser = new Map<string, Set<string>>();
const clientIdsByRole = new Map<string, Set<string>>();

const writeSse = (res: Response, event: string, data: any) => {
  try {
    // NOTE: SSE format: event + data; data must be single line, so JSON.stringify
    // Chunked encoding sorununu önlemek için her yazma işleminden önce kontrol et
    if (res.destroyed || res.closed) {
      return false; // Connection kapalıysa yazma
    }
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    return true;
  } catch (error) {
    // Connection hatası - sessizce ignore et
    return false;
  }
};

const safeWrite = (client: RealtimeClient, event: string, data: any) => {
  try {
    // Connection durumunu kontrol et
    if (client.res.destroyed || client.res.closed) {
      return false; // Connection kapalıysa yazma
    }
    return writeSse(client.res, event, data);
  } catch {
    // ignore: disconnect cleanup handled by request close
    return false;
  }
};

const addToIndex = (map: Map<string, Set<string>>, key: string, value: string) => {
  const set = map.get(key) || new Set<string>();
  set.add(value);
  map.set(key, set);
};

const removeFromIndex = (map: Map<string, Set<string>>, key: string, value: string) => {
  const set = map.get(key);
  if (!set) return;
  set.delete(value);
  if (set.size === 0) map.delete(key);
};

const getOnlineUserIds = () => Array.from(clientIdsByUser.keys());

const broadcastPresence = () => {
  const userIds = getOnlineUserIds();
  const payload = { onlineCount: userIds.length, userIds };
  // Sadece privileged rollere tam listeyi gönder (admin/firma sahibi)
  sendToRole('ADMIN', 'presence:update', payload);
  sendToRole('FIRMA_SAHIBI', 'presence:update', payload);
};

export const registerClient = (client: Omit<RealtimeClient, 'createdAt'>) => {
  const full: RealtimeClient = { ...client, createdAt: Date.now() };
  clientsById.set(full.id, full);
  addToIndex(clientIdsByUser, full.userId, full.id);
  addToIndex(clientIdsByRole, full.role, full.id);

  safeWrite(full, 'realtime:ready', { ok: true, clientId: full.id, ts: Date.now() });
  broadcastPresence();
};

export const unregisterClient = (clientId: string) => {
  const existing = clientsById.get(clientId);
  if (!existing) return;
  clientsById.delete(clientId);
  removeFromIndex(clientIdsByUser, existing.userId, clientId);
  removeFromIndex(clientIdsByRole, existing.role, clientId);
  broadcastPresence();
};

export const sendToUser = (userId: string, event: string, data: any) => {
  const set = clientIdsByUser.get(userId);
  if (!set) return;
  for (const id of set) {
    const c = clientsById.get(id);
    if (c) safeWrite(c, event, data);
  }
};

export const sendToRole = (role: string, event: string, data: any) => {
  const set = clientIdsByRole.get(role);
  if (!set) return;
  for (const id of set) {
    const c = clientsById.get(id);
    if (c) safeWrite(c, event, data);
  }
};

export const broadcast = (event: string, data: any) => {
  for (const c of clientsById.values()) {
    safeWrite(c, event, data);
  }
};

export const pingClient = (clientId: string) => {
  const c = clientsById.get(clientId);
  if (!c) return;
  try {
    // Connection durumunu kontrol et
    if (c.res.destroyed || c.res.closed) {
      return; // Connection kapalıysa ping gönderme
    }
    c.res.write(`: ping ${Date.now()}\n\n`);
  } catch {
    // ignore
  }
};

export const getRealtimeStats = () => {
  return {
    connections: clientsById.size,
    onlineUsers: clientIdsByUser.size,
    byRole: Object.fromEntries(Array.from(clientIdsByRole.entries()).map(([k, v]) => [k, v.size])),
  };
};

