/**
 * lib/ai/chart-context —— 把 ZiweiChart 序列化成「给大模型看的」紧凑结构化文本。
 *
 * 目标：只保留解读真正需要的字段（宫位/主星/辅星/亮度/四化/自化/大限/格局），
 * 避免把整坨 JSON 硬塞给模型（省 token、提升稳定性）。
 *
 * 说明：本文件只做「数据 → 文本」，不含任何模型调用，属纯函数，便于测试。
 */
import type { ZiweiChart, Palace, Star } from '@/lib/ziwei/types';
import { STEMS, BRANCHES } from '@/lib/ziwei/constants';
import { detectPatterns, getMingGongSummary } from '@/lib/ziwei/patterns';

function starText(s: Star): string {
  const bright = s.brightnessRaw ? `(${s.brightnessRaw})` : '';
  const hua = s.siHua ? `化${s.siHua}` : '';
  return `${s.name}${bright}${hua}`;
}

function palaceText(p: Palace): string {
  const dizhi = BRANCHES[p.branch] ?? '?';
  const tiangan = STEMS[p.stem] ?? '?';

  let stars: string;
  if (p.stars.length > 0) {
    stars = p.stars.map(starText).join('、');
  } else if (p.borrowedStars && p.borrowedStars.length > 0) {
    stars = `空宫(借${p.borrowedFromName ?? '对宫'}：${p.borrowedStars.join('、')})`;
  } else {
    stars = '空宫';
  }

  const self =
    p.selfSihua && p.selfSihua.length > 0
      ? `｜自化:${p.selfSihua.map((x) => `${x.starName}化${x.siHua}`).join('、')}`
      : '';

  return `${p.name}(${dizhi}·${tiangan})：${stars}${self}`;
}

/**
 * 把完整命盘转换成一段可读文本，作为系统上下文喂给模型。
 */
export function chartToContext(chart: ZiweiChart): string {
  const b = chart.birthInfo;
  const lines: string[] = [];

  lines.push('【基本信息】');
  lines.push(
    `性别：${b.gender === 'male' ? '男' : '女'}` +
      (chart.yinYangGender ? `（${chart.yinYangGender}）` : ''),
  );
  lines.push(
    `公历生日：${b.year}-${String(b.month).padStart(2, '0')}-${String(b.day).padStart(2, '0')} ` +
      `${BRANCHES[b.hour] ?? ''}时`,
  );
  if (b.city) lines.push(`出生地：${b.province ?? ''}${b.city}`);
  if (chart.lunarInfo?.fourPillars?.length) {
    lines.push(`四柱：${chart.lunarInfo.fourPillars.join(' ')}`);
  }
  lines.push(`五行局：${chart.wuxingJuName}`);
  lines.push(`命主：${chart.mingZhu ?? '—'}；身主：${chart.shenZhu ?? '—'}`);
  lines.push(`命宫地支：${BRANCHES[chart.mingGongBranch]}；身宫地支：${BRANCHES[chart.shenGongBranch]}`);

  const ming = getMingGongSummary(chart);
  if (ming.stars.length > 0) {
    lines.push(
      `命宫主星：${ming.stars.join('、')}` +
        (ming.nature ? `（${ming.nature}）` : '') +
        (ming.keywords.length ? `；关键词：${ming.keywords.join('、')}` : ''),
    );
  }

  lines.push('', '【十二宫】');
  for (const p of chart.palaces) lines.push(palaceText(p));

  const patterns = detectPatterns(chart);
  if (patterns.length > 0) {
    lines.push('', '【已成立格局】');
    for (const p of patterns.slice(0, 20)) {
      lines.push(`· ${p.name}（${p.level}）：${p.description}`);
    }
  }

  if (chart.daXians?.length) {
    lines.push('', '【大限】');
    for (const d of chart.daXians) {
      const stem = d.stemName ? `(${d.stemName}干)` : '';
      const si = d.siHua
        ? `｜四化 禄:${d.siHua.lu} 权:${d.siHua.quan} 科:${d.siHua.ke} 忌:${d.siHua.ji}`
        : '';
      lines.push(`· ${d.startAge}-${d.endAge}岁 ${d.palaceName}${stem}${si}`);
    }
    if (typeof chart.currentAge === 'number') {
      const idx = typeof chart.currentDaXianIndex === 'number' ? chart.currentDaXianIndex + 1 : '—';
      lines.push(`当前年龄：${chart.currentAge}岁（第 ${idx} 个大限）`);
    }
  }

  return lines.join('\n');
}
