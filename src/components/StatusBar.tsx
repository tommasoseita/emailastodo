'use client';

import { useEmailStore } from '@/store/emailStore';

export default function StatusBar() {
  const { toastMessage, selectedEmailId, isLoading } = useEmailStore();

  const contextualShortcuts = selectedEmailId
    ? [
        { key: 'E', label: 'Archive' },
        { key: 'S', label: 'Star' },
        { key: 'R', label: 'Reply' },
        { key: 'F', label: 'Forward' },
        { key: 'H', label: 'Snooze' },
        { key: '#', label: 'Trash' },
      ]
    : [
        { key: 'J/K', label: 'Navigate' },
        { key: 'C', label: 'Compose' },
        { key: '/', label: 'Search' },
        { key: '⌘K', label: 'Commands' },
      ];

  return (
    <div className="h-8 min-h-[32px] bg-[#0a0a15] border-t border-[#1e1e3a] flex items-center justify-between px-4">
      {/* Toast / Loading */}
      <div className="flex items-center gap-2">
        {toastMessage ? (
          <span className="text-xs text-[#6366f1] font-medium animate-pulse">{toastMessage}</span>
        ) : isLoading ? (
          <span className="text-xs text-[#444466]">Loading...</span>
        ) : (
          <span className="text-xs text-[#333355]">Ready</span>
        )}
      </div>

      {/* Contextual Shortcuts */}
      <div className="flex items-center gap-3">
        {contextualShortcuts.map((s) => (
          <div key={s.key} className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 text-[9px] bg-[#1a1a35] text-[#555577] rounded">{s.key}</kbd>
            <span className="text-[10px] text-[#333355]">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
