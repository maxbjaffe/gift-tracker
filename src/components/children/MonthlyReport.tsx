/**
 * Monthly Report Component
 * Display comprehensive activity report for a child
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Mail,
  Inbox,
  CheckSquare,
  Calendar,
  User,
  BarChart3,
  FileText,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface MonthlyReportProps {
  childId: string;
  childName: string;
  days?: number;
}

export function MonthlyReport({ childId, childName, days = 30 }: MonthlyReportProps) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [childId, days]);

  async function loadReport() {
    try {
      setLoading(true);
      const response = await fetch(`/api/children/${childId}/report?days=${days}`);
      const data = await response.json();

      if (response.ok) {
        setReport(data);
      } else {
        toast.error('Failed to load report');
      }
    } catch (error) {
      console.error('Error loading report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  }

  function exportReport() {
    if (!report) return;

    const reportText = `
${childName}'s Activity Report
Generated: ${new Date().toLocaleDateString()}
Period: Last ${days} days

SUMMARY
Total Emails: ${report.summary.totalEmails}
Unread: ${report.summary.unreadEmails}
Verified Associations: ${report.summary.verifiedAssociations}
Trend: ${report.summary.trend > 0 ? '+' : ''}${report.summary.trend}% vs previous period

CATEGORIES
${Object.entries(report.categoryBreakdown).map(([cat, count]) => `${cat}: ${count}`).join('\n')}

TOP SENDERS
${report.topSenders.map((s: any, i: number) => `${i + 1}. ${s.name} (${s.count} emails)`).join('\n')}

ACTIVITY COUNTS
Homework: ${report.activityCounts.homework}
Grades: ${report.activityCounts.grades}
Events: ${report.activityCounts.events}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${childName.replace(/\s+/g, '_')}_report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported!');
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-600">Loading report...</p>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-600">No report data available</p>
      </Card>
    );
  }

  const categoryColors: Record<string, string> = {
    homework: 'bg-blue-100 text-blue-700',
    grade: 'bg-green-100 text-green-700',
    event: 'bg-purple-100 text-purple-700',
    permission: 'bg-orange-100 text-orange-700',
    announcement: 'bg-yellow-100 text-yellow-700',
    other: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {childName}'s Activity Report
            </h2>
            <p className="text-gray-600">
              Last {days} days ({new Date(report.period.start).toLocaleDateString()} -{' '}
              {new Date(report.period.end).toLocaleDateString()})
            </p>
          </div>
          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Mail className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Emails</p>
              <p className="text-2xl font-bold text-blue-600">{report.summary.totalEmails}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Inbox className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-orange-600">{report.summary.unreadEmails}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-green-600">
                {report.summary.verifiedAssociations}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            {report.summary.trend >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-600" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600" />
            )}
            <div>
              <p className="text-sm text-gray-600">vs Previous</p>
              <p
                className={`text-2xl font-bold ${
                  report.summary.trend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {report.summary.trend > 0 ? '+' : ''}
                {report.summary.trend}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Email Categories
          </h3>
          <div className="space-y-3">
            {Object.entries(report.categoryBreakdown).map(([category, count]) => {
              const percentage = Math.round((Number(count) / report.summary.totalEmails) * 100);
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <Badge
                      variant="outline"
                      className={categoryColors[category] || categoryColors.other}
                    >
                      {category}
                    </Badge>
                    <span className="text-sm font-medium text-gray-900">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Priority Breakdown */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-600" />
            Priority Distribution
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded">
              <div className="flex items-center justify-between">
                <span className="font-medium text-red-700">High Priority</span>
                <span className="text-2xl font-bold text-red-700">
                  {report.priorityBreakdown.high}
                </span>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded">
              <div className="flex items-center justify-between">
                <span className="font-medium text-yellow-700">Medium Priority</span>
                <span className="text-2xl font-bold text-yellow-700">
                  {report.priorityBreakdown.medium}
                </span>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-700">Low Priority</span>
                <span className="text-2xl font-bold text-green-700">
                  {report.priorityBreakdown.low}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Senders */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Top Senders
        </h3>
        <div className="space-y-2">
          {report.topSenders.map((sender: any, index: number) => (
            <div
              key={sender.email}
              className="flex items-center justify-between p-3 bg-gray-50 rounded"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{sender.name}</p>
                  <p className="text-sm text-gray-600">{sender.email}</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                {sender.count} emails
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Activity */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-600" />
          Weekly Activity Trend
        </h3>
        <div className="space-y-3">
          {report.weeklyActivity.map((week: any) => {
            const maxCount = Math.max(...report.weeklyActivity.map((w: any) => w.count));
            const percentage = maxCount === 0 ? 0 : Math.round((week.count / maxCount) * 100);
            return (
              <div key={week.week}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{week.week}</span>
                  <span className="text-sm font-medium text-gray-900">{week.count} emails</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Key Activities */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Key Activities</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded text-center">
            <p className="text-sm text-blue-600 mb-1">Homework</p>
            <p className="text-3xl font-bold text-blue-700">{report.activityCounts.homework}</p>
          </div>
          <div className="p-4 bg-green-50 rounded text-center">
            <p className="text-sm text-green-600 mb-1">Grades</p>
            <p className="text-3xl font-bold text-green-700">{report.activityCounts.grades}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded text-center">
            <p className="text-sm text-purple-600 mb-1">Events</p>
            <p className="text-3xl font-bold text-purple-700">{report.activityCounts.events}</p>
          </div>
        </div>
      </Card>

      {/* Recent Highlights */}
      {report.highlights.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Highlights (Unread High Priority)</h3>
          <div className="space-y-3">
            {report.highlights.map((highlight: any) => (
              <Link key={highlight.id} href={`/emails/${highlight.id}`}>
                <Card className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">{highlight.subject}</p>
                      <p className="text-sm text-gray-600 mb-2">{highlight.from_name}</p>
                      {highlight.summary && (
                        <p className="text-sm text-gray-700 italic">{highlight.summary}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant="outline" className="bg-red-100 text-red-700">
                        High Priority
                      </Badge>
                      {highlight.category && (
                        <Badge
                          variant="outline"
                          className={categoryColors[highlight.category] || categoryColors.other}
                        >
                          {highlight.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
