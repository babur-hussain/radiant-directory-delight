
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatisticsSectionProps {
  statistics: { value: string; label: string }[];
}

const StatisticsSection: React.FC<StatisticsSectionProps> = ({ statistics }) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Influencer Statistics</CardTitle>
        <CardDescription>Key metrics for influencers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statistics.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsSection;
