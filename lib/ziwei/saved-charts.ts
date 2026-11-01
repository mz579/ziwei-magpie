/**
 * lib/ziwei/saved-charts —— 「我的盘」本地保存（localStorage）。
 * 只保存出生信息 BirthInfo，载入时用本地排盘引擎重新生成命盘（结果与当时一致）。
 */
import type { BirthInfo } from './types';

export interface SavedChart {
  id: string;
  label: string;
  birthInfo: BirthInfo;
  createdAt: number;
}

const KEY = 'ziwei-saved-charts-v1';
const BRANCH_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export function defaultLabel(b: BirthInfo): string {
  const name = b.name ? `${b.name} · ` : '';
  const ymd = `${b.year}-${String(b.month).padStart(2, '0')}-${String(b.day).padStart(2, '0')}`;
  const shi = `${BRANCH_NAMES[b.hour] ?? ''}时`;
  return `${name}${ymd} ${shi} ${b.gender === 'male' ? '男' : '女'}`;
}

function persist(list: SavedChart[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* 忽略配额/隐私模式错误 */
  }
}

export function loadSavedCharts(): SavedChart[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? (arr as SavedChart[]) : [];
  } catch {
    return [];
  }
}

/** 保存一个盘；同一出生信息会更新（不重复堆积），新的排在最前 */
export function saveChart(label: string, birthInfo: BirthInfo): SavedChart {
  const list = loadSavedCharts();
  const signature = JSON.stringify(birthInfo);
  const item: SavedChart = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: label.trim() || defaultLabel(birthInfo),
    birthInfo,
    createdAt: Date.now(),
  };
  const next = [item, ...list.filter((x) => JSON.stringify(x.birthInfo) !== signature)];
  persist(next);
  return item;
}

export function deleteChart(id: string): void {
  persist(loadSavedCharts().filter((x) => x.id !== id));
}
