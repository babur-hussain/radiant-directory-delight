
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Star, Crown } from 'lucide-react';
import { Influencer } from '@/lib/csv/influencerTypes';

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
  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {influencer.id}
          {influencer.featured && (
            <Crown className="h-3 w-3 text-yellow-500" />
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-3">
          <img
            src={influencer.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name)}&size=32&background=7c3aed&color=fff`}
            alt={influencer.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <div className="font-medium">{influencer.name}</div>
            {influencer.email && (
              <div className="text-sm text-gray-500">{influencer.email}</div>
            )}
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        {influencer.niche && (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            {influencer.niche}
          </Badge>
        )}
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        <div className="font-medium">
          {formatFollowers(influencer.followers_count || 0)}
        </div>
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        <div className="font-medium">
          {influencer.engagement_rate || 0}%
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 text-yellow-400 fill-current" />
          <span className="font-medium">{influencer.rating || 0}</span>
        </div>
      </TableCell>
      
      <TableCell className="hidden md:table-cell">
        <div className="text-sm text-gray-600">
          {influencer.location || 'Not specified'}
        </div>
      </TableCell>
      
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
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
