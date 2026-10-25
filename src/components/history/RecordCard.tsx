'use client';

import { useState, useEffect, useRef } from 'react';
import type { Record, Category } from '@/types';
import { CATEGORIES } from '@/types';
import { formatTime } from '@/lib/utils';
import CategoryTag from '@/components/chat/CategoryTag';

interface RecordCardProps {
  record: Record;
  rotation?: number;
  onClick?: () => void;
  onDelete?: (id: number) => void;
  onEdit?: (id: number, content: string) => void;
  onCategoriesChange?: (id: number, categories: Category[]) => void;
}

export default function RecordCard({ record, onDelete, onEdit, onCategoriesChange }: RecordCardProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(record.content);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingCategories, setEditingCategories] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (deleteTimer.current) clearTimeout(deleteTimer.current); }, []);
  const toggleCategory = (category: Category) => {
    if (record.id == null) return;
    const categories = record.categories.includes(category) ? record.categories.filter(value => value !== category) : [...record.categories, category];
    onCategoriesChange?.(record.id, categories);
  };
  const saveEdit = () => {
    if (editText.trim() && record.id != null) onEdit?.(record.id, editText.trim());
    setEditing(false);
  };
  const deleteRecord = () => {
    if (confirmDelete && record.id != null) onDelete?.(record.id);
    else {
      setConfirmDelete(true);
      deleteTimer.current = setTimeout(() => setConfirmDelete(false), 3000);
    }
  };
  const longRecord = record.content.length > 180;
  return (
    <article className="record-card animate-slide-up">
      <div className="record-meta">
        <time dateTime={new Date(record.timestamp).toISOString()}>{formatTime(record.timestamp)}</time>
        <div className="message-actions">
          <button className="mini-button" onClick={() => { setEditing(!editing); setEditText(record.content); }} aria-label="编辑记录">编辑</button>
          <button className="mini-button" onClick={deleteRecord} aria-label={confirmDelete ? '确认删除记录' : '删除记录'}>{confirmDelete ? '确认删除？' : '删除'}</button>
        </div>
      </div>
      {editing ? (
        <div className="mb-4">
          <textarea className="message-edit" value={editText} onChange={(event) => setEditText(event.target.value)} aria-label="记录内容" rows={4} autoFocus />
          <div className="message-actions mt-2"><button className="mini-button" onClick={saveEdit}>保存</button><button className="mini-button" onClick={() => setEditing(false)}>取消</button></div>
        </div>
      ) : (
        <div>
          <p className="record-text">{expanded || !longRecord ? record.content : `${record.content.slice(0, 180)}…`}</p>
          {longRecord && <button className="mini-button mb-4" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>{expanded ? '收起' : '阅读全文 ↗'}</button>}
        </div>
      )}
      <div className="record-tags">
        {record.categories.map(category => <CategoryTag key={category} category={category} />)}
        <button className="category-pill" onClick={() => setEditingCategories(!editingCategories)} aria-expanded={editingCategories}>{editingCategories ? '收起分类 −' : '分类 +'}</button>
      </div>
      {editingCategories && <div className="record-tags record-category-picker" role="group" aria-label="编辑记录分类">{CATEGORIES.map(category => <CategoryTag key={category} category={category} selected={record.categories.includes(category)} onClick={() => toggleCategory(category)} />)}</div>}
    </article>
  );
}
