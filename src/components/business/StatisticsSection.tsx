
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Statistic {
  label: string;
  value: string | number;
  description?: string;
}

interface StatisticsSectionProps {
  statistics?: Statistic[];
}

const StatisticsSection: React.FC<StatisticsSectionProps> = ({ statistics = [] }) => {
  if (statistics.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Business Statistics</CardTitle>
          <CardDescription>Key metrics for your business</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No statistics available at this time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Business Statistics</CardTitle>
        <CardDescription>Key metrics for your business</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {statistics.map((stat, index) => (
            <div key={index} className="border rounded-md p-4 text-center">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm font-medium">{stat.label}</div>
              {stat.description && (
                <div className="text-xs text-muted-foreground mt-1">{stat.description}</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsSection;
