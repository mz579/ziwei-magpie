/**
 * lib/ai/magpie —— magpie 模型网关的流式适配层。
 *
 * 默认按「OpenAI 兼容」协议实现：POST {BASE}/chat/completions, stream:true，
 * 从 SSE 的 choices[0].delta.content 取增量文本。
 *
 * 如果 magpie 不是 OpenAI 兼容协议，只需改本文件的「请求构造」与「响应解析」两段，
 * 对外始终暴露 AsyncGenerator<string>（逐段文本），上层 route 无需改动。
 *
 * 安全：密钥只从服务端环境变量读取（MAGPIE_BASE_URL / MAGPIE_API_KEY），
 *       绝不可加 NEXT_PUBLIC_ 前缀，也不要在客户端引用。
 *
 * 模型选择：默认取 resolveModel()（可在应用内切换）；调用方也可通过 opts.model 覆盖。
 * 本地联调：设 MAGPIE_MOCK=1 时返回一段占位流。
 */
import { resolveModel } from './model-config';

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMsg {
  role: ChatRole;
  content: string;
}

export class MagpieConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MagpieConfigError';
  }
}

function readConfig(): { base: string; key: string } {
  const base = (process.env.MAGPIE_BASE_URL ?? '').trim();
  const key = (process.env.MAGPIE_API_KEY ?? '').trim();
  return { base, key };
}

/** 列出 magpie 当前可用模型（服务端调用，密钥不外泄） */
export async function listModels(): Promise<string[]> {
  const { base, key } = readConfig();
  if (!base || !key) return [];
  try {
    const res = await fetch(`${base.replace(/\/+$/, '')}/models`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: Array<{ id?: string }> };
    if (!Array.isArray(json?.data)) return [];
    return json.data.map((m) => m?.id).filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function chunkText(text: string, size: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += size) out.push(text.slice(i, i + size));
  return out;
}

async function* mockStream(messages: ChatMsg[]): AsyncGenerator<string> {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const text =
    '【本地测试输出】当前为 MAGPIE_MOCK 占位模式，仅用于验证前后端 SSE 通道。\n\n' +
    `你刚才的问题是：${lastUser.slice(0, 120)}\n\n` +
    '在应用内切换真实模型并关闭 mock 后即可得到正式解读。';
  for (const part of chunkText(text, 8)) {
    yield part;
    await sleep(15);
  }
}

export interface StreamOptions {
  temperature?: number;
  /** 覆盖当前模型（不传则用 resolveModel()） */
  model?: string;
}

/**
 * 向 magpie 发起对话并流式产出文本增量。
 */
export async function* streamChat(
  messages: ChatMsg[],
  opts: StreamOptions = {},
): AsyncGenerator<string> {
  if (process.env.MAGPIE_MOCK === '1') {
    yield* mockStream(messages);
    return;
  }

  const { base, key } = readConfig();
  const model = (opts.model ?? '').trim() || resolveModel();
  const temperature = opts.temperature ?? 0.7;

  if (!base || !key) {
    throw new MagpieConfigError(
      '未配置 MAGPIE_BASE_URL / MAGPIE_API_KEY（magpie 本地网关参数）。',
    );
  }
  if (!model) {
    throw new MagpieConfigError('未设置模型（MAGPIE_MODEL 或应用内模型选择）。');
  }

  const url = `${base.replace(/\/+$/, '')}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model, messages, stream: true, temperature }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '');
    throw new Error(`magpie 请求失败：HTTP ${res.status} ${detail.slice(0, 200)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line || !line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') return;
      try {
        const json = JSON.parse(payload);
        const delta =
          json?.choices?.[0]?.delta?.content ??
          json?.choices?.[0]?.message?.content ??
          '';
        if (typeof delta === 'string' && delta.length > 0) yield delta;
      } catch {
        /* 跳过 keep-alive / 非 JSON 行 */
      }
    }
  }
}
