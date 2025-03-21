
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatisticsSectionProps {
  statistics: any;
}

const StatisticsSection: React.FC<StatisticsSectionProps> = ({ statistics }) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Business Statistics</CardTitle>
        <CardDescription>Key metrics for your business</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Statistics content goes here: {JSON.stringify(statistics)}</p>
      </CardContent>
    </Card>
  );
};

export default StatisticsSection;
