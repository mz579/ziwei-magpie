/**
 * POST /api/heming —— 合盘 AI 分析（流式 SSE）。
 *
 * 契约（来自 app/heming/page.tsx）：
 *   请求：{ chartA: ZiweiChart, chartB: ZiweiChart, question?: string }
 *   响应：data: {"delta":{"text":"..."}} ...  data: [DONE]
 *
 * 注意：不得返回 404（前端把 404 当作"开源版不含该接口"）。
 */
import type { NextRequest } from 'next/server';
import type { ZiweiChart } from '@/lib/ziwei/types';
import { buildHemingMessages } from '@/lib/ai/prompts';
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

  const chartA = body?.chartA as ZiweiChart | undefined;
  const chartB = body?.chartB as ZiweiChart | undefined;
  const question = typeof body?.question === 'string' ? body.question : undefined;

  if (!chartA || !Array.isArray(chartA.palaces) || chartA.palaces.length === 0) {
    return badRequest('chartA is required');
  }
  if (!chartB || !Array.isArray(chartB.palaces) || chartB.palaces.length === 0) {
    return badRequest('chartB is required');
  }

  const chat = buildHemingMessages(chartA, chartB, question);
  return sseStreamResponse(() => streamChat(chat));
}
