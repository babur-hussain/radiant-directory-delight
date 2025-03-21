
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const StatisticsSection = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Influencer Statistics</CardTitle>
        <CardDescription>Key performance metrics for influencers on our platform</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Statistics content goes here</p>
      </CardContent>
    </Card>
  );
};

export default StatisticsSection;
