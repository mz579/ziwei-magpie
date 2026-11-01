/**
 * GET  /api/ai-config —— 返回当前生效模型
 * POST /api/ai-config —— 切换模型并持久化到项目内 data/ai-model.json（无需重启）
 *
 * Body: { model: string }
 */
import type { NextRequest } from 'next/server';
import { listModels } from '@/lib/ai/magpie';
import { resolveModel, writeStoredModel } from '@/lib/ai/model-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({ model: resolveModel() });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const model = typeof body?.model === 'string' ? body.model.trim() : '';
  if (!model) {
    return Response.json({ error: 'model is required' }, { status: 400 });
  }

  // 若 magpie 能列出模型，则校验（防止手滑写错名字）；列不出时放行
  const models = await listModels();
  if (models.length > 0 && !models.includes(model)) {
    return Response.json(
      { error: `未知模型：${model}（不在 magpie 模型列表中）` },
      { status: 400 },
    );
  }

  try {
    writeStoredModel(model);
  } catch (e) {
    return Response.json(
      { error: `保存失败：${e instanceof Error ? e.message : String(e)}` },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, model });
}
