'use client';

import { useState, useRef, useEffect } from 'react';
import { useEmailStore } from '@/store/emailStore';
import { useEmails } from '@/hooks/useEmails';

export default function SearchBar() {
  const { isSearching, setSearching, setSearchQuery } = useEmailStore();
  const { searchEmails } = useEmails();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearching) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearching]);

  if (!isSearching) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(query);
    searchEmails(query);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setSearching(false);
      setSearchQuery('');
      searchEmails('');
    }
  }

  return (
    <div className="border-b border-[#1e1e3a] bg-[#0d0d1a]">
      <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666688" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder-[#444466]"
          placeholder="Search emails... (from: to: has:attachment)"
        />
        <button
          type="button"
          onClick={() => { setSearching(false); setSearchQuery(''); searchEmails(''); }}
          className="text-[#555577] hover:text-white text-xs"
        >
          ESC
        </button>
      </form>
    </div>
  );
}
