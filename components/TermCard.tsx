'use client';
/**
 * components/TermCard —— 术语释义小弹窗内容（配合点击命盘术语使用）。
 */
import type { TermInfo } from '@/lib/ziwei/glossary';

export default function TermCard({ info, onClose }: { info: TermInfo; onClose: () => void }) {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--t-gold, #d4a843)' }}>{info.title}</span>
          {info.tag && (
            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 999, border: '1px solid var(--t-border, #ddd)', color: 'var(--t-faint, #888)' }}>
              {info.tag}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--t-faint, #888)' }}
          aria-label="关闭"
        >
          ×
        </button>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.85, color: 'var(--t-text, #222)', margin: 0 }}>{info.meaning}</p>
      {info.source && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--t-border, #eee)', fontSize: 11, color: 'var(--t-faint, #888)' }}>
          依据：{info.source}
        </div>
      )}
    </div>
  );
}
