
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FAQsSectionProps {
  faqs: any;
}

const FAQsSection: React.FC<FAQsSectionProps> = ({ faqs }) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
        <CardDescription>Common questions about our business services</CardDescription>
      </CardHeader>
      <CardContent>
        <p>FAQs content: {JSON.stringify(faqs)}</p>
      </CardContent>
    </Card>
  );
};

export default FAQsSection;
