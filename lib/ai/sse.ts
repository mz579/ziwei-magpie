/**
 * lib/ai/sse —— 把「文本增量生成器」包装成前端约定的 SSE 响应。
 *
 * 前端约定（已实测）：逐行 `data: {"delta":{"text":"..."}}`，结束 `data: [DONE]`。
 * 业务错误也走 200 + `{"error": "..."}` 事件，绝不返回 404（404 会被前端当成"未实现"）。
 */
import { MagpieConfigError } from './magpie';

export function sseStreamResponse(producer: () => AsyncGenerator<string>): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const sendEvent = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      try {
        for await (const delta of producer()) {
          sendEvent({ delta: { text: delta } });
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (e) {
        const msg =
          e instanceof MagpieConfigError
            ? e.message
            : e instanceof Error
              ? e.message
              : String(e);
        sendEvent({ error: msg });
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

export function badRequest(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
