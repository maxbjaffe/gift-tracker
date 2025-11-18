'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CommitmentCard } from '@/components/accountability/CommitmentCard';
import { ChildSelector } from '@/components/accountability/ChildSelector';
import type { Commitment, Child } from '@/types/accountability';
import { fetchCommitments, fetchChildren, deleteCommitment } from '@/lib/services/accountability';
import { toast } from 'sonner';
import { ArrowLeft, Target, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CommitmentsPage() {
  const router = useRouter();
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [commitmentsData, childrenData] = await Promise.all([
        fetchCommitments(),
        fetchChildren(),
      ]);
      setCommitments(commitmentsData);
      setChildren(childrenData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load commitments');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, childName: string, commitmentText: string) {
    if (!confirm(`Are you sure you want to delete "${commitmentText}" for ${childName}?`)) {
      return;
    }

    try {
      await deleteCommitment(id);
      toast.success('Commitment deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete commitment');
    }
  }

  // Filter commitments
  const filteredCommitments = commitments.filter((commitment) => {
    if (selectedChildId !== 'all' && commitment.child_id !== selectedChildId) {
      return false;
    }
    if (selectedStatus !== 'all' && commitment.status !== selectedStatus) {
      return false;
    }
    if (selectedCategory !== 'all' && commitment.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/accountability">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            All Commitments
          </h1>
          <p className="text-gray-600 mt-1">
            View, edit, and manage all commitments
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Child</label>
              <ChildSelector
                children={children}
                value={selectedChildId}
                onChange={setSelectedChildId}
                placeholder="All children"
                includeAll
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                  <SelectItem value="extended">Extended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="homework">📚 Homework</SelectItem>
                  <SelectItem value="chores">🧹 Chores</SelectItem>
                  <SelectItem value="responsibilities">🎯 Responsibilities</SelectItem>
                  <SelectItem value="behavior">🌟 Behavior</SelectItem>
                  <SelectItem value="other">📋 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredCommitments.length} of {commitments.length} commitment{commitments.length !== 1 ? 's' : ''}
        </div>

        {/* Commitments List */}
        {filteredCommitments.length > 0 ? (
          <div className="space-y-3">
            {filteredCommitments.map((commitment) => (
              <div key={commitment.id} className="relative">
                <CommitmentCard
                  commitment={commitment}
                  showActions={false}
                />
                {/* Edit/Delete Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/accountability/commitments/${commitment.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(
                      commitment.id,
                      commitment.child?.name || 'Unknown',
                      commitment.commitment_text
                    )}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {selectedChildId !== 'all' || selectedStatus !== 'all' || selectedCategory !== 'all'
                ? 'No commitments match your filters'
                : 'No commitments found'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
