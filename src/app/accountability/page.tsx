'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsequenceCard } from '@/components/accountability/ConsequenceCard';
import { CommitmentCard } from '@/components/accountability/CommitmentCard';
import { ReliabilityScore } from '@/components/accountability/ReliabilityScore';
import { ChildSelector } from '@/components/accountability/ChildSelector';
import { CreateCommitmentDialog } from '@/components/accountability/CreateCommitmentDialog';
import { CreateConsequenceDialog } from '@/components/accountability/CreateConsequenceDialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type { AccountabilityDashboard } from '@/types/accountability';
import {
  fetchAccountabilityDashboard,
  updateConsequenceStatus,
  updateCommitmentStatus,
} from '@/lib/services/accountability';
import { toast } from 'sonner';
import { Shield, Target, TrendingUp, UserPlus, AlertCircle, MessageSquare, Monitor, Users, Edit3, List, Mail, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import { filterActiveConsequences, filterActiveCommitments } from '@/lib/utils/date-filters';

export default function AccountabilityPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<AccountabilityDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string>('all');

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const data = await fetchAccountabilityDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load accountability dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function handleLiftConsequence(id: string) {
    try {
      await updateConsequenceStatus(id, { status: 'lifted' });
      toast.success('Consequence lifted');
      loadDashboard();
    } catch (error) {
      toast.error('Failed to lift consequence');
    }
  }

  async function handleConfirmConsequence(id: string) {
    try {
      await updateConsequenceStatus(id, { status: 'active' });
      toast.success('Consequence confirmed');
      loadDashboard();
    } catch (error) {
      toast.error('Failed to confirm consequence');
    }
  }

  async function handleCompleteCommitment(id: string, onTime: boolean) {
    try {
      await updateCommitmentStatus(id, {
        status: 'completed',
        completed_on_time: onTime,
      });
      toast.success(onTime ? 'Commitment completed on time!' : 'Commitment completed');
      loadDashboard();
    } catch (error) {
      toast.error('Failed to mark commitment as complete');
    }
  }

  async function handleMissedCommitment(id: string) {
    try {
      await updateCommitmentStatus(id, { status: 'missed' });
      toast.error('Commitment marked as missed');
      loadDashboard();
    } catch (error) {
      toast.error('Failed to mark commitment as missed');
    }
  }

  // Filter by child and remove expired consequences in real-time
  const filteredConsequences = filterActiveConsequences(
    selectedChildId === 'all'
      ? dashboard?.activeConsequences || []
      : dashboard?.activeConsequences.filter((c) => c.child_id === selectedChildId) || []
  );

  const filteredCommitments = filterActiveCommitments(
    selectedChildId === 'all'
      ? dashboard?.activeCommitments || []
      : dashboard?.activeCommitments.filter((c) => c.child_id === selectedChildId) || []
  );

  const selectedChild =
    selectedChildId !== 'all'
      ? dashboard?.children.find((c) => c.id === selectedChildId)
      : null;

  const selectedChildStats = selectedChild
    ? dashboard?.recentStats.find((s) => s.child_id === selectedChild.id)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <LoadingSpinner type="card" count={3} />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load dashboard</p>
          <Button onClick={loadDashboard} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
      {/* AI Max on Left and Right Margins - BIG and BOLD */}
      <div className="fixed -left-32 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none z-0">
        <Image
          src="/images/aimaxhead.png"
          alt="AI Max Left"
          width={800}
          height={800}
          className="object-contain"
        />
      </div>
      <div className="fixed -right-32 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none z-0">
        <Image
          src="/images/aimaxhead.png"
          alt="AI Max Right"
          width={800}
          height={800}
          className="object-contain"
        />
      </div>
      <div className="container mx-auto px-4 py-6 max-w-6xl relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Family Accountability
              </h1>
              <p className="text-gray-600 mt-1">
                Track consequences and commitments to build responsibility
              </p>
            </div>
            <Button asChild className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
              <Link href="/accountability/checklist">
                <CheckSquare className="h-5 w-5 mr-2" />
                Daily Checklist
              </Link>
            </Button>
          </div>
        </div>

        {/* No Children State */}
        {dashboard.children.length === 0 && (
          <Card className="p-12 text-center">
            <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No children added yet
            </h2>
            <p className="text-gray-600 mb-6">
              Add a child to start tracking consequences and commitments
            </p>
            <Button
              onClick={() => router.push('/accountability/children/new')}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Your First Child
            </Button>
          </Card>
        )}

        {/* Dashboard with Children */}
        {dashboard.children.length > 0 && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Active Consequences</p>
                    <p className="text-2xl font-bold text-red-600">
                      {dashboard.activeConsequences.length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Active Commitments</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {dashboard.activeCommitments.length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Average Reliability</p>
                    <p className="text-2xl font-bold text-green-600">
                      {dashboard.recentStats.length > 0
                        ? Math.round(
                            dashboard.recentStats.reduce(
                              (sum, s) => sum + (s.reliability_score || 0),
                              0
                            ) / dashboard.recentStats.length
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Child Filter */}
            <div className="flex flex-col gap-4">
              <ChildSelector
                children={dashboard.children}
                value={selectedChildId}
                onChange={setSelectedChildId}
                placeholder="All children"
                includeAll
              />

              {/* Quick Actions Section - More Defined */}
              <Card className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300 shadow-md">
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    Quick Actions
                  </h3>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <CreateCommitmentDialog
                    children={dashboard.children}
                    onSuccess={loadDashboard}
                    defaultChildId={selectedChildId !== 'all' ? selectedChildId : undefined}
                  />
                  <CreateConsequenceDialog
                    children={dashboard.children}
                    onSuccess={loadDashboard}
                    defaultChildId={selectedChildId !== 'all' ? selectedChildId : undefined}
                  />
                  <Button variant="outline" asChild className="bg-white hover:bg-gray-50">
                    <Link href="/accountability/consequences">
                      <Shield className="h-4 w-4 mr-2" />
                      Manage Consequences
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="bg-white hover:bg-gray-50">
                    <Link href="/accountability/commitments">
                      <Target className="h-4 w-4 mr-2" />
                      Manage Commitments
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="bg-white hover:bg-gray-50">
                    <Link href="/accountability/children">
                      <Users className="h-4 w-4 mr-2" />
                      Children
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="bg-white hover:bg-gray-50">
                    <Link href="/accountability/checklist">
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Daily Checklist
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="bg-white hover:bg-gray-50">
                    <Link href="/emails">
                      <Mail className="h-4 w-4 mr-2" />
                      School Emails
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="bg-white hover:bg-gray-50">
                    <Link href="/accountability/analytics">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analytics
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="bg-white hover:bg-gray-50">
                    <Link href="/kiosk">
                      <Monitor className="h-4 w-4 mr-2" />
                      Kiosk Display
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="bg-white hover:bg-gray-50">
                    <Link href="/accountability/sms-guide">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      SMS Commands
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>

            {/* Reliability Score for Selected Child */}
            {selectedChild && selectedChildStats && (
              <ReliabilityScore stats={selectedChildStats} showDetails />
            )}

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="consequences">
                  Consequences ({filteredConsequences.length})
                </TabsTrigger>
                <TabsTrigger value="commitments">
                  Commitments ({filteredCommitments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Side-by-Side Layout for Consequences and Commitments */}
                {(filteredConsequences.length > 0 || filteredCommitments.length > 0) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active Consequences Column */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-600" />
                        Active Consequences ({filteredConsequences.length})
                      </h3>
                      {filteredConsequences.length > 0 ? (
                        <>
                          <div className="space-y-3">
                            {filteredConsequences.slice(0, 5).map((consequence) => (
                              <ConsequenceCard
                                key={consequence.id}
                                consequence={consequence}
                                onLift={handleLiftConsequence}
                                onConfirm={handleConfirmConsequence}
                              />
                            ))}
                          </div>
                          {filteredConsequences.length > 5 && (
                            <Button variant="link" className="mt-2 w-full" asChild>
                              <Link href="/accountability/consequences">
                                View all {filteredConsequences.length} consequences →
                              </Link>
                            </Button>
                          )}
                        </>
                      ) : (
                        <Card className="p-8 text-center">
                          <Shield className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">No active consequences</p>
                        </Card>
                      )}
                    </div>

                    {/* Active Commitments Column */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        Active Commitments ({filteredCommitments.length})
                      </h3>
                      {filteredCommitments.length > 0 ? (
                        <>
                          <div className="space-y-3">
                            {filteredCommitments.slice(0, 5).map((commitment) => (
                              <CommitmentCard
                                key={commitment.id}
                                commitment={commitment}
                                onComplete={handleCompleteCommitment}
                                onMissed={handleMissedCommitment}
                              />
                            ))}
                          </div>
                          {filteredCommitments.length > 5 && (
                            <Button variant="link" className="mt-2 w-full" asChild>
                              <Link href="/accountability/commitments">
                                View all {filteredCommitments.length} commitments →
                              </Link>
                            </Button>
                          )}
                        </>
                      ) : (
                        <Card className="p-8 text-center">
                          <Target className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">No active commitments</p>
                        </Card>
                      )}
                    </div>
                  </div>
                )}

                {/* Empty State - Both Empty */}
                {filteredConsequences.length === 0 && filteredCommitments.length === 0 && (
                  <Card className="p-12 text-center">
                    <div className="flex gap-4 justify-center mb-4">
                      <Shield className="h-12 w-12 text-gray-300" />
                      <Target className="h-12 w-12 text-gray-300" />
                    </div>
                    <p className="text-gray-500">
                      {selectedChild
                        ? `No active consequences or commitments for ${selectedChild.name}`
                        : 'No active consequences or commitments'}
                    </p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="consequences" className="space-y-3">
                {filteredConsequences.length > 0 ? (
                  filteredConsequences.map((consequence) => (
                    <ConsequenceCard
                      key={consequence.id}
                      consequence={consequence}
                      onLift={handleLiftConsequence}
                      onConfirm={handleConfirmConsequence}
                    />
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active consequences</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="commitments" className="space-y-3">
                {filteredCommitments.length > 0 ? (
                  filteredCommitments.map((commitment) => (
                    <CommitmentCard
                      key={commitment.id}
                      commitment={commitment}
                      onComplete={handleCompleteCommitment}
                      onMissed={handleMissedCommitment}
                    />
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active commitments</p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
