/**
 * Email List Component
 * Displays list of emails with filtering and search
 */

import { EmailCard } from './EmailCard';
import type { SchoolEmail } from '@/types/email';
import { Card } from '@/components/ui/card';
import { Inbox } from 'lucide-react';

interface EmailListProps {
  emails: SchoolEmail[];
  loading?: boolean;
  emptyMessage?: string;
}

export function EmailList({ emails, loading, emptyMessage = 'No emails found' }: EmailListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Inbox className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {emails.map((email) => (
        <EmailCard key={email.id} email={email} />
      ))}
    </div>
  );
}
