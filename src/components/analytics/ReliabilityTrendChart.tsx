'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReliabilityTrendChartProps {
  data: Array<{
    month: string;
    childName: string;
    reliabilityScore: number;
  }>;
}

export function ReliabilityTrendChart({ data }: ReliabilityTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available yet</p>
      </div>
    );
  }

  // Group data by child
  const childrenMap = new Map<string, Array<{ month: string; score: number }>>();

  for (const item of data) {
    if (!childrenMap.has(item.childName)) {
      childrenMap.set(item.childName, []);
    }
    childrenMap.get(item.childName)!.push({
      month: item.month,
      score: item.reliabilityScore,
    });
  }

  // Transform into chart format
  const months = Array.from(new Set(data.map((d) => d.month))).sort();
  const chartData = months.map((month) => {
    const point: any = { month: formatMonth(month) };

    for (const [childName, scores] of childrenMap) {
      const score = scores.find((s) => s.month === month);
      point[childName] = score ? Math.round(score.score) : null;
    }

    return point;
  });

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const children = Array.from(childrenMap.keys());

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Reliability Trends (6 Months)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 100]} label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          {children.map((child, index) => (
            <Line
              key={child}
              type="monotone"
              dataKey={child}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatMonth(month: string): string {
  // Convert YYYY-MM to "Jan '24"
  const [year, monthNum] = month.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[parseInt(monthNum) - 1]} '${year.slice(2)}`;
}
