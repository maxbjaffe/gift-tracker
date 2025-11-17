'use client';

interface Pattern {
  type: 'time_based' | 'category_based' | 'behavioral' | 'effectiveness';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  affectedChildren: string[];
  recommendation: string;
  confidence: number;
}

interface PatternInsightsProps {
  patterns: Pattern[];
  aiInsights?: string;
}

export function PatternInsights({ patterns, aiInsights }: PatternInsightsProps) {
  if (patterns.length === 0 && !aiInsights) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Insights & Patterns</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            🎉 Great job! No concerning patterns detected. Keep up the consistent approach.
          </p>
        </div>
      </div>
    );
  }

  const getSeverityStyles = (severity: Pattern['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-300 text-red-900';
      case 'warning':
        return 'bg-orange-50 border-orange-300 text-orange-900';
      case 'info':
        return 'bg-blue-50 border-blue-300 text-blue-900';
    }
  };

  const getSeverityIcon = (severity: Pattern['severity']) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
    }
  };

  const getTypeLabel = (type: Pattern['type']) => {
    switch (type) {
      case 'time_based':
        return 'Time Pattern';
      case 'category_based':
        return 'Category Pattern';
      case 'behavioral':
        return 'Behavioral Trend';
      case 'effectiveness':
        return 'Effectiveness Issue';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Insights & Patterns</h3>

      {aiInsights && (
        <div className="mb-6 bg-purple-50 border border-purple-300 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-2xl">🤖</span>
            <div>
              <h4 className="font-semibold text-purple-900 mb-2">AI-Powered Insights</h4>
              <div className="text-purple-800 text-sm whitespace-pre-line">{aiInsights}</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {patterns.slice(0, 5).map((pattern, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getSeverityStyles(pattern.severity)}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getSeverityIcon(pattern.severity)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{pattern.title}</h4>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/50">
                    {getTypeLabel(pattern.type)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/50">
                    {pattern.confidence}% confident
                  </span>
                </div>
                <p className="text-sm mb-2">{pattern.description}</p>
                <div className="bg-white/70 rounded p-2 text-sm">
                  <span className="font-medium">💡 Recommendation:</span> {pattern.recommendation}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {patterns.length > 5 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          + {patterns.length - 5} more patterns detected
        </p>
      )}
    </div>
  );
}
