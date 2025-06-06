
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface CaseStudyStats {
  impressions?: string;
  reach?: string;
  engagement?: string;
  conversionRate?: string;
  roi?: string;
  salesIncrease?: string;
  [key: string]: string | undefined;
}

interface PortfolioCaseProps {
  title: string;
  description: string;
  industry: string;
  image: string;
  brandLogo?: string;
  stats: CaseStudyStats;
  tags: string[];
  featured?: boolean;
}

const PortfolioCase: React.FC<PortfolioCaseProps> = ({
  title,
  description,
  industry,
  image,
  brandLogo,
  stats,
  tags,
  featured = false,
}) => {
  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${featured ? 'border-brand-orange border-2' : ''}`}>
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="w-full h-56 object-cover"
        />
        {featured && (
          <Badge className="absolute top-3 right-3 bg-brand-orange">Featured</Badge>
        )}
        {brandLogo && (
          <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center p-1">
            <img src={brandLogo} alt="Brand logo" className="max-w-full max-h-full object-contain" />
          </div>
        )}
      </div>
      
      <CardHeader className="pt-8">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">{industry}</Badge>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <h4 className="font-medium text-sm mb-3">Campaign Results:</h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              <p className="font-semibold text-brand-orange">{value}</p>
            </div>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioCase;
