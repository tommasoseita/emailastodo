'use client';

import { useEmailStore } from '@/store/emailStore';
import { useEmails } from '@/hooks/useEmails';
import { SnoozeOption } from '@/types/email';

const snoozeOptions: SnoozeOption[] = [
  {
    label: 'Later today',
    getDate: () => {
      const d = new Date();
      d.setHours(d.getHours() + 3);
      return d;
    },
  },
  {
    label: 'This evening',
    getDate: () => {
      const d = new Date();
      d.setHours(18, 0, 0, 0);
      if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
      return d;
    },
  },
  {
    label: 'Tomorrow',
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(8, 0, 0, 0);
      return d;
    },
  },
  {
    label: 'This weekend',
    getDate: () => {
      const d = new Date();
      const dayOfWeek = d.getDay();
      const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
      d.setDate(d.getDate() + daysUntilSaturday);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
  {
    label: 'Next week',
    getDate: () => {
      const d = new Date();
      const dayOfWeek = d.getDay();
      const daysUntilMonday = (1 - dayOfWeek + 7) % 7 || 7;
      d.setDate(d.getDate() + daysUntilMonday);
      d.setHours(8, 0, 0, 0);
      return d;
    },
  },
  {
    label: 'In one month',
    getDate: () => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      d.setHours(8, 0, 0, 0);
      return d;
    },
  },
];

export default function SnoozePopover() {
  const { isSnoozeOpen, setSnoozeOpen, selectedEmailId, getCurrentEmails } = useEmailStore();
  const { snoozeEmail } = useEmails();

  if (!isSnoozeOpen || !selectedEmailId) return null;

  const currentEmails = getCurrentEmails();
  const email = currentEmails.find((e) => e.id === selectedEmailId);
  if (!email) return null;

  function handleSnooze(option: SnoozeOption) {
    snoozeEmail(email!, option.getDate());
    setSnoozeOpen(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => setSnoozeOpen(false)} />
      <div className="relative bg-[#0f0f1a] border border-[#1e1e3a] rounded-xl shadow-2xl w-[280px] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e1e3a]">
          <h3 className="text-sm font-medium text-white">Snooze until...</h3>
        </div>
        <div className="py-2">
          {snoozeOptions.map((option) => (
            <button
              key={option.label}
              onClick={() => handleSnooze(option)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[#8888aa] hover:text-white hover:bg-[#1a1a35] transition-colors"
            >
              <span>{option.label}</span>
              <span className="text-[11px] text-[#444466]">
                {option.getDate().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
