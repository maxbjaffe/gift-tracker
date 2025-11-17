'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface ConsequenceEffectivenessChartProps {
  data: Array<{
    restrictionType: string;
    totalConsequences: number;
    effectiveness: number;
    repeatOffenses: number;
  }>;
}

export function ConsequenceEffectivenessChart({ data }: ConsequenceEffectivenessChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No consequence data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    type: formatType(item.restrictionType),
    effectiveness: item.effectiveness,
    total: item.totalConsequences,
    repeats: item.repeatOffenses,
  }));

  const getBarColor = (effectiveness: number) => {
    if (effectiveness >= 70) return '#10B981'; // Green
    if (effectiveness >= 50) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Consequence Effectiveness</h3>
      <p className="text-sm text-gray-600 mb-4">
        Higher scores indicate fewer repeat offenses and better compliance
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis domain={[0, 100]} label={{ value: 'Effectiveness (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border rounded shadow-lg">
                    <p className="font-semibold">{data.type}</p>
                    <p className="text-sm">Effectiveness: {data.effectiveness}%</p>
                    <p className="text-sm">Total: {data.total}</p>
                    <p className="text-sm">Repeats: {data.repeats}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="effectiveness" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.effectiveness)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Highly Effective (70%+)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span>Moderate (50-70%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Low (&lt;50%)</span>
        </div>
      </div>
    </div>
  );
}

function formatType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}
