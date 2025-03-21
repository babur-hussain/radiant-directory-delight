
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const HowItWorksSection = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>How It Works</CardTitle>
        <CardDescription>Learn how to start your influencer journey with us</CardDescription>
      </CardHeader>
      <CardContent>
        <p>How It Works content goes here</p>
      </CardContent>
    </Card>
  );
};

export default HowItWorksSection;
