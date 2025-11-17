'use client';

import { useEffect, useState } from 'react';
import { ReliabilityTrendChart } from '@/components/analytics/ReliabilityTrendChart';
import { ConsequenceEffectivenessChart } from '@/components/analytics/ConsequenceEffectivenessChart';
import { PatternInsights } from '@/components/analytics/PatternInsights';
import { ChildrenComparison } from '@/components/analytics/ChildrenComparison';

interface AnalyticsData {
  reliability: {
    monthlyTrends: any[];
    childrenComparison: {
      children: any[];
      average: number;
    };
  };
  consequences: {
    effectiveness: any[];
    patterns: any[];
  };
  patterns: any[];
  insights: string;
}

export default function AccountabilityAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/overview');

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-300 rounded-lg p-6">
          <h3 className="text-red-900 font-semibold mb-2">Error Loading Analytics</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
          <p className="text-gray-700">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Accountability Analytics</h1>
        <p className="text-gray-600">
          Track patterns, trends, and effectiveness of your accountability system
        </p>
      </div>

      {/* Insights Section */}
      <div className="mb-6">
        <PatternInsights patterns={data.patterns} aiInsights={data.insights} />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Reliability Trend */}
        <div className="lg:col-span-2">
          <ReliabilityTrendChart data={data.reliability.monthlyTrends} />
        </div>

        {/* Children Comparison */}
        <ChildrenComparison
          children={data.reliability.childrenComparison.children}
          average={data.reliability.childrenComparison.average}
        />

        {/* Consequence Effectiveness */}
        <ConsequenceEffectivenessChart data={data.consequences.effectiveness} />
      </div>

      {/* Consequence Patterns Table */}
      {data.consequences.patterns.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Consequence Patterns by Child</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Child</th>
                  <th className="text-left py-2 px-4">Most Common Reason</th>
                  <th className="text-left py-2 px-4">Most Effective Restriction</th>
                  <th className="text-center py-2 px-4">Total</th>
                  <th className="text-center py-2 px-4">Repeat Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.consequences.patterns.map((pattern: any) => (
                  <tr key={pattern.childId} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{pattern.childName}</td>
                    <td className="py-3 px-4">{pattern.mostCommonReason}</td>
                    <td className="py-3 px-4 capitalize">{pattern.mostEffectiveRestriction}</td>
                    <td className="py-3 px-4 text-center">{pattern.totalConsequences}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          pattern.repeatRate < 20
                            ? 'bg-green-100 text-green-800'
                            : pattern.repeatRate < 40
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {pattern.repeatRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchAnalytics}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Refresh Analytics
        </button>
      </div>
    </div>
  );
}
