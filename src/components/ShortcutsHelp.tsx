'use client';

import { useEmailStore } from '@/store/emailStore';

const shortcuts = [
  { category: 'Navigation', items: [
    { key: 'J / ↓', desc: 'Next email' },
    { key: 'K / ↑', desc: 'Previous email' },
    { key: 'Enter', desc: 'Open email / Reply All' },
    { key: 'Tab', desc: 'Next split category' },
    { key: 'Shift+Tab', desc: 'Previous split category' },
    { key: 'Escape', desc: 'Go back / Close' },
  ]},
  { category: 'Actions', items: [
    { key: 'E', desc: 'Archive (Mark Done)' },
    { key: 'S', desc: 'Star / Unstar' },
    { key: 'H', desc: 'Snooze' },
    { key: '#', desc: 'Move to Trash' },
    { key: 'Z', desc: 'Undo last action' },
  ]},
  { category: 'Compose', items: [
    { key: 'C', desc: 'New email' },
    { key: 'R', desc: 'Reply' },
    { key: 'F', desc: 'Forward' },
    { key: '⌘+Enter', desc: 'Send email' },
  ]},
  { category: 'Other', items: [
    { key: '/', desc: 'Search' },
    { key: '⌘+K', desc: 'Command palette' },
    { key: '?', desc: 'This help' },
  ]},
];

export default function ShortcutsHelp() {
  const { isShortcutsHelpOpen, setShortcutsHelpOpen } = useEmailStore();

  if (!isShortcutsHelpOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShortcutsHelpOpen(false)} />
      <div className="relative bg-[#0f0f1a] border border-[#1e1e3a] rounded-xl shadow-2xl w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e3a]">
          <h2 className="text-base font-semibold text-white">Keyboard Shortcuts</h2>
          <button
            onClick={() => setShortcutsHelpOpen(false)}
            className="text-[#666688] hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-xs font-semibold text-[#6366f1] uppercase tracking-wider mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-sm text-[#8888aa]">{item.desc}</span>
                    <kbd className="px-2 py-0.5 text-[11px] bg-[#1a1a35] text-[#666688] rounded border border-[#2a2a4a] min-w-[40px] text-center">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
