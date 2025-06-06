
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Testimonial {
  name: string;
  role?: string;
  content: string;
  imageUrl?: string;
}

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials = [] }) => {
  if (testimonials.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Testimonials</CardTitle>
          <CardDescription>What our influencers are saying</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No testimonials available at this time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Testimonials</CardTitle>
        <CardDescription>What our influencers are saying</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                {testimonial.imageUrl && (
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img 
                      src={testimonial.imageUrl} 
                      alt={testimonial.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-medium">{testimonial.name}</h4>
                  {testimonial.role && (
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  )}
                </div>
              </div>
              <p className="text-sm italic">{testimonial.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialsSection;
