
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Influencer } from '@/lib/csv/influencerTypes';
import InfluencerTableRow from './InfluencerTableRow';

interface InfluencerTableProps {
  influencers: Influencer[];
  onViewDetails: (influencer: Influencer) => void;
  onEditInfluencer: (influencer: Influencer) => void;
  onDeleteInfluencer: (influencer: Influencer) => void;
}

const InfluencerTable: React.FC<InfluencerTableProps> = ({
  influencers,
  onViewDetails,
  onEditInfluencer,
  onDeleteInfluencer
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Influencer Name</TableHead>
            <TableHead>Niche</TableHead>
            <TableHead className="hidden md:table-cell">Followers</TableHead>
            <TableHead className="hidden md:table-cell">Engagement</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="hidden md:table-cell">Location</TableHead>
            <TableHead className="w-[150px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!influencers || influencers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No influencers found.
              </TableCell>
            </TableRow>
          ) : (
            influencers.map((influencer) => (
              <InfluencerTableRow 
                key={influencer.id}
                influencer={influencer}
                onViewDetails={() => onViewDetails(influencer)}
                onEditInfluencer={() => onEditInfluencer(influencer)}
                onDeleteInfluencer={() => onDeleteInfluencer(influencer)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InfluencerTable;
