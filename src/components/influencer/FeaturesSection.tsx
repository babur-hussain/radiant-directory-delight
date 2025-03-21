
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FeaturesSection = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Influencer Features</CardTitle>
        <CardDescription>Powerful tools to boost your influencer career</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Features content goes here</p>
      </CardContent>
    </Card>
  );
};

export default FeaturesSection;
