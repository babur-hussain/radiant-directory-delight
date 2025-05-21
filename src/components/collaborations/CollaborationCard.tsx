
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';

interface CollaborationCardProps {
  title: string;
  description: string;
  brandName: string;
  brandLogo: string;
  influencerName: string;
  influencerImage: string;
  date: string;
  category: string;
  tags: string[];
  coverImage: string;
  stats?: {
    reach?: string;
    engagement?: string;
    conversions?: string;
    [key: string]: string | undefined;
  };
}

const CollaborationCard: React.FC<CollaborationCardProps> = ({
  title,
  description,
  brandName,
  brandLogo,
  influencerName,
  influencerImage,
  date,
  category,
  tags,
  coverImage,
  stats
}) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48">
        <img 
          src={coverImage} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <Badge className="absolute top-3 left-3">{category}</Badge>
        
        <div className="absolute -bottom-5 left-3 flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
            <img 
              src={brandLogo} 
              alt={brandName} 
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white -ml-2">
            <img 
              src={influencerImage} 
              alt={influencerName} 
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </div>
      
      <CardHeader className="pt-6">
        <div className="flex items-center text-sm text-gray-500 mb-1">
          <CalendarIcon className="mr-1 h-3 w-3" />
          <span>{date}</span>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs text-gray-500">Brand</p>
            <p className="font-medium">{brandName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Influencer</p>
            <p className="font-medium">{influencerName}</p>
          </div>
        </div>
        
        {stats && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {stats.reach && (
              <div className="bg-gray-50 p-2 rounded text-center">
                <p className="text-xs text-gray-500">Reach</p>
                <p className="font-semibold text-brand-orange">{stats.reach}</p>
              </div>
            )}
            {stats.engagement && (
              <div className="bg-gray-50 p-2 rounded text-center">
                <p className="text-xs text-gray-500">Engagement</p>
                <p className="font-semibold text-brand-orange">{stats.engagement}</p>
              </div>
            )}
            {stats.conversions && (
              <div className="bg-gray-50 p-2 rounded text-center">
                <p className="text-xs text-gray-500">Conversions</p>
                <p className="font-semibold text-brand-orange">{stats.conversions}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" className="w-full">View Details</Button>
      </CardFooter>
    </Card>
  );
};

export default CollaborationCard;
