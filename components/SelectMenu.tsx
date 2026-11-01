'use client';
/**
 * components/SelectMenu —— 轻量自定义下拉（可滚动、样式统一、跟随主题）。
 * 用于替换原生 <select>（原生下拉在长列表/暗色表单里样式不可控、且放大后很丑）。
 */
import { useEffect, useRef, useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export default function SelectMenu({
  value,
  options,
  onChange,
  placeholder = '请选择',
  disabled = false,
  style,
  errorColor = '#dc2626',
}: {
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  errorColor?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  // 打开时把当前选中项滚到可视区
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector('[data-selected="true"]') as HTMLElement | null;
    if (el) el.scrollIntoView({ block: 'center' });
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        style={{
          fontFamily: 'inherit',
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            opacity: selected ? 1 : 0.5,
          }}
        >
          {selected ? selected.label : placeholder}
        </span>
        <span style={{ fontSize: 10, opacity: 0.6, flexShrink: 0 }}>▾</span>
      </button>

      {open && !disabled && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 'calc(100% + 4px)',
            zIndex: 60,
            maxHeight: 240,
            overflowY: 'auto',
            background: 'var(--t-card, #1b2436)',
            border: '1px solid var(--t-border, rgba(255,255,255,0.15))',
            borderRadius: 12,
            padding: 4,
            boxShadow: '0 10px 28px rgba(0,0,0,0.30)',
          }}
        >
          {options.map((o) => {
            const on = o.value === value;
            return (
              <div
                key={o.value}
                data-selected={on ? 'true' : undefined}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                style={{
                  padding: '8px 10px',
                  fontSize: 13,
                  borderRadius: 8,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  color: on ? 'var(--t-gold, #d4a843)' : 'var(--t-text, #e8eef8)',
                  background: on ? 'rgba(212,168,67,0.12)' : 'transparent',
                }}
              >
                {o.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
