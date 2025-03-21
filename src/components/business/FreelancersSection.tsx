
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Freelancer {
  id: string;
  name: string;
  specialty: string;
  bio?: string;
  imageUrl?: string;
}

interface FreelancersSectionProps {
  freelancers?: Freelancer[];
}

const FreelancersSection: React.FC<FreelancersSectionProps> = ({ freelancers = [] }) => {
  if (freelancers.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Freelancers</CardTitle>
          <CardDescription>Expert freelancers ready to assist you</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No freelancers available at this time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Our Freelancers</CardTitle>
        <CardDescription>Expert freelancers ready to assist you</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {freelancers.map((freelancer) => (
            <div key={freelancer.id} className="border rounded-md p-4">
              {freelancer.imageUrl && (
                <div className="w-16 h-16 rounded-full overflow-hidden mb-3 mx-auto">
                  <img src={freelancer.imageUrl} alt={freelancer.name} className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="font-medium text-center">{freelancer.name}</h3>
              <p className="text-sm text-center text-muted-foreground">{freelancer.specialty}</p>
              {freelancer.bio && <p className="text-xs mt-2">{freelancer.bio}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FreelancersSection;
