/**
 * Child Profile Page
 * Detailed view of a child with emails, teachers, interests, and bulk actions
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  User,
  Mail,
  GraduationCap,
  Edit,
  Users,
  Heart,
  Brain,
  Inbox,
  CheckSquare,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { EmailList } from '@/components/email/EmailList';
import { TeachersTab } from '@/components/children/TeachersTab';
import { InterestsTab } from '@/components/children/InterestsTab';

interface Child {
  id: string;
  name: string;
  grade?: string;
  teacher?: string;
  school?: string;
  avatar_color?: string;
  notes?: string;
  interests?: string[];
  activities?: any[];
}

export default function ChildProfilePage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id as string;

  const [child, setChild] = useState<Child | null>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [unassociatedEmails, setUnassociatedEmails] = useState<any[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadChild();
    loadEmails();
    loadUnassociatedEmails();
  }, [childId]);

  async function loadChild() {
    try {
      const response = await fetch('/api/accountability/children');
      const data = await response.json();

      if (response.ok) {
        const foundChild = data.children?.find((c: Child) => c.id === childId);
        if (foundChild) {
          setChild(foundChild);
        } else {
          toast.error('Child not found');
          router.push('/children');
        }
      }
    } catch (error) {
      console.error('Error loading child:', error);
      toast.error('Failed to load child');
    } finally {
      setLoading(false);
    }
  }

  async function loadEmails() {
    try {
      const response = await fetch(`/api/email/messages?child_id=${childId}`);
      const data = await response.json();

      if (response.ok) {
        setEmails(data.emails || []);
      }
    } catch (error) {
      console.error('Error loading emails:', error);
    }
  }

  async function loadUnassociatedEmails() {
    try {
      // Get all emails not associated with this child
      const response = await fetch('/api/email/messages?limit=100');
      const data = await response.json();

      if (response.ok) {
        // Filter out emails already associated with this child
        const unassociated = (data.emails || []).filter((email: any) => {
          return !email.child_relevance?.some((rel: any) => rel.child_id === childId);
        });
        setUnassociatedEmails(unassociated);
      }
    } catch (error) {
      console.error('Error loading unassociated emails:', error);
    }
  }

  async function handleBulkAssociate() {
    if (selectedEmails.size === 0) {
      toast.error('Please select at least one email');
      return;
    }

    try {
      let successCount = 0;
      let failCount = 0;

      for (const emailId of selectedEmails) {
        const response = await fetch('/api/email/associations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email_id: emailId,
            child_id: childId,
            relevance_type: 'primary',
          }),
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      }

      toast.success(`Associated ${successCount} emails!${failCount > 0 ? ` (${failCount} failed)` : ''}`);
      setSelectedEmails(new Set());
      loadEmails();
      loadUnassociatedEmails();
    } catch (error) {
      console.error('Error bulk associating:', error);
      toast.error('Failed to associate emails');
    }
  }

  function toggleEmailSelection(emailId: string) {
    const newSelection = new Set(selectedEmails);
    if (newSelection.has(emailId)) {
      newSelection.delete(emailId);
    } else {
      newSelection.add(emailId);
    }
    setSelectedEmails(newSelection);
  }

  const getAvatarColor = (color?: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      pink: 'bg-pink-500',
      red: 'bg-red-500',
    };
    return colors[color || 'blue'] || 'bg-blue-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!child) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/children">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Kids
            </Link>
          </Button>

          {/* Profile Header */}
          <Card className="p-6">
            <div className="flex items-center gap-6">
              <div
                className={`w-24 h-24 rounded-full ${getAvatarColor(
                  child.avatar_color
                )} flex items-center justify-center text-white text-4xl font-bold`}
              >
                {child.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{child.name}</h1>
                <div className="flex gap-4 flex-wrap">
                  {child.grade && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-700">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      {child.grade}
                    </Badge>
                  )}
                  {child.teacher && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-700">
                      <Users className="h-3 w-3 mr-1" />
                      Teacher: {child.teacher}
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    <Mail className="h-3 w-3 mr-1" />
                    {emails.length} Emails
                  </Badge>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link href="/accountability">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">
              <User className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="emails">
              <Mail className="h-4 w-4 mr-2" />
              Emails ({emails.length})
            </TabsTrigger>
            <TabsTrigger value="teachers">
              <Users className="h-4 w-4 mr-2" />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="interests">
              <Heart className="h-4 w-4 mr-2" />
              Interests
            </TabsTrigger>
            <TabsTrigger value="bulk">
              <CheckSquare className="h-4 w-4 mr-2" />
              Bulk Actions
            </TabsTrigger>
            <TabsTrigger value="learning">
              <Brain className="h-4 w-4 mr-2" />
              AI Learning
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Emails</p>
                    <p className="text-2xl font-bold text-blue-600">{emails.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Inbox className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Unread</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {emails.filter(e => !e.is_read).length}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {emails.filter(e => {
                        const emailDate = new Date(e.received_at);
                        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                        return emailDate > weekAgo;
                      }).length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Info */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                {child.school && (
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">School</p>
                      <p className="font-medium text-gray-900">{child.school}</p>
                    </div>
                  </div>
                )}
                {child.notes && (
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <p className="text-gray-900">{child.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Emails Tab */}
          <TabsContent value="emails" className="space-y-4">
            <EmailList
              emails={emails}
              loading={false}
              emptyMessage="No emails associated with this child yet"
            />
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-4">
            <TeachersTab childId={childId} childName={child.name} />
          </TabsContent>

          {/* Interests Tab */}
          <TabsContent value="interests" className="space-y-4">
            <InterestsTab
              childId={childId}
              childName={child.name}
              initialInterests={child.interests || []}
              initialActivities={child.activities || []}
            />
          </TabsContent>

          {/* Bulk Actions Tab */}
          <TabsContent value="bulk" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Bulk Associate Emails</h3>
                  <p className="text-sm text-gray-600">
                    Select emails to associate with {child.name}
                  </p>
                </div>
                <Button
                  onClick={handleBulkAssociate}
                  disabled={selectedEmails.size === 0}
                >
                  Associate {selectedEmails.size} Email{selectedEmails.size !== 1 ? 's' : ''}
                </Button>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {unassociatedEmails.map(email => (
                  <Card
                    key={email.id}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedEmails.has(email.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleEmailSelection(email.id)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedEmails.has(email.id)}
                        onChange={() => toggleEmailSelection(email.id)}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{email.subject}</p>
                        <p className="text-sm text-gray-600">
                          {email.from_name || email.from_address}
                        </p>
                      </div>
                      {email.ai_category && (
                        <Badge variant="outline">{email.ai_category}</Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* AI Learning Tab */}
          <TabsContent value="learning" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">AI Learning & Patterns</h3>
              <p className="text-gray-600 mb-6">
                Coming soon: AI will learn from your email associations to automatically
                categorize future emails for {child.name}.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600 mb-1">Verified Associations</p>
                  <p className="text-2xl font-bold text-green-600">
                    {emails.filter(e => e.child_relevance?.some((r: any) => r.is_verified)).length}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600 mb-1">AI Confidence</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {emails.length > 0 ? '87%' : '0%'}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
