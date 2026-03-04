'use client';

import { useState, useEffect, useRef } from 'react';
import { useEmailStore } from '@/store/emailStore';

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
  category: string;
}

export default function CommandPalette() {
  const store = useEmailStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const commands: Command[] = [
    { id: 'compose', label: 'Compose new email', shortcut: 'C', category: 'Actions', action: () => { store.setComposing(true); store.setCommandPaletteOpen(false); } },
    { id: 'archive', label: 'Archive email', shortcut: 'E', category: 'Actions', action: () => store.setCommandPaletteOpen(false) },
    { id: 'star', label: 'Star / Unstar', shortcut: 'S', category: 'Actions', action: () => store.setCommandPaletteOpen(false) },
    { id: 'trash', label: 'Move to trash', shortcut: '#', category: 'Actions', action: () => store.setCommandPaletteOpen(false) },
    { id: 'reply', label: 'Reply', shortcut: 'R', category: 'Actions', action: () => store.setCommandPaletteOpen(false) },
    { id: 'forward', label: 'Forward', shortcut: 'F', category: 'Actions', action: () => store.setCommandPaletteOpen(false) },
    { id: 'snooze', label: 'Snooze email', shortcut: 'H', category: 'Actions', action: () => { store.setSnoozeOpen(true); store.setCommandPaletteOpen(false); } },
    { id: 'search', label: 'Search emails', shortcut: '/', category: 'Navigation', action: () => { store.setSearching(true); store.setCommandPaletteOpen(false); } },
    { id: 'undo', label: 'Undo last action', shortcut: 'Z', category: 'Actions', action: () => store.setCommandPaletteOpen(false) },
    { id: 'inbox', label: 'Go to Inbox', category: 'Navigation', action: () => { store.setCurrentFolder('inbox'); store.setCommandPaletteOpen(false); } },
    { id: 'starred', label: 'Go to Starred', category: 'Navigation', action: () => { store.setCurrentFolder('starred'); store.setCommandPaletteOpen(false); } },
    { id: 'sent', label: 'Go to Sent', category: 'Navigation', action: () => { store.setCurrentFolder('sent'); store.setCommandPaletteOpen(false); } },
    { id: 'drafts', label: 'Go to Drafts', category: 'Navigation', action: () => { store.setCurrentFolder('drafts'); store.setCommandPaletteOpen(false); } },
    { id: 'shortcuts', label: 'Show keyboard shortcuts', shortcut: '?', category: 'Help', action: () => { store.setShortcutsHelpOpen(true); store.setCommandPaletteOpen(false); } },
  ];

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  useEffect(() => {
    if (store.isCommandPaletteOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [store.isCommandPaletteOpen]);

  if (!store.isCommandPaletteOpen) return null;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIdx]) {
        filtered[selectedIdx].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      store.setCommandPaletteOpen(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onKeyDown={handleKeyDown}>
      <div className="absolute inset-0 bg-black/50" onClick={() => store.setCommandPaletteOpen(false)} />
      <div className="relative w-full max-w-[500px] bg-[#0f0f1a] border border-[#1e1e3a] rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e3a]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666688" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder-[#444466]"
            placeholder="Type a command..."
          />
        </div>

        {/* Commands */}
        <div className="max-h-[300px] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-[#444466]">No commands found</div>
          ) : (
            filtered.map((cmd, idx) => (
              <button
                key={cmd.id}
                onClick={() => cmd.action()}
                onMouseEnter={() => setSelectedIdx(idx)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                  idx === selectedIdx ? 'bg-[#1a1a35] text-white' : 'text-[#8888aa]'
                }`}
              >
                <span>{cmd.label}</span>
                {cmd.shortcut && (
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-[#1e1e3a] text-[#666688] rounded">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
