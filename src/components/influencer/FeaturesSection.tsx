
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FeaturesSectionProps {
  features: {
    title: string;
    description: string;
    icon: () => JSX.Element;
  }[];
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features }) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Influencer Features</CardTitle>
        <CardDescription>Powerful tools to boost your influencer career</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <div className="mr-3 text-primary">{feature.icon()}</div>
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturesSection;
