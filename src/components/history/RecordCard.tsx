'use client';

import { useState } from 'react';
import type { Record, Category } from '@/types';
import { CATEGORIES } from '@/types';
import { formatTime } from '@/lib/utils';
import CategoryTag from '@/components/chat/CategoryTag';

interface RecordCardProps {
  record: Record;
  rotation: number;
  onClick?: () => void;
  onDelete?: (id: number) => void;
  onEdit?: (id: number, content: string) => void;
  onCategoriesChange?: (id: number, categories: Category[]) => void;
}

export default function RecordCard({ record, rotation, onClick, onDelete, onEdit, onCategoriesChange }: RecordCardProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(record.content);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingCategories, setEditingCategories] = useState(false);

  const toggleCategory = (cat: Category) => {
    if (!onCategoriesChange || record.id == null) return;
    const current = record.categories;
    const updated = current.includes(cat)
      ? current.filter(c => c !== cat)
      : [...current, cat];
    onCategoriesChange(record.id, updated);
  };

  const preview = record.content.length > 120
    ? record.content.slice(0, 120) + '...'
    : record.content;

  const handleSave = () => {
    if (editText.trim() && onEdit && record.id != null) {
      onEdit(record.id, editText.trim());
    }
    setEditing(false);
  };

  const handleDelete = () => {
    if (confirmDelete && onDelete && record.id != null) {
      onDelete(record.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      onClick={onClick}
      className="p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-slide-up relative group"
      style={{
        transform: `rotate(${rotation}deg)`,
        background: 'rgba(255,255,255,0.35)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: '0 2px 12px rgba(255,20,147,0.06)',
      }}
    >
      {/* Action buttons — visible on hover */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
           onClick={e => e.stopPropagation()}>
        <button
          onClick={(e) => { e.stopPropagation(); setEditing(!editing); setEditText(record.content); }}
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.1)' }}
          title="编辑"
        >✎</button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all hover:scale-110 ${
            confirmDelete ? 'bg-red-400 text-white' : ''
          }`}
          style={{ background: confirmDelete ? undefined : 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.1)' }}
          title={confirmDelete ? '确认删除' : '删除'}
        >{confirmDelete ? '!' : '✕'}</button>
      </div>

      {/* Time */}
      <p className="text-[10px] text-[var(--text-secondary)] opacity-60 mb-2">
        {formatTime(record.timestamp)}
      </p>

      {/* Content — edit mode or preview */}
      {editing ? (
        <div onClick={e => e.stopPropagation()}>
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            className="w-full resize-none bg-white/50 rounded-lg p-2 text-sm text-[var(--text-primary)] border border-[var(--pink-blush)] outline-none mb-2"
            rows={3}
          />
          <div className="flex gap-1">
            <button onClick={handleSave}
                    className="px-3 py-1 rounded-full text-xs text-white"
                    style={{ background: 'var(--pink-barbie)' }}>保存</button>
            <button onClick={() => setEditing(false)}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{ background: 'rgba(0,0,0,0.1)' }}>取消</button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-3">{preview}</p>
      )}

      {/* Categories — click to toggle picker */}
      <div className="flex flex-wrap gap-1 items-center" onClick={e => e.stopPropagation()}>
        {record.categories.map(cat => (
          <CategoryTag key={cat} category={cat} size="sm" />
        ))}
        <button
          onClick={() => setEditingCategories(!editingCategories)}
          className="text-[10px] px-1.5 py-0.5 rounded-full transition-colors"
          style={{
            background: editingCategories ? 'var(--pink-barbie)' : 'rgba(255,255,255,0.5)',
            color: editingCategories ? 'white' : 'var(--text-secondary)',
            border: '1px solid rgba(255,20,147,0.15)',
          }}
        >
          {editingCategories ? '收起' : '+ 分类'}
        </button>
      </div>

      {/* Category picker */}
      {editingCategories && (
        <div className="mt-2 flex flex-wrap gap-1 animate-fade-in" onClick={e => e.stopPropagation()}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className="text-[11px] px-2 py-0.5 rounded-full transition-all"
              style={{
                background: record.categories.includes(cat) ? 'var(--pink-barbie)' : 'rgba(255,255,255,0.4)',
                color: record.categories.includes(cat) ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${record.categories.includes(cat) ? 'transparent' : 'rgba(255,20,147,0.15)'}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
