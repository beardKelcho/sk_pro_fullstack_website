type SseEvent = {
  event: string;
  data: any;
};

type ConnectSseOptions = {
  url: string;
  token: string;
  onEvent: (evt: SseEvent) => void;
  onError?: (err: any) => void;
};

export const connectSse = ({ url, token, onEvent, onError }: ConnectSseOptions) => {
  const controller = new AbortController();
  let closed = false;

  const start = async () => {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`SSE bağlantısı başarısız (HTTP ${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (!closed) {
        try {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            buffer += decoder.decode(value, { stream: true });
          }
        } catch (readError: any) {
          // ERR_INCOMPLETE_CHUNKED_ENCODING hatası - connection kapandı
          if (readError?.name === 'AbortError' || readError?.message?.includes('chunked')) {
            break; // Normal disconnect, sessizce çık
          }
          throw readError; // Diğer hatalar için throw et
        }

        // SSE events are separated by \n\n
        let idx: number;
        while ((idx = buffer.indexOf('\n\n')) >= 0) {
          const raw = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          if (!raw.trim()) continue;

          const lines = raw.split('\n');
          let eventName = 'message';
          const dataLines: string[] = [];

          for (const line of lines) {
            if (line.startsWith(':')) continue; // comment/heartbeat
            if (line.startsWith('event:')) {
              eventName = line.slice('event:'.length).trim() || 'message';
              continue;
            }
            if (line.startsWith('data:')) {
              dataLines.push(line.slice('data:'.length).trim());
              continue;
            }
          }

          const dataRaw = dataLines.join('\n');
          let data: any = dataRaw;
          try {
            data = dataRaw ? JSON.parse(dataRaw) : null;
          } catch {
            // keep as string
          }

          onEvent({ event: eventName, data });
        }
      }
    } catch (err) {
      if (!closed) onError?.(err);
    }
  };

  start();

  return () => {
    closed = true;
    controller.abort();
  };
};

