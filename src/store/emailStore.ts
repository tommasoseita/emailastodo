'use client';

import { create } from 'zustand';
import { Email, Folder, SplitCategory, UndoAction } from '@/types/email';
import { classifyEmails } from '@/lib/classify';

interface EmailStore {
  // Email data
  emails: Email[];
  classifiedEmails: Record<SplitCategory, Email[]>;
  selectedEmailId: string | null;
  selectedIndex: number;

  // Navigation
  currentFolder: Folder;
  currentSplitCategory: SplitCategory;

  // UI State
  isComposing: boolean;
  isSearching: boolean;
  isCommandPaletteOpen: boolean;
  isShortcutsHelpOpen: boolean;
  isSnoozeOpen: boolean;
  searchQuery: string;
  isLoading: boolean;
  toastMessage: string | null;

  // Reply/Forward state
  replyTo: Email | null;
  replyMode: 'reply' | 'replyAll' | 'forward' | null;

  // Undo
  undoStack: UndoAction[];

  // Actions
  setEmails: (emails: Email[]) => void;
  setSelectedEmailId: (id: string | null) => void;
  setSelectedIndex: (index: number) => void;
  moveSelection: (direction: 'up' | 'down') => void;
  setCurrentFolder: (folder: Folder) => void;
  setCurrentSplitCategory: (category: SplitCategory) => void;
  cycleSplitCategory: (direction: 'next' | 'prev') => void;
  setComposing: (isComposing: boolean) => void;
  setSearching: (isSearching: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setShortcutsHelpOpen: (open: boolean) => void;
  setSnoozeOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  showToast: (message: string) => void;
  setReplyMode: (mode: 'reply' | 'replyAll' | 'forward' | null, email?: Email) => void;
  pushUndo: (action: UndoAction) => void;
  popUndo: () => UndoAction | undefined;
  removeEmail: (id: string) => void;
  updateEmail: (id: string, updates: Partial<Email>) => void;
  getCurrentEmails: () => Email[];
}

const SPLIT_CATEGORIES: SplitCategory[] = ['important', 'notifications', 'newsletters', 'other'];

export const useEmailStore = create<EmailStore>((set, get) => ({
  emails: [],
  classifiedEmails: { important: [], notifications: [], newsletters: [], other: [] },
  selectedEmailId: null,
  selectedIndex: 0,
  currentFolder: 'inbox',
  currentSplitCategory: 'important',
  isComposing: false,
  isSearching: false,
  isCommandPaletteOpen: false,
  isShortcutsHelpOpen: false,
  isSnoozeOpen: false,
  searchQuery: '',
  isLoading: false,
  toastMessage: null,
  replyTo: null,
  replyMode: null,
  undoStack: [],

  setEmails: (emails) => {
    const classified = classifyEmails(emails);
    set({ emails, classifiedEmails: classified });
  },

  setSelectedEmailId: (id) => set({ selectedEmailId: id }),

  setSelectedIndex: (index) => {
    const currentEmails = get().getCurrentEmails();
    const clampedIndex = Math.max(0, Math.min(index, currentEmails.length - 1));
    const email = currentEmails[clampedIndex];
    set({ selectedIndex: clampedIndex, selectedEmailId: email?.id || null });
  },

  moveSelection: (direction) => {
    const { selectedIndex } = get();
    const currentEmails = get().getCurrentEmails();
    const newIndex = direction === 'down'
      ? Math.min(selectedIndex + 1, currentEmails.length - 1)
      : Math.max(selectedIndex - 1, 0);
    const email = currentEmails[newIndex];
    set({ selectedIndex: newIndex, selectedEmailId: email?.id || null });
  },

  setCurrentFolder: (folder) => set({ currentFolder: folder, selectedIndex: 0, selectedEmailId: null }),

  setCurrentSplitCategory: (category) => {
    set({ currentSplitCategory: category, selectedIndex: 0, selectedEmailId: null });
  },

  cycleSplitCategory: (direction) => {
    const { currentSplitCategory } = get();
    const currentIdx = SPLIT_CATEGORIES.indexOf(currentSplitCategory);
    const newIdx = direction === 'next'
      ? (currentIdx + 1) % SPLIT_CATEGORIES.length
      : (currentIdx - 1 + SPLIT_CATEGORIES.length) % SPLIT_CATEGORIES.length;
    set({ currentSplitCategory: SPLIT_CATEGORIES[newIdx], selectedIndex: 0, selectedEmailId: null });
  },

  setComposing: (isComposing) => set({ isComposing, replyTo: isComposing ? get().replyTo : null, replyMode: isComposing ? get().replyMode : null }),
  setSearching: (isSearching) => set({ isSearching }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setShortcutsHelpOpen: (open) => set({ isShortcutsHelpOpen: open }),
  setSnoozeOpen: (open) => set({ isSnoozeOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLoading: (loading) => set({ isLoading: loading }),

  showToast: (message) => {
    set({ toastMessage: message });
    setTimeout(() => set({ toastMessage: null }), 3000);
  },

  setReplyMode: (mode, email) => {
    if (mode && email) {
      set({ replyMode: mode, replyTo: email, isComposing: true });
    } else {
      set({ replyMode: null, replyTo: null });
    }
  },

  pushUndo: (action) => {
    set((state) => ({ undoStack: [...state.undoStack, action] }));
  },

  popUndo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return undefined;
    const action = undoStack[undoStack.length - 1];
    set({ undoStack: undoStack.slice(0, -1) });
    return action;
  },

  removeEmail: (id) => {
    set((state) => {
      const emails = state.emails.filter((e) => e.id !== id);
      const classified = classifyEmails(emails);
      return { emails, classifiedEmails: classified };
    });
  },

  updateEmail: (id, updates) => {
    set((state) => {
      const emails = state.emails.map((e) => (e.id === id ? { ...e, ...updates } : e));
      const classified = classifyEmails(emails);
      return { emails, classifiedEmails: classified };
    });
  },

  getCurrentEmails: () => {
    const { currentFolder, currentSplitCategory, classifiedEmails, emails } = get();
    if (currentFolder === 'inbox') {
      return classifiedEmails[currentSplitCategory] || [];
    }
    const labelMap: Record<string, string> = {
      starred: 'STARRED',
      sent: 'SENT',
      drafts: 'DRAFT',
      trash: 'TRASH',
    };
    const label = labelMap[currentFolder];
    if (label) {
      return emails.filter((e) => e.labels.includes(label));
    }
    return emails;
  },
}));
