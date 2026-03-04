'use client';

import EmailList from '@/components/EmailList';
import EmailView from '@/components/EmailView';
import SearchBar from '@/components/SearchBar';
import { useEmailStore } from '@/store/emailStore';

export default function MailPage() {
  const { isSearching } = useEmailStore();

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-col">
        {isSearching && <SearchBar />}
        <div className="flex-1 overflow-hidden">
          <EmailList />
        </div>
      </div>
      <EmailView />
    </div>
  );
}
