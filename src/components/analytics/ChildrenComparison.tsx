'use client';

interface ChildComparison {
  childId: string;
  childName: string;
  age?: number;
  reliabilityScore: number;
  totalCommitments: number;
  rank: number;
  improvement: number;
}

interface ChildrenComparisonProps {
  children: ChildComparison[];
  average: number;
}

export function ChildrenComparison({ children, average }: ChildrenComparisonProps) {
  if (children.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Children Comparison</h3>
        <p className="text-gray-500">No data available for this month</p>
      </div>
    );
  }

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Children Comparison</h3>
      <p className="text-sm text-gray-600 mb-4">Current month reliability rankings</p>

      <div className="space-y-3">
        {children.map((child) => (
          <div
            key={child.childId}
            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition"
          >
            <div className="text-2xl">{getRankEmoji(child.rank)}</div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{child.childName}</h4>
                {child.age && <span className="text-sm text-gray-500">Age {child.age}</span>}
              </div>
              <p className="text-sm text-gray-600">{child.totalCommitments} commitments this month</p>
            </div>

            <div className="text-right">
              <div
                className={`text-2xl font-bold ${getScoreColor(child.reliabilityScore)} ${getScoreBg(child.reliabilityScore)} px-3 py-1 rounded-lg`}
              >
                {Math.round(child.reliabilityScore)}%
              </div>
              {child.improvement !== 0 && (
                <div
                  className={`text-sm mt-1 ${
                    child.improvement > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {child.improvement > 0 ? '↑' : '↓'} {Math.abs(Math.round(child.improvement))}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Family Average</span>
          <span className="text-lg font-semibold">{Math.round(average)}%</span>
        </div>
      </div>
    </div>
  );
}
