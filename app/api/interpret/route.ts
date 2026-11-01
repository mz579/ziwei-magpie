/**
 * POST /api/interpret —— 单盘 AI 解读（流式 SSE）。
 *
 * 契约（来自 components/ChatPanel.tsx、components/InsightPanel.tsx）：
 *   请求：{ chart: ZiweiChart, messages: {role:'user'|'assistant', content:string}[] }
 *   响应：data: {"delta":{"text":"..."}} ...  data: [DONE]
 *
 * 注意：不得返回 404（前端把 404 当作"开源版不含该接口"）。
 */
import type { NextRequest } from 'next/server';
import type { ZiweiChart } from '@/lib/ziwei/types';
import { buildInterpretMessages } from '@/lib/ai/prompts';
import { streamChat } from '@/lib/ai/magpie';
import { sseStreamResponse, badRequest } from '@/lib/ai/sse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest('invalid JSON body');
  }

  const chart = body?.chart as ZiweiChart | undefined;
  const messages = Array.isArray(body?.messages) ? body.messages : [];

  if (!chart || !Array.isArray(chart.palaces) || chart.palaces.length === 0) {
    return badRequest('chart is required');
  }
  if (messages.length === 0) {
    return badRequest('messages is required');
  }

  const chat = buildInterpretMessages(chart, messages);
  return sseStreamResponse(() => streamChat(chat));
}
