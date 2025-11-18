/**
 * Email Card Component
 * Displays email summary in list views
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SchoolEmail } from '@/types/email';
import { format } from 'date-fns';
import { Mail, MailOpen, Star, Paperclip, Calendar, User, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface EmailCardProps {
  email: SchoolEmail;
  onClick?: () => void;
}

export function EmailCard({ email, onClick }: EmailCardProps) {
  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'homework':
        return '📚';
      case 'event':
        return '📅';
      case 'permission':
        return '📝';
      case 'grade':
        return '📊';
      case 'behavior':
        return '⭐';
      case 'sports':
        return '⚽';
      case 'transportation':
        return '🚌';
      case 'fundraising':
        return '💰';
      default:
        return '📧';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'homework':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'event':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'permission':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'grade':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'behavior':
        return 'bg-pink-100 text-pink-700 border-pink-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const hasAttachments = (email.attachments as any)?.length > 0 || (email.attachments as any)?.count > 0;
  const hasActions = (email.actions as any)?.length > 0 || (email.actions as any)?.count > 0;
  const hasEvents = (email.event_associations as any)?.length > 0;
  const hasChildren = (email.child_relevance as any)?.length > 0;

  return (
    <Link href={`/emails/${email.id}`}>
      <Card
        className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${
          !email.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
        }`}
        onClick={onClick}
      >
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {email.is_read ? (
                <MailOpen className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
              ) : (
                <Mail className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`font-semibold truncate ${!email.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                    {email.subject}
                  </h3>
                  {email.is_starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />}
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {email.from_name || email.from_address}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500 shrink-0">
              {format(new Date(email.received_at), 'MMM d, h:mm a')}
            </span>
          </div>

          {/* Summary/Snippet */}
          {email.ai_summary ? (
            <p className="text-sm text-gray-600 line-clamp-2 pl-8">{email.ai_summary}</p>
          ) : (
            <p className="text-sm text-gray-500 line-clamp-2 pl-8 italic">{email.snippet}</p>
          )}

          {/* Badges & Metadata */}
          <div className="flex items-center gap-2 flex-wrap pl-8">
            {email.ai_category && (
              <Badge variant="outline" className={getCategoryColor(email.ai_category)}>
                {getCategoryIcon(email.ai_category)} {email.ai_category.replace('_', ' ')}
              </Badge>
            )}

            {email.ai_priority && (
              <Badge variant="outline" className={getPriorityColor(email.ai_priority)}>
                {email.ai_priority}
              </Badge>
            )}

            {email.ai_action_required && (
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                <AlertCircle className="h-3 w-3 mr-1" />
                Action Required
              </Badge>
            )}

            {hasAttachments && (
              <Badge variant="outline" className="bg-gray-100 text-gray-700">
                <Paperclip className="h-3 w-3 mr-1" />
                Attachments
              </Badge>
            )}

            {hasEvents && (
              <Badge variant="outline" className="bg-purple-100 text-purple-700">
                <Calendar className="h-3 w-3 mr-1" />
                Event
              </Badge>
            )}

            {hasChildren && (
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                <User className="h-3 w-3 mr-1" />
                {(email.child_relevance as any)?.[0]?.child?.name}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
