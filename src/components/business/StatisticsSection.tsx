
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const StatisticsSection = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Business Statistics</CardTitle>
        <CardDescription>Key performance metrics for businesses using our platform</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Statistics content goes here</p>
      </CardContent>
    </Card>
  );
};

export default StatisticsSection;
