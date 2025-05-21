
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  bulletPoints?: string[];
  linkText?: string;
  linkHref?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  icon: Icon,
  bulletPoints = [],
  linkText = "Learn More",
  linkHref = "#",
}) => {
  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-brand-orange/20">
      <CardHeader className="pb-2">
        <div className="bg-gradient-orange-yellow w-12 h-12 rounded-full flex items-center justify-center mb-4">
          <Icon className="text-white h-6 w-6" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {bulletPoints.length > 0 && (
          <ul className="mt-2 mb-6 space-y-2">
            {bulletPoints.map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 rounded-full bg-brand-orange/20 text-brand-orange p-1 h-6 w-6 flex items-center justify-center text-xs mt-0.5">✓</span>
                <span className="text-gray-600">{point}</span>
              </li>
            ))}
          </ul>
        )}
        <Button variant="link" className="p-0" asChild>
          <a href={linkHref} className="text-brand-orange">
            {linkText}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
