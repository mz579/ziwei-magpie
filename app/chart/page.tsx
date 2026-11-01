'use client';
import { useState } from 'react';
import BirthForm from '@/components/BirthForm';
import ChartBoard from '@/components/ChartBoard';
import InsightPanel from '@/components/InsightPanel';
import TimeNav, { type TimeView } from '@/components/TimeNav';
import { generateChart } from '@/lib/ziwei/algorithm';
import SavedChartMenu from '@/components/SavedChartMenu';
import StarDetailPanel from '@/components/StarDetailPanel';
import TermCard from '@/components/TermCard';
import { getTermInfo, type TermInfo } from '@/lib/ziwei/glossary';
import type { BirthInfo, ZiweiChart, Palace, Star } from '@/lib/ziwei/types';

/**
 * 命盘页 —— 开源版「排盘引擎 Demo」
 *
 * 这是一个最小可运行示例：用本仓库的排盘引擎 generateChart() 配合基础 UI
 * 组件，渲染一张完整紫微命盘 + 基础解读，并支持本命 / 大限 / 流年切换。
 *
 * 说明：线上商业版的完整交互界面（重设计的新 UI、AI 流式解读、合盘、分享
 * 卡片等）不在开源范围内；但排盘内核——安星算法、四化、格局识别、古籍库——
 * 完全开放（见 lib/ziwei/*），可自由二次开发出你自己的界面。
 */
export default function ChartPage() {
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);
  const [view, setView] = useState<TimeView>('mingpan');
  const [liunianYear, setLiunianYear] = useState(() => new Date().getFullYear());

  // 术语释义弹窗
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const [starPalaceName, setStarPalaceName] = useState<string | undefined>(undefined);
  const [termInfo, setTermInfo] = useState<TermInfo | null>(null);
  const closeGlossary = () => { setSelectedStar(null); setTermInfo(null); };

  // 载入「我的盘」：用保存的出生信息重新排盘
  const handlePick = (b: BirthInfo) => {
    try {
      setChart(generateChart(b));
      setSelectedPalace(null);
    } catch (e) {
      if (typeof window !== 'undefined') {
        window.alert('该盘数据无法起盘：' + (e instanceof Error ? e.message : String(e)));
      }
    }
  };

  // ── 未起盘：展示出生信息表单 ──
  if (!chart) {
    return (
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>紫微斗数排盘</h1>
        <p style={{ color: '#888', marginBottom: 32, fontSize: 14, lineHeight: 1.7 }}>
          输入出生年月日时，开源排盘引擎即时生成命盘。
          <br />
          （本页为引擎 Demo，完整商业版界面不在开源范围；排盘内核完全开放。）
        </p>
        <div style={{ marginBottom: 16 }}>
          <SavedChartMenu onPick={handlePick} />
        </div>
        <BirthForm onSubmit={(info: BirthInfo) => setChart(generateChart(info))} />
      </main>
    );
  }

  // ── 已起盘：命盘 + 解读 ──
  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => { setChart(null); setSelectedPalace(null); }}
          style={{
            padding: '6px 14px', cursor: 'pointer',
            border: '1px solid #ccc', borderRadius: 8, background: 'transparent',
          }}
        >
          ← 重新起盘
        </button>
        <SavedChartMenu current={chart.birthInfo} onPick={handlePick} />
      </div>

      <TimeNav
        chart={chart}
        view={view}
        liunianYear={liunianYear}
        onViewChange={setView}
        onYearChange={setLiunianYear}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 380px)',
          gap: 20, marginTop: 16, alignItems: 'stretch',
          height: 'calc(100vh - 160px)', minHeight: 520,
        }}
      >
        <div style={{ height: '100%', minHeight: 0, overflowY: 'auto' }}>
          <ChartBoard
          chart={chart}
          onPalaceSelect={setSelectedPalace}
          onStarSelect={(star, palace) => { setSelectedStar(star); setStarPalaceName(palace.name); setTermInfo(null); }}
          onTermClick={(term) => { setTermInfo(getTermInfo(term)); setSelectedStar(null); }}
        />
        </div>
        <div style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
          <InsightPanel chart={chart} selectedPalace={selectedPalace} />
        </div>
      </div>

      {(selectedStar || termInfo) && (
        <div
          onClick={closeGlossary}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(92vw, 440px)', maxHeight: '82vh', overflow: 'auto', borderRadius: 16, background: 'var(--t-bg, #0b1020)', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
          >
            {selectedStar ? (
              <StarDetailPanel star={selectedStar} palaceName={starPalaceName} onClose={() => setSelectedStar(null)} />
            ) : termInfo ? (
              <TermCard info={termInfo} onClose={() => setTermInfo(null)} />
            ) : null}
          </div>
        </div>
      )}
    </main>
  );
}
