// src/components/dashboard/PerformanceChart.tsx
"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface PerformanceChartProps {
  data: Array<{ month: string; math?: number; physics?: number }>;
  subject: 'Mathematics' | 'Physics' | 'Overall';
}

const chartConfig = {
  math: {
    label: "Mathematics",
    color: "hsl(var(--chart-1))",
  },
  physics: {
    label: "Physics",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;


const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, subject }) => {
  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="font-headline text-brand-navy">{subject} Performance</CardTitle>
        <CardDescription>Your progress over the last few months (mock data)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[0, 100]}/>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              { (subject === 'Mathematics' || subject === 'Overall') && 
                <Bar dataKey="math" fill="var(--color-math)" radius={4} />
              }
              { (subject === 'Physics' || subject === 'Overall') && 
                <Bar dataKey="physics" fill="var(--color-physics)" radius={4} />
              }
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

// Mock data for the chart
export const mockPerformanceData = [
  { month: 'Jan', math: 65, physics: 58 },
  { month: 'Feb', math: 72, physics: 65 },
  { month: 'Mar', math: 78, physics: 70 },
  { month: 'Apr', math: 85, physics: 75 },
  { month: 'May', math: 80, physics: 82 },
  { month: 'Jun', math: 90, physics: 88 },
];


export default PerformanceChart;
