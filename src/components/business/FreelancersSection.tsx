
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FreelancersSectionProps {
  freelancers?: any[];
}

const FreelancersSection: React.FC<FreelancersSectionProps> = ({ freelancers = [] }) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Our Freelancers</CardTitle>
        <CardDescription>Expert freelancers ready to assist you</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Freelancers content goes here</p>
      </CardContent>
    </Card>
  );
};

export default FreelancersSection;
