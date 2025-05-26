
import React from 'react';
import { Influencer } from '@/lib/csv/influencerTypes';
import InfluencerTable from './InfluencerTable';
import TablePagination from './TablePagination';

interface InfluencerTableContentProps {
  influencers: Influencer[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  onViewDetails: (influencer: Influencer) => void;
  onEditInfluencer: (influencer: Influencer) => void;
  onDeleteInfluencer: (influencer: Influencer) => void;
}

const InfluencerTableContent: React.FC<InfluencerTableContentProps> = ({
  influencers,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  onViewDetails,
  onEditInfluencer,
  onDeleteInfluencer
}) => {
  // Calculate pagination values
  const totalPages = Math.ceil(influencers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, influencers.length);
  const currentInfluencers = influencers.slice(startIndex, endIndex);

  console.log('InfluencerTableContent rendering', { 
    totalInfluencers: influencers.length,
    currentInfluencersCount: currentInfluencers.length,
    startIndex,
    endIndex
  });

  return (
    <div className="space-y-4">
      <InfluencerTable 
        influencers={currentInfluencers}
        onViewDetails={onViewDetails}
        onEditInfluencer={onEditInfluencer}
        onDeleteInfluencer={onDeleteInfluencer}
      />
      
      <TablePagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default InfluencerTableContent;
