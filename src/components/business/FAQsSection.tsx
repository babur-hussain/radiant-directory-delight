
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FAQsSection = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
        <CardDescription>Common questions about our business services</CardDescription>
      </CardHeader>
      <CardContent>
        <p>FAQs content goes here</p>
      </CardContent>
    </Card>
  );
};

export default FAQsSection;
