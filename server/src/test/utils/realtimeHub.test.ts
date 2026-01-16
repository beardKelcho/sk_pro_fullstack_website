import type { Response } from 'express';

type FakeRes = Pick<Response, 'write'>;

const createRes = () => {
  const writes: string[] = [];
  const res: FakeRes = {
    write: (chunk: any) => {
      writes.push(String(chunk));
      return true;
    },
  };
  return { res, writes };
};

describe('realtimeHub', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('sendToRole sadece ilgili role yazar', async () => {
    const hub = await import('../../utils/realtime/realtimeHub');

    const { res: resAdmin, writes: wAdmin } = createRes();
    const { res: resTech, writes: wTech } = createRes();

    hub.registerClient({
      id: 'c1',
      userId: 'u1',
      role: 'ADMIN',
      permissions: [],
      res: resAdmin as unknown as Response,
    });

    hub.registerClient({
      id: 'c2',
      userId: 'u2',
      role: 'TEKNISYEN',
      permissions: [],
      res: resTech as unknown as Response,
    });

    hub.sendToRole('ADMIN', 'monitoring:update', { ts: 1 });

    expect(wAdmin.join('')).toContain('event: monitoring:update');
    expect(wTech.join('')).not.toContain('event: monitoring:update');

    hub.unregisterClient('c1');
    hub.unregisterClient('c2');
  });

  it('broadcast tüm clientlara yazar', async () => {
    const hub = await import('../../utils/realtime/realtimeHub');

    const { res: r1, writes: w1 } = createRes();
    const { res: r2, writes: w2 } = createRes();

    hub.registerClient({
      id: 'c1',
      userId: 'u1',
      role: 'ADMIN',
      permissions: [],
      res: r1 as unknown as Response,
    });

    hub.registerClient({
      id: 'c2',
      userId: 'u2',
      role: 'DEPO_SORUMLUSU',
      permissions: [],
      res: r2 as unknown as Response,
    });

    hub.broadcast('notification:new', { title: 't' });

    expect(w1.join('')).toContain('event: notification:new');
    expect(w2.join('')).toContain('event: notification:new');

    hub.unregisterClient('c1');
    hub.unregisterClient('c2');
  });

  it('presence:update sadece ADMIN ve FIRMA_SAHIBI rollere gider', async () => {
    const hub = await import('../../utils/realtime/realtimeHub');

    const { res: rAdmin, writes: wAdmin } = createRes();
    const { res: rOwner, writes: wOwner } = createRes();
    const { res: rTech, writes: wTech } = createRes();

    hub.registerClient({
      id: 'a1',
      userId: 'u-admin',
      role: 'ADMIN',
      permissions: [],
      res: rAdmin as unknown as Response,
    });

    hub.registerClient({
      id: 'o1',
      userId: 'u-owner',
      role: 'FIRMA_SAHIBI',
      permissions: [],
      res: rOwner as unknown as Response,
    });

    hub.registerClient({
      id: 't1',
      userId: 'u-tech',
      role: 'TEKNISYEN',
      permissions: [],
      res: rTech as unknown as Response,
    });

    // registerClient içinden presence broadcast tetikleniyor; o yüzden sadece kontrol yeterli
    expect(wAdmin.join('')).toContain('event: presence:update');
    expect(wOwner.join('')).toContain('event: presence:update');
    expect(wTech.join('')).not.toContain('event: presence:update');

    hub.unregisterClient('a1');
    hub.unregisterClient('o1');
    hub.unregisterClient('t1');
  });
});

