
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
  // Create array of vibrant colors for cards
  const bgColors = [
    'bg-gradient-to-br from-brand-purple/10 to-brand-pink/5',
    'bg-gradient-to-br from-brand-blue/10 to-brand-teal/5',
    'bg-gradient-to-br from-brand-orange/10 to-brand-yellow/5',
    'bg-gradient-to-br from-brand-pink/10 to-brand-purple/5',
    'bg-gradient-to-br from-brand-teal/10 to-brand-green/5',
    'bg-gradient-to-br from-brand-green/10 to-brand-blue/5',
  ];
  
  // Create array of icon colors
  const iconColors = [
    'bg-gradient-to-br from-brand-purple to-brand-pink',
    'bg-gradient-to-br from-brand-blue to-brand-teal',
    'bg-gradient-to-br from-brand-orange to-brand-yellow',
    'bg-gradient-to-br from-brand-pink to-brand-purple',
    'bg-gradient-to-br from-brand-teal to-brand-green',
    'bg-gradient-to-br from-brand-green to-brand-blue',
  ];
  
  // Use hash of title string to consistently pick a color
  const colorIndex = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % bgColors.length;
  const bgColor = bgColors[colorIndex];
  const iconColor = iconColors[colorIndex];
  
  return (
    <Card className={`h-full transition-all duration-300 hover:shadow-xl border-0 overflow-hidden card-hover-effect ${bgColor}`}>
      <CardHeader className="pb-2">
        <div className={`w-12 h-12 rounded-full ${iconColor} flex items-center justify-center mb-4`}>
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
                <span className={`mr-2 rounded-full ${iconColor} text-white p-1 h-6 w-6 flex items-center justify-center text-xs mt-0.5`}>✓</span>
                <span className="text-gray-600">{point}</span>
              </li>
            ))}
          </ul>
        )}
        <Button variant="link" className="p-0" asChild>
          <a href={linkHref} className="text-brand-blue hover:text-brand-purple">
            {linkText}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
