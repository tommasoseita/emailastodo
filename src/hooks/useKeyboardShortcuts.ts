'use client';

import { useEffect } from 'react';
import { useEmailStore } from '@/store/emailStore';
import { useEmails } from './useEmails';

export function useKeyboardShortcuts() {
  const store = useEmailStore();
  const { archiveEmail, starEmail, trashEmail, undoLastAction } = useEmails();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Always allow these shortcuts
      if (e.key === 'Escape') {
        if (store.isComposing) { store.setComposing(false); return; }
        if (store.isSearching) { store.setSearching(false); return; }
        if (store.isCommandPaletteOpen) { store.setCommandPaletteOpen(false); return; }
        if (store.isShortcutsHelpOpen) { store.setShortcutsHelpOpen(false); return; }
        if (store.isSnoozeOpen) { store.setSnoozeOpen(false); return; }
        if (store.selectedEmailId) { store.setSelectedEmailId(null); return; }
        return;
      }

      // Cmd+K — command palette (works everywhere)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        store.setCommandPaletteOpen(!store.isCommandPaletteOpen);
        return;
      }

      // Don't handle shortcuts when typing in inputs
      if (isInput) return;

      // Don't handle when modals are open
      if (store.isComposing || store.isCommandPaletteOpen || store.isSnoozeOpen) return;

      const currentEmails = store.getCurrentEmails();
      const selectedEmail = currentEmails.find((e) => e.id === store.selectedEmailId);

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault();
          store.moveSelection('down');
          break;

        case 'k':
        case 'ArrowUp':
          e.preventDefault();
          store.moveSelection('up');
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedEmail) {
            // If viewing email, reply all; otherwise open email
            if (store.selectedEmailId) {
              store.setReplyMode('replyAll', selectedEmail);
            }
          }
          break;

        case 'e':
          e.preventDefault();
          if (selectedEmail) archiveEmail(selectedEmail);
          break;

        case 's':
          e.preventDefault();
          if (selectedEmail) starEmail(selectedEmail);
          break;

        case 'r':
          e.preventDefault();
          if (selectedEmail) store.setReplyMode('reply', selectedEmail);
          break;

        case 'f':
          e.preventDefault();
          if (selectedEmail) store.setReplyMode('forward', selectedEmail);
          break;

        case 'c':
          e.preventDefault();
          store.setReplyMode(null);
          store.setComposing(true);
          break;

        case '#':
          e.preventDefault();
          if (selectedEmail) trashEmail(selectedEmail);
          break;

        case '/':
          e.preventDefault();
          store.setSearching(true);
          break;

        case 'h':
          e.preventDefault();
          if (selectedEmail) store.setSnoozeOpen(true);
          break;

        case 'z':
          e.preventDefault();
          undoLastAction();
          break;

        case '?':
          e.preventDefault();
          store.setShortcutsHelpOpen(!store.isShortcutsHelpOpen);
          break;

        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            store.cycleSplitCategory('prev');
          } else {
            store.cycleSplitCategory('next');
          }
          break;

        case 'u':
          e.preventDefault();
          // Toggle read/unread
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store, archiveEmail, starEmail, trashEmail, undoLastAction]);
}
