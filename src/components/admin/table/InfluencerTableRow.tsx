
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Influencer {
  id: number;
  name: string;
  email?: string;
  niche?: string;
  location?: string;
  followers_count?: number;
  engagement_rate?: number;
  rating?: number;
  featured?: boolean;
  priority?: number;
  instagram_handle?: string;
  youtube_handle?: string;
  profile_image?: string;
  cover_image?: string;
  bio?: string;
  tags?: string[];
  previous_brands?: string[];
  reviews_count?: number;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

interface InfluencerTableRowProps {
  influencer: Influencer;
  onViewDetails: () => void;
  onEditInfluencer: () => void;
  onDeleteInfluencer: () => void;
}

const InfluencerTableRow: React.FC<InfluencerTableRowProps> = ({
  influencer,
  onViewDetails,
  onEditInfluencer,
  onDeleteInfluencer
}) => {
  const formatFollowers = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">{influencer.id}</TableCell>
      
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={influencer.profile_image} alt={influencer.name} />
            <AvatarFallback className="bg-purple-100 text-purple-600">
              {getInitials(influencer.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{influencer.name}</div>
            <div className="text-sm text-gray-500">{influencer.email}</div>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="space-y-1">
          <div className="text-sm font-medium">{influencer.niche}</div>
          {influencer.category && (
            <Badge variant="secondary" className="text-xs">
              {influencer.category}
            </Badge>
          )}
        </div>
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        <div className="text-sm font-medium text-blue-600">
          {formatFollowers(influencer.followers_count)}
        </div>
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        <div className="text-sm">
          {influencer.engagement_rate ? `${influencer.engagement_rate}%` : 'N/A'}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center space-x-1">
          <span className="text-yellow-400">★</span>
          <span className="text-sm font-medium">
            {influencer.rating ? influencer.rating.toFixed(1) : 'N/A'}
          </span>
        </div>
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        <div className="text-sm text-gray-600">{influencer.location || 'N/A'}</div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDetails}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditInfluencer}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteInfluencer}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default InfluencerTableRow;
