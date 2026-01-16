import type { Mock } from 'jest-mock';

describe('scheduledTasks - monitoring realtime push', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    process.env.MONITORING_SSE_ENABLED = 'true';
    delete process.env.MONITORING_SSE_INTERVAL_MS;
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    delete process.env.MONITORING_SSE_ENABLED;
    delete process.env.MONITORING_SSE_INTERVAL_MS;
  });

  it('MONITORING_SSE_ENABLED=false iken interval başlatmaz', async () => {
    process.env.MONITORING_SSE_ENABLED = 'false';

    jest.mock('../../utils/realtime/realtimeHub', () => ({
      broadcast: jest.fn(),
    }));

    const hub = await import('../../utils/realtime/realtimeHub');
    const broadcastMock = hub.broadcast as unknown as Mock;

    const { startMonitoringRealtimePush } = await import('../../utils/scheduledTasks');
    startMonitoringRealtimePush();

    jest.advanceTimersByTime(60_000);
    expect(broadcastMock).not.toHaveBeenCalled();
  });

  it('varsayılan aralıkla monitoring:update broadcast eder', async () => {
    process.env.MONITORING_SSE_INTERVAL_MS = '2000';

    jest.mock('../../utils/realtime/realtimeHub', () => ({
      broadcast: jest.fn(),
    }));

    const hub = await import('../../utils/realtime/realtimeHub');
    const broadcastMock = hub.broadcast as unknown as Mock;

    const { startMonitoringRealtimePush } = await import('../../utils/scheduledTasks');
    startMonitoringRealtimePush();

    jest.advanceTimersByTime(2000);
    expect(broadcastMock).toHaveBeenCalledWith('monitoring:update', expect.objectContaining({ ts: expect.any(Number) }));
  });

  it('aynı process içinde iki kez çağrılsa bile duplicate interval açmaz', async () => {
    process.env.MONITORING_SSE_INTERVAL_MS = '2000';

    jest.mock('../../utils/realtime/realtimeHub', () => ({
      broadcast: jest.fn(),
    }));

    const setIntervalSpy = jest.spyOn(global, 'setInterval');

    const { startMonitoringRealtimePush } = await import('../../utils/scheduledTasks');
    startMonitoringRealtimePush();
    startMonitoringRealtimePush();

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
  });
});

