/**
 * Email Detail Page
 * Shows full email content with AI analysis, associations, and actions
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SchoolEmail } from '@/types/email';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Star,
  Archive,
  Trash2,
  RefreshCw,
  Mail,
  Paperclip,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EmailDetailPage() {
  const router = useRouter();
  const params = useParams();
  const emailId = params.id as string;

  const [email, setEmail] = useState<SchoolEmail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadEmail();
  }, [emailId]);

  async function loadEmail() {
    try {
      const response = await fetch(`/api/email/messages/${emailId}`);
      const data = await response.json();

      if (response.ok) {
        setEmail(data.email);
        // Mark as read
        await fetch(`/api/email/messages/${emailId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_read: true }),
        });
      } else {
        toast.error('Failed to load email');
      }
    } catch (error) {
      console.error('Error loading email:', error);
      toast.error('Failed to load email');
    } finally {
      setLoading(false);
    }
  }

  async function toggleStar() {
    if (!email) return;

    try {
      const response = await fetch(`/api/email/messages/${emailId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_starred: !email.is_starred }),
      });

      if (response.ok) {
        setEmail({ ...email, is_starred: !email.is_starred });
        toast.success(email.is_starred ? 'Removed star' : 'Starred email');
      }
    } catch (error) {
      toast.error('Failed to update email');
    }
  }

  async function processWithAI() {
    try {
      setProcessing(true);
      const response = await fetch(`/api/email/messages/${emailId}/process`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setEmail(data.email);
        toast.success('Email processed successfully!');
      } else {
        toast.error('Failed to process email');
      }
    } catch (error) {
      console.error('Error processing email:', error);
      toast.error('Failed to process email');
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading email...</div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Email not found</p>
          <Button onClick={() => router.push('/emails')} className="mt-4">
            Back to Inbox
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/emails">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Inbox
            </Link>
          </Button>
        </div>

        {/* Email Card */}
        <Card className="p-6 mb-6">
          {/* Subject & Actions */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{email.subject}</h1>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={toggleStar}>
                <Star className={`h-4 w-4 ${email.is_starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={processWithAI} disabled={processing}>
                <RefreshCw className={`h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* From/To */}
          <div className="space-y-2 mb-4 pb-4 border-b">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-600">From:</span>
              <span className="text-gray-900">{email.from_name || email.from_address}</span>
              <span className="text-gray-500">({email.from_address})</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-600">Date:</span>
              <span className="text-gray-900">{format(new Date(email.received_at), 'MMMM d, yyyy h:mm a')}</span>
            </div>
          </div>

          {/* AI Analysis */}
          {email.ai_processed_at && (
            <div className="space-y-3 mb-4 pb-4 border-b">
              <h3 className="font-semibold text-gray-900">AI Analysis</h3>
              <div className="flex gap-2 flex-wrap">
                {email.ai_category && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-700">
                    Category: {email.ai_category.replace('_', ' ')}
                  </Badge>
                )}
                {email.ai_priority && (
                  <Badge variant="outline" className={
                    email.ai_priority === 'high' ? 'bg-red-100 text-red-700' :
                    email.ai_priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }>
                    Priority: {email.ai_priority}
                  </Badge>
                )}
                {email.ai_action_required && (
                  <Badge variant="outline" className="bg-red-100 text-red-700">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Action Required
                  </Badge>
                )}
                {email.ai_confidence_score && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-700">
                    Confidence: {Math.round(email.ai_confidence_score * 100)}%
                  </Badge>
                )}
              </div>
              {email.ai_summary && (
                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">{email.ai_summary}</p>
              )}
            </div>
          )}

          {/* Child Associations */}
          {email.child_relevance && (email.child_relevance as any).length > 0 && (
            <div className="space-y-2 mb-4 pb-4 border-b">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                Related Children
              </h3>
              <div className="flex gap-2 flex-wrap">
                {(email.child_relevance as any).map((rel: any) => (
                  <Badge key={rel.id} variant="outline" className="bg-purple-100 text-purple-700">
                    {rel.child?.name} ({rel.relevance_type})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Event Associations */}
          {email.event_associations && (email.event_associations as any).length > 0 && (
            <div className="space-y-2 mb-4 pb-4 border-b">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Related Events
              </h3>
              {(email.event_associations as any).map((assoc: any) => (
                <Card key={assoc.id} className="p-3 bg-purple-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{assoc.event?.title}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(assoc.event?.start_date), 'MMMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <Badge variant="outline">{assoc.association_type}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Actions */}
          {email.actions && (email.actions as any).length > 0 && (
            <div className="space-y-2 mb-4 pb-4 border-b">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Action Items
              </h3>
              {(email.actions as any).map((action: any) => (
                <Card key={action.id} className="p-3 bg-orange-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{action.action_text}</p>
                      {action.due_date && (
                        <p className="text-sm text-gray-600">
                          Due: {format(new Date(action.due_date), 'MMMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className={action.is_completed ? 'bg-green-100' : 'bg-red-100'}>
                      {action.is_completed ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Attachments */}
          {email.attachments && (email.attachments as any).length > 0 && (
            <div className="space-y-2 mb-4 pb-4 border-b">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Attachments
              </h3>
              <div className="space-y-2">
                {(email.attachments as any).map((att: any) => (
                  <Card key={att.id} className="p-3 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">{att.filename}</span>
                      <span className="text-xs text-gray-500">({(att.size_bytes / 1024).toFixed(1)} KB)</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Email Body */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Message</h3>
            {email.body_html ? (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: email.body_html }}
              />
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                {email.body_text}
              </pre>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
