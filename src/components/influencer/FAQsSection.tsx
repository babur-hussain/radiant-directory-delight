
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQsSectionProps {
  faqs?: FAQ[];
}

const FAQsSection: React.FC<FAQsSectionProps> = ({ faqs = [] }) => {
  if (faqs.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about our influencer services</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No FAQs available at this time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
        <CardDescription>Common questions about our influencer services</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b pb-3 last:border-0">
            <h3 className="font-medium mb-2">{faq.question}</h3>
            <p className="text-sm text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default FAQsSection;
