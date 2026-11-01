/**
 * lib/ziwei/glossary —— 命盘术语释义（供点击弹窗用）。
 * 星曜的详细解读在 components/StarDetailPanel（含倪师解读 + 古书原文）；
 * 这里补充「非星曜」的术语：四化、空宫、十二宫名、运限等。
 */
export interface TermInfo {
  title: string;
  tag?: string;
  meaning: string;
  source?: string;
}

const SRC = '《紫微斗数全书》体系通用定义（倪海厦《天纪》沿用）';

const SIHUA: Record<string, string> = {
  化禄: '主财禄、顺遂、人缘与享成，代表事情较容易得到好处与助力。',
  化权: '主权力、掌控、竞争与主导，偏向争取、扩张与承担责任。',
  化科: '主名声、文书、考试、清誉与贵人，利学术、名声与制度化的事。',
  化忌: '主阻碍、执着、欠缺与是非，需防纠纷、压力与反复。',
};

const PALACES: Record<string, string> = {
  命宫: '代表本人、先天气质与整体格局，是十二宫的核心。',
  兄弟: '兄弟姐妹、同辈与合伙关系。',
  夫妻: '配偶、感情与婚姻关系。',
  子女: '子女缘分，也看晚辈与桃花。',
  财帛: '赚钱方式、理财与物质来源。',
  疾厄: '健康、体质与易患疾病。',
  迁移: '外出、驿马、环境变动与在外的表现。',
  仆役: '朋友、同事、下属与人际助力（又称交友宫）。',
  交友: '朋友、同事、下属与人际助力（又称仆役宫）。',
  官禄: '事业、职业与工作表现（又称事业宫）。',
  事业: '事业、职业与工作表现（又称官禄宫）。',
  田宅: '不动产、家庭环境与储蓄。',
  福德: '精神享受、兴趣与福分。',
  父母: '父母、长辈与庇荫。',
};

const TERMS: Record<string, string> = {
  空宫: '该宫没有十四主星，称为「空宫」。解读时借对宫的主星来看，但权重稍弱，仍需合并三方四正综合判断。',
  借对宫: '空宫无主星时，借用对宫（对面的宫位）的主星作参考来看此宫。',
  大限: '十年一运的运势分段（本命大限），代表该阶段的人生主题与重心。',
  流年: '以当年干支所看的「一年运势」。',
  五行局: '依命宫干支的纳音定出「水二局 / 木三局 / 金四局 / 土五局 / 火六局」，用于起大限与安紫微星。',
  命主: '由命宫地支定出的本命主星，象征本命的核心气质。',
  身主: '由生年地支定出的身主星，偏后天的作为与表现。',
  身宫: '身宫代表后天（成年后）的作为与重心，与命宫一先一后，两宫合看更完整。',
  三方四正: '指本宫、对宫、以及两个三合宫，共四个宫位，合看吉凶与联动。',
  四化: '禄、权、科、忌四种能量变化，源自十天干「化星」，用来表现动态的吉凶走向。',
};

function normalize(t: string): string {
  return t.trim().replace(/[（(].*?[)）]/g, '').trim();
}

export function getTermInfo(raw: string): TermInfo {
  const t = normalize(raw);
  const sihuaKey = t.startsWith('化') ? t : `化${t}`;
  if (SIHUA[t]) return { title: t, tag: '四化', meaning: SIHUA[t], source: SRC };
  if (SIHUA[sihuaKey]) return { title: sihuaKey, tag: '四化', meaning: SIHUA[sihuaKey], source: SRC };
  if (PALACES[t]) return { title: t, tag: '宫位', meaning: PALACES[t], source: SRC };
  if (TERMS[t]) return { title: t, tag: '术语', meaning: TERMS[t], source: SRC };
  // 「土五局 / 木三局 …」等五行局
  if (/局$/.test(t)) {
    return { title: t, tag: '五行局', meaning: TERMS['五行局'], source: SRC };
  }
  // 「XX宫」→ 去掉「宫」再匹配（如 财帛宫 → 财帛）
  if (t.endsWith('宫') && PALACES[t.slice(0, -1)]) {
    const k = t.slice(0, -1);
    return { title: t, tag: '宫位', meaning: PALACES[k], source: SRC };
  }
  return { title: t, tag: '术语', meaning: '暂无释义。', source: '' };
}
