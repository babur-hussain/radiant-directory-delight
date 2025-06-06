
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Feature {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface FeaturesSectionProps {
  features?: Feature[];
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features = [] }) => {
  if (features.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Influencer Features</CardTitle>
          <CardDescription>Tools and services for influencer growth</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No features available at this time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Influencer Features</CardTitle>
        <CardDescription>Tools and services for influencer growth</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="border rounded-md p-4">
              {feature.icon && <div className="mb-3">{feature.icon}</div>}
              <h3 className="font-medium mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturesSection;
