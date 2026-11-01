'use client';
/**
 * components/SavedChartMenu —— 「保存此盘 / 我的盘」菜单（纯前端 localStorage）。
 */
import { useEffect, useRef, useState } from 'react';
import type { BirthInfo } from '@/lib/ziwei/types';
import {
  loadSavedCharts,
  saveChart,
  deleteChart,
  defaultLabel,
  type SavedChart,
} from '@/lib/ziwei/saved-charts';

export default function SavedChartMenu({
  current,
  onPick,
}: {
  current?: BirthInfo;
  onPick: (b: BirthInfo) => void;
}) {
  const [list, setList] = useState<SavedChart[]>([]);
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setList(loadSavedCharts());
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const btnStyle: React.CSSProperties = {
    padding: '6px 12px',
    cursor: 'pointer',
    border: '1px solid #ccc',
    borderRadius: 8,
    background: 'transparent',
    fontSize: 12,
  };

  const doSave = () => {
    if (!current) return;
    const def = defaultLabel(current);
    const input = typeof window !== 'undefined' ? window.prompt('给这个盘起个名字：', def) : null;
    if (input === null) return; // 取消
    saveChart(input, current);
    setList(loadSavedCharts());
    setTip('已保存 ✓');
    setTimeout(() => setTip(''), 1500);
  };

  return (
    <div ref={boxRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {current && (
        <button type="button" style={btnStyle} onClick={doSave}>
          💾 保存此盘
        </button>
      )}
      <button type="button" style={btnStyle} onClick={() => setOpen((o) => !o)}>
        📂 已保存 ({list.length})
      </button>
      {tip && <span style={{ fontSize: 12, color: '#2e7d32' }}>{tip}</span>}

      {open && (
        <div
          style={{
            position: 'absolute',
            zIndex: 90,
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: 280,
            maxHeight: 300,
            overflowY: 'auto',
            background: '#fff',
            color: '#222',
            border: '1px solid #ddd',
            borderRadius: 10,
            boxShadow: '0 10px 28px rgba(0,0,0,0.15)',
            padding: 6,
          }}
        >
          {list.length === 0 && (
            <div style={{ padding: '10px 12px', fontSize: 12, color: '#888' }}>
              还没有保存的盘。起盘后点「💾 保存此盘」。
            </div>
          )}
          {list.map((item) => (
            <div
              key={item.id}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8 }}
            >
              <button
                type="button"
                onClick={() => {
                  onPick(item.birthInfo);
                  setOpen(false);
                }}
                title="载入这个盘"
                style={{ flex: 1, textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: '#222', padding: 0 }}
              >
                {item.label}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteChart(item.id);
                  setList(loadSavedCharts());
                }}
                title="删除"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, color: '#b02a37' }}
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
