/**
 * lib/ai/prompts —— 系统提示词与消息组装。
 *
 * 约定：模型只能「依据命盘解读」，不得改盘/编造；输出简体中文 + Markdown。
 */
import type { ZiweiChart } from '@/lib/ziwei/types';
import type { ChatMsg } from './magpie';
import { chartToContext } from './chart-context';

export const INTERPRET_SYSTEM_PROMPT = `你是一位精通倪海厦《天纪》体系的紫微斗数命理师，像面对面聊天一样为用户解读命盘。

对话风格（默认）：
1. 先给 1-2 句核心结论，再按需简短说明依据；只回答用户当前问到的点，不主动把无关宫位/维度一股脑倒出来。
2. 篇幅精简，除非用户要求展开；可用少量小标题或列表，但避免长篇固定模板。
3. 结尾可用一句话给出 1-2 个可继续追问的方向。
4. 当用户明确要求“完整解读 / 完整报告 / 按以下结构输出”时，才按其指定结构详细展开。

硬性规则：
- 只依据给定命盘数据，禁止自行增删星曜、修改星曜落宫或编造不存在的星曜/四化。
- 超出命盘能回答的范围，如实说明局限。
- 简体中文；命理专名首次出现可括注拼音或英文。
- 务实、不夸大、不宿命论；健康/投资/婚姻等只作参考，不替代专业意见。`;

export const HEMING_SYSTEM_PROMPT = `你是精通倪海厦《天纪》体系的紫微斗数合盘分析师。用户会提供甲、乙两人的完整命盘，请据此分析两人的合盘关系。

建议输出结构：
1. 两人各自命盘要点（性格、感情观、相处模式）各 3–5 条；
2. 缘分匹配度：综合命宫、夫妻宫、福德宫的主星/四化/三方四正互动给出总体评价；
3. 主要契合点与主要摩擦点；
4. 相处与经营建议；
5. 针对用户具体问题作答（如"适合合伙吗""结婚是否合适""财运是否互补"等）。

规则：
- 只依据给定命盘，禁止编造或改动星曜落宫；
- 简体中文、Markdown 排版；
- 先结论后依据，务实不宿命；重大决策提醒仅供参考。`;

type ClientMsg = { role: 'user' | 'assistant'; content: string };

/** 单盘解读：系统提示 + 命盘上下文 + 用户多轮消息 */
export function buildInterpretMessages(chart: ZiweiChart, messages: ClientMsg[]): ChatMsg[] {
  const context = chartToContext(chart);
  const dialogue: ChatMsg[] = messages
    .filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => ({ role: m.role, content: m.content }));

  return [
    { role: 'system', content: INTERPRET_SYSTEM_PROMPT },
    {
      role: 'system',
      content: `以下是求测者的紫微斗数命盘数据，请以此为准，不要改动任何星曜或落宫：\n\n${context}`,
    },
    ...dialogue,
  ];
}

/** 合盘分析：系统提示 + 两张命盘 + 问题 */
export function buildHemingMessages(
  chartA: ZiweiChart,
  chartB: ZiweiChart,
  question?: string,
): ChatMsg[] {
  const ctxA = chartToContext(chartA);
  const ctxB = chartToContext(chartB);
  const q = question?.trim() || '请分析两人合盘：整体缘分与匹配度、感情走向、相处要点与建议。';

  return [
    { role: 'system', content: HEMING_SYSTEM_PROMPT },
    { role: 'system', content: `【甲方命盘】\n${ctxA}` },
    { role: 'system', content: `【乙方命盘】\n${ctxB}` },
    { role: 'user', content: q },
  ];
}
