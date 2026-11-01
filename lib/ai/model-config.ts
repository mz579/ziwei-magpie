/**
 * lib/ai/model-config —— 运行时可切换的模型配置（无需重启、无需改 .env）。
 *
 * 解析优先级：请求级覆盖 > 项目内持久化配置(data/ai-model.json) > 环境变量 MAGPIE_MODEL > 默认值。
 * 仅供服务端使用（涉及文件读写）。
 */
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'ai-model.json');

export const DEFAULT_MODEL = 'auto/deepseek-v4.1-flash';

/** 读取用户在应用内选择的模型（没有则返回 null） */
export function readStoredModel(): string | null {
  try {
    const raw = fs.readFileSync(FILE, 'utf8');
    const json = JSON.parse(raw) as { model?: unknown };
    if (typeof json.model === 'string' && json.model.trim()) return json.model.trim();
  } catch {
    /* 文件不存在/损坏都回退 */
  }
  return null;
}

/** 持久化用户选择的模型 */
export function writeStoredModel(model: string): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    FILE,
    JSON.stringify({ model, updatedAt: new Date().toISOString() }, null, 2),
    'utf8',
  );
}

/** 当前生效的模型 */
export function resolveModel(): string {
  return readStoredModel() || (process.env.MAGPIE_MODEL ?? '').trim() || DEFAULT_MODEL;
}
