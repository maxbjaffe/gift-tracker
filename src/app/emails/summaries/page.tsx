/**
 * Email Summaries Page
 * Monthly AI-generated summaries of school email activity
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { MonthlySummary } from '@/types/email';
import { format } from 'date-fns';
import { ArrowLeft, FileText, RefreshCw, TrendingUp, Calendar, Mail } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SummariesPage() {
  const [summaries, setSummaries] = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadSummaries();
  }, []);

  async function loadSummaries() {
    try {
      const response = await fetch('/api/email/summaries');
      const data = await response.json();

      if (response.ok) {
        setSummaries(data.summaries || []);
      } else {
        toast.error('Failed to load summaries');
      }
    } catch (error) {
      console.error('Error loading summaries:', error);
      toast.error('Failed to load summaries');
    } finally {
      setLoading(false);
    }
  }

  async function generateCurrentMonth() {
    try {
      setGenerating(true);
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const response = await fetch('/api/email/summaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month }),
      });

      if (response.ok) {
        toast.success('Summary generated successfully!');
        loadSummaries();
      } else {
        toast.error('Failed to generate summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary');
    } finally {
      setGenerating(false);
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      homework: 'bg-blue-100 text-blue-700',
      event: 'bg-purple-100 text-purple-700',
      permission: 'bg-yellow-100 text-yellow-700',
      grade: 'bg-green-100 text-green-700',
      behavior: 'bg-pink-100 text-pink-700',
      sports: 'bg-orange-100 text-orange-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading summaries...</div>
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
              Back to Emails
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Monthly Summaries
              </h1>
              <p className="text-gray-600 mt-1">
                AI-generated insights into your school email activity
              </p>
            </div>
            <Button onClick={generateCurrentMonth} disabled={generating}>
              <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
              Generate This Month
            </Button>
          </div>
        </div>

        {/* Summaries List */}
        {summaries.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No summaries generated yet</p>
            <Button onClick={generateCurrentMonth} disabled={generating}>
              Generate Your First Summary
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {summaries.map((summary) => (
              <Card key={summary.id} className="p-6">
                {/* Summary Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {format(new Date(summary.year, summary.month - 1, 1), 'MMMM yyyy')}
                    </h2>
                    {summary.child_id && (
                      <p className="text-sm text-gray-600">For specific child</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    Generated {format(new Date(summary.generated_at), 'MMM d, yyyy')}
                    {summary.regenerated_count > 0 && (
                      <p className="text-xs">Regenerated {summary.regenerated_count} times</p>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Total Emails</p>
                    <p className="text-2xl font-bold text-blue-600">{summary.total_emails}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Urgent</p>
                    <p className="text-2xl font-bold text-red-600">{summary.urgent_count}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Events</p>
                    <p className="text-2xl font-bold text-purple-600">{summary.events_count}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Actions</p>
                    <p className="text-2xl font-bold text-orange-600">{summary.actions_count}</p>
                  </div>
                </div>

                {/* Category Breakdown */}
                {summary.by_category && Object.keys(summary.by_category).length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Category Breakdown</h3>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(summary.by_category).map(([category, count]) => (
                        <div
                          key={category}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category)}`}
                        >
                          {category.replace('_', ' ')}: {count}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Summary */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                  <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap text-gray-700">
                    {summary.summary_text}
                  </div>
                </div>

                {/* Key Highlights */}
                {summary.key_highlights && summary.key_highlights.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Key Highlights
                    </h3>
                    <ul className="space-y-1">
                      {summary.key_highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span className="text-gray-700">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Upcoming Deadlines */}
                {summary.upcoming_deadlines && (summary.upcoming_deadlines as any).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Upcoming Deadlines
                    </h3>
                    <div className="space-y-2">
                      {(summary.upcoming_deadlines as any).map((deadline: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 bg-orange-50 p-2 rounded">
                          <span className="text-sm font-medium text-orange-700">
                            {format(new Date(deadline.date), 'MMM d')}
                          </span>
                          <span className="text-sm text-gray-700">{deadline.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
