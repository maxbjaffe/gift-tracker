/**
 * Children Management Page
 * Main hub for managing kids, their profiles, emails, and learning
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, GraduationCap, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Child {
  id: string;
  name: string;
  grade?: string;
  teacher?: string;
  school?: string;
  avatar_color?: string;
  notes?: string;
  created_at: string;
}

interface ChildStats {
  id: string;
  emailCount: number;
  unreadCount: number;
  recentEmails: any[];
}

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [stats, setStats] = useState<Record<string, ChildStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  async function loadChildren() {
    try {
      const response = await fetch('/api/accountability/children');
      const data = await response.json();

      if (response.ok) {
        setChildren(data.children || []);
        // Load stats for each child
        loadStats(data.children || []);
      } else {
        toast.error('Failed to load children');
      }
    } catch (error) {
      console.error('Error loading children:', error);
      toast.error('Failed to load children');
    } finally {
      setLoading(false);
    }
  }

  async function loadStats(children: Child[]) {
    try {
      const statsMap: Record<string, ChildStats> = {};

      for (const child of children) {
        const response = await fetch(`/api/children/${child.id}/stats`);
        if (response.ok) {
          const data = await response.json();
          statsMap[child.id] = data;
        }
      }

      setStats(statsMap);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
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
        <div className="text-lg text-gray-600">Loading children...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Kids
              </h1>
              <p className="text-gray-600 mt-1">
                Manage profiles, emails, teachers, and activities
              </p>
            </div>
            <Button asChild>
              <Link href="/accountability">
                <Plus className="h-4 w-4 mr-2" />
                Add Child
              </Link>
            </Button>
          </div>
        </div>

        {/* Children Grid */}
        {children.length === 0 ? (
          <Card className="p-12 text-center">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No children added yet</p>
            <p className="text-gray-400 mb-6">
              Add your children to start tracking their school emails and activities
            </p>
            <Button asChild>
              <Link href="/accountability">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Child
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => {
              const childStats = stats[child.id];
              return (
                <Link key={child.id} href={`/children/${child.id}`}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="space-y-4">
                      {/* Avatar & Name */}
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-16 h-16 rounded-full ${getAvatarColor(
                            child.avatar_color
                          )} flex items-center justify-center text-white text-2xl font-bold`}
                        >
                          {child.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900">{child.name}</h3>
                          {child.grade && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              {child.grade}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Teacher Info */}
                      {child.teacher && (
                        <div className="bg-purple-50 p-3 rounded">
                          <p className="text-xs text-gray-600 mb-1">Teacher</p>
                          <p className="font-medium text-gray-900">{child.teacher}</p>
                        </div>
                      )}

                      {/* Email Stats */}
                      {childStats && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-blue-50 p-3 rounded text-center">
                            <Mail className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                            <p className="text-2xl font-bold text-blue-600">
                              {childStats.emailCount || 0}
                            </p>
                            <p className="text-xs text-gray-600">Emails</p>
                          </div>
                          <div className="bg-orange-50 p-3 rounded text-center">
                            <Badge className="bg-orange-600 text-white mb-1">
                              {childStats.unreadCount || 0}
                            </Badge>
                            <p className="text-xs text-gray-600 mt-1">Unread</p>
                          </div>
                        </div>
                      )}

                      {/* View Profile Button */}
                      <Button variant="outline" className="w-full" asChild>
                        <div className="flex items-center justify-center gap-2">
                          View Profile
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </Button>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
