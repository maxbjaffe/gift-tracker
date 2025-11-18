'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConsequenceCard } from '@/components/accountability/ConsequenceCard';
import { ChildSelector } from '@/components/accountability/ChildSelector';
import type { Consequence, Child } from '@/types/accountability';
import { fetchConsequences, fetchChildren, deleteConsequence } from '@/lib/services/accountability';
import { toast } from 'sonner';
import { ArrowLeft, Shield, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ConsequencesPage() {
  const router = useRouter();
  const [consequences, setConsequences] = useState<Consequence[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [consequencesData, childrenData] = await Promise.all([
        fetchConsequences(),
        fetchChildren(),
      ]);
      setConsequences(consequencesData);
      setChildren(childrenData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load consequences');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, childName: string, restrictionItem: string) {
    if (!confirm(`Are you sure you want to delete the ${restrictionItem} restriction for ${childName}?`)) {
      return;
    }

    try {
      await deleteConsequence(id);
      toast.success('Consequence deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete consequence');
    }
  }

  // Filter consequences
  const filteredConsequences = consequences.filter((consequence) => {
    if (selectedChildId !== 'all' && consequence.child_id !== selectedChildId) {
      return false;
    }
    if (selectedStatus !== 'all' && consequence.status !== selectedStatus) {
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
            All Consequences
          </h1>
          <p className="text-gray-600 mt-1">
            View, edit, and manage all consequences
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filter by Child</label>
              <ChildSelector
                children={children}
                value={selectedChildId}
                onChange={setSelectedChildId}
                placeholder="All children"
                includeAll
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filter by Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending_confirmation">Pending Confirmation</SelectItem>
                  <SelectItem value="lifted">Lifted</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="extended">Extended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredConsequences.length} of {consequences.length} consequence{consequences.length !== 1 ? 's' : ''}
        </div>

        {/* Consequences List */}
        {filteredConsequences.length > 0 ? (
          <div className="space-y-3">
            {filteredConsequences.map((consequence) => (
              <div key={consequence.id} className="relative">
                <ConsequenceCard
                  consequence={consequence}
                  showActions={false}
                />
                {/* Edit/Delete Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/accountability/consequences/${consequence.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(
                      consequence.id,
                      consequence.child?.name || 'Unknown',
                      consequence.restriction_item
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
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {selectedChildId !== 'all' || selectedStatus !== 'all'
                ? 'No consequences match your filters'
                : 'No consequences found'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
