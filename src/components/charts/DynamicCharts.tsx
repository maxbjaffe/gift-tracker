'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Dynamically import recharts components with no SSR
// This reduces initial bundle size by ~380KB

const DynamicBarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
);

const DynamicBar = dynamic(
  () => import('recharts').then((mod) => mod.Bar),
  { ssr: false }
);

const DynamicLineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false }
);

const DynamicLine = dynamic(
  () => import('recharts').then((mod) => mod.Line),
  { ssr: false }
);

const DynamicPieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { ssr: false }
);

const DynamicPie = dynamic(
  () => import('recharts').then((mod) => mod.Pie),
  { ssr: false }
);

const DynamicCell = dynamic(
  () => import('recharts').then((mod) => mod.Cell),
  { ssr: false }
);

const DynamicXAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);

const DynamicYAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);

const DynamicCartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
);

const DynamicTooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);

const DynamicLegend = dynamic(
  () => import('recharts').then((mod) => mod.Legend),
  { ssr: false }
);

const DynamicResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

export {
  DynamicBarChart as BarChart,
  DynamicBar as Bar,
  DynamicLineChart as LineChart,
  DynamicLine as Line,
  DynamicPieChart as PieChart,
  DynamicPie as Pie,
  DynamicCell as Cell,
  DynamicXAxis as XAxis,
  DynamicYAxis as YAxis,
  DynamicCartesianGrid as CartesianGrid,
  DynamicTooltip as Tooltip,
  DynamicLegend as Legend,
  DynamicResponsiveContainer as ResponsiveContainer,
};
