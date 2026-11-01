/**
 * GET /api/models —— 返回 magpie 当前可用模型列表 + 当前生效模型。
 * 供前端模型选择器使用（密钥仅服务端，不下发）。
 */
import { listModels } from '@/lib/ai/magpie';
import { resolveModel } from '@/lib/ai/model-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const models = await listModels();
  return Response.json({ models, current: resolveModel() });
}
