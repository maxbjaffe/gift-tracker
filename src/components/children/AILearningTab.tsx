/**
 * AI Learning Tab Component
 * Shows AI learning patterns and insights for a child
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Brain,
  TrendingUp,
  CheckCircle,
  Mail,
  User,
  Target,
  Zap,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface AILearningTabProps {
  childId: string;
  childName: string;
  emails: any[];
}

export function AILearningTab({ childId, childName, emails }: AILearningTabProps) {
  const [patterns, setPatterns] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzePatterns();
  }, [emails]);

  function analyzePatterns() {
    setLoading(true);

    // Calculate verified associations
    const verifiedEmails = emails.filter(e =>
      e.child_relevance?.some((r: any) => r.is_verified && r.child_id === childId)
    );
    const verifiedCount = verifiedEmails.length;

    // Analyze sender patterns
    const senderCounts: Record<string, number> = {};
    verifiedEmails.forEach((e: any) => {
      const sender = e.from_address || e.from_name || 'Unknown';
      senderCounts[sender] = (senderCounts[sender] || 0) + 1;
    });
    const topSenders = Object.entries(senderCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([sender, count]) => ({ sender, count }));

    // Analyze category patterns
    const categoryCounts: Record<string, number> = {};
    verifiedEmails.forEach((e: any) => {
      const category = e.ai_category || 'uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    // Extract common keywords from subjects
    const keywords: Record<string, number> = {};
    verifiedEmails.forEach((e: any) => {
      if (!e.subject) return;
      const words = e.subject
        .toLowerCase()
        .split(/\s+/)
        .filter((w: string) => w.length > 3 && !/^(the|and|for|with|from|this|that)$/.test(w));
      words.forEach((word: string) => {
        keywords[word] = (keywords[word] || 0) + 1;
      });
    });
    const topKeywords = Object.entries(keywords)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    // Calculate AI confidence based on data quality
    let confidence = 0;
    if (verifiedCount > 0) confidence += 20;
    if (verifiedCount >= 5) confidence += 20;
    if (verifiedCount >= 10) confidence += 20;
    if (topSenders.length > 0) confidence += 15;
    if (topCategories.length >= 3) confidence += 15;
    if (topKeywords.length >= 5) confidence += 10;

    setPatterns({
      verifiedCount,
      totalEmails: emails.length,
      confidence: Math.min(confidence, 100),
      topSenders,
      topCategories,
      topKeywords,
      dataQuality:
        verifiedCount === 0
          ? 'none'
          : verifiedCount < 5
          ? 'low'
          : verifiedCount < 15
          ? 'medium'
          : 'high',
    });

    setLoading(false);
  }

  if (loading || !patterns) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-600">Analyzing patterns...</p>
      </Card>
    );
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Verified Emails</p>
              <p className="text-2xl font-bold text-green-600">{patterns.verifiedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">AI Confidence</p>
              <p className="text-2xl font-bold text-purple-600">{patterns.confidence}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Data Quality</p>
              <p className={`text-2xl font-bold capitalize ${getQualityColor(patterns.dataQuality)}`}>
                {patterns.dataQuality}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Patterns Found</p>
              <p className="text-2xl font-bold text-orange-600">
                {patterns.topSenders.length + patterns.topCategories.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Learning Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-900">Learning Progress</h3>
          </div>
          <Button variant="outline" size="sm" onClick={analyzePatterns}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Analysis
          </Button>
        </div>

        {patterns.verifiedCount === 0 ? (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No verified associations yet</p>
            <p className="text-sm text-gray-500">
              Associate and verify emails in the Bulk Actions tab to train the AI
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Training Data Quality</span>
              <div className="flex items-center gap-2">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${patterns.confidence}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{patterns.confidence}%</span>
              </div>
            </div>

            {patterns.verifiedCount < 10 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Tip:</strong> Verify at least 10 emails to improve AI accuracy. You have{' '}
                  {patterns.verifiedCount} verified email{patterns.verifiedCount !== 1 ? 's' : ''}.
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Detected Patterns */}
      {patterns.verifiedCount > 0 && (
        <>
          {/* Top Senders */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Common Senders for {childName}
            </h3>
            {patterns.topSenders.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No sender patterns detected yet</p>
            ) : (
              <div className="space-y-2">
                {patterns.topSenders.map((sender: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-900">{sender.sender}</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700">
                      {sender.count} email{sender.count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Top Categories */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Common Email Categories
            </h3>
            {patterns.topCategories.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No category patterns detected yet</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {patterns.topCategories.map((cat: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded text-center">
                    <p className="text-sm font-medium text-gray-900 capitalize mb-1">{cat.category}</p>
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                      {cat.count} email{cat.count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Keywords */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-600" />
              Detected Keywords
            </h3>
            {patterns.topKeywords.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No keywords detected yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {patterns.topKeywords.map((kw: any, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1"
                  >
                    {kw.keyword} ({kw.count})
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-3">
              These words appear frequently in email subjects associated with {childName}
            </p>
          </Card>

          {/* How AI Uses This */}
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              How AI Uses These Patterns
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Sender Recognition:</strong> Emails from frequent senders are automatically
                  suggested for {childName}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Keyword Matching:</strong> Emails containing detected keywords get higher
                  confidence scores
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Category Prediction:</strong> AI learns which email categories are most
                  relevant to {childName}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Improved Suggestions:</strong> The more you verify, the smarter the
                  suggestions become
                </span>
              </li>
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
