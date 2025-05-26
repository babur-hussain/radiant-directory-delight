
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Influencer } from '@/lib/csv/influencerTypes';
import InfluencerTableContent from './table/InfluencerTableContent';
import { initializeInfluencerData, deleteInfluencer } from '@/lib/csv/influencerDatabase';
import { getInfluencersData } from '@/lib/csv/influencerStore';
import { useToast } from '@/hooks/use-toast';

interface TableInfluencerListingsProps {
  onRefresh: () => void;
  onAddInfluencer: () => void;
  onEditInfluencer: (influencer: Influencer) => void;
}

const TableInfluencerListings: React.FC<TableInfluencerListingsProps> = ({ 
  onRefresh, 
  onAddInfluencer,
  onEditInfluencer 
}) => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [filteredInfluencers, setFilteredInfluencers] = useState<Influencer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const { toast } = useToast();
  const itemsPerPage = 10;

  // Load influencers data
  useEffect(() => {
    const loadInfluencers = async () => {
      try {
        setIsLoading(true);
        await initializeInfluencerData();
        const influencersData = getInfluencersData();
        setInfluencers(influencersData);
        setFilteredInfluencers(influencersData);
      } catch (error) {
        console.error("Error loading influencers:", error);
        toast({
          title: "Error",
          description: "Failed to load influencers data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInfluencers();
  }, [toast]);

  // Listen for data changes
  useEffect(() => {
    const handleDataChange = () => {
      const influencersData = getInfluencersData();
      setInfluencers(influencersData);
      setFilteredInfluencers(influencersData);
    };

    window.addEventListener('influencerDataChanged', handleDataChange);
    
    return () => {
      window.removeEventListener('influencerDataChanged', handleDataChange);
    };
  }, []);

  // Filter influencers based on search term
  useEffect(() => {
    const filtered = influencers.filter(influencer =>
      influencer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      influencer.niche?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      influencer.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      influencer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInfluencers(filtered);
    setCurrentPage(1);
  }, [searchTerm, influencers]);

  const handleViewDetails = (influencer: Influencer) => {
    setSelectedInfluencer(influencer);
  };

  const handleDeleteInfluencer = async (influencer: Influencer) => {
    if (window.confirm(`Are you sure you want to delete ${influencer.name}?`)) {
      const success = await deleteInfluencer(influencer.id);
      if (success) {
        toast({
          title: "Influencer Deleted",
          description: `${influencer.name} has been deleted successfully.`,
        });
        onRefresh();
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete the influencer. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-64">
            <div className="h-9 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search influencers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button onClick={onAddInfluencer} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Influencer
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-500">
        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredInfluencers.length)} to{' '}
        {Math.min(currentPage * itemsPerPage, filteredInfluencers.length)} of{' '}
        {filteredInfluencers.length} influencers
      </div>

      {/* Influencers Table */}
      <InfluencerTableContent
        influencers={filteredInfluencers}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onViewDetails={handleViewDetails}
        onEditInfluencer={onEditInfluencer}
        onDeleteInfluencer={handleDeleteInfluencer}
      />
    </div>
  );
};

export default TableInfluencerListings;
