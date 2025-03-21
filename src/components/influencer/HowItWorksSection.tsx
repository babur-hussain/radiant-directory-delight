
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Step {
  step: number;
  title: string;
  description: string;
}

interface HowItWorksSectionProps {
  steps?: Step[];
}

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ steps = [] }) => {
  if (steps.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>Getting started as an influencer</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No steps information available at this time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>How It Works</CardTitle>
        <CardDescription>Getting started as an influencer</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {steps.map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="min-w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                {item.step}
              </div>
              <div>
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HowItWorksSection;
