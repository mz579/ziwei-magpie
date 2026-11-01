'use client';
/**
 * components/ModelPicker —— 应用内模型切换器。
 *
 * 从 /api/models 拉取 magpie 模型列表，选中后 POST /api/ai-config 持久化（全局生效、无需重启）。
 * 键盘/下拉皆可；紧凑模式适配面板标题栏。
 */
import { useEffect, useState } from 'react';

export default function ModelPicker({ compact = true }: { compact?: boolean }) {
  const [models, setModels] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch('/api/models');
        const j = await r.json();
        if (!alive) return;
        setModels(Array.isArray(j.models) ? j.models : []);
        setCurrent(typeof j.current === 'string' ? j.current : '');
      } catch {
        /* 忽略 */
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = e.target.value;
    const prev = current;
    setCurrent(m);
    setSaving(true);
    setErr('');
    try {
      const r = await fetch('/api/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: m }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || '保存失败');
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
      setCurrent(prev); // 失败回滚
    } finally {
      setSaving(false);
    }
  };

  const list = current && !models.includes(current) ? [current, ...models] : models;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
      <span style={{ fontSize: 10, color: 'var(--t-faint, #888)', flexShrink: 0 }}>模型</span>
      <select
        value={current}
        onChange={onChange}
        disabled={saving || !loaded}
        title="切换 AI 模型（全局生效）"
        style={{
          fontSize: 10,
          maxWidth: compact ? 170 : 360,
          padding: '3px 6px',
          borderRadius: 6,
          border: '1px solid var(--t-border, #ccc)',
          background: 'var(--t-card, #fff)',
          color: 'var(--t-text, #111)',
          cursor: 'pointer',
        }}
      >
        {!current && <option value="">加载中…</option>}
        {list.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      {saving && <span style={{ fontSize: 10, color: 'var(--t-faint, #888)' }}>保存中…</span>}
      {err && <span style={{ fontSize: 10, color: '#e5484d' }}>{err}</span>}
    </div>
  );
}
