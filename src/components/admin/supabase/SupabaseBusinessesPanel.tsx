
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle, Edit, Trash2, Eye, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Business, IBusiness, convertIBusinessToBusiness, toNumberId, isNumberId } from "@/types/business";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SupabaseBusinessesPanel = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchBusinesses();
  }, []);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBusinesses(businesses);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = businesses.filter(business => 
        business.name.toLowerCase().includes(query) || 
        business.category.toLowerCase().includes(query) ||
        business.address.toLowerCase().includes(query)
      );
      setFilteredBusinesses(filtered);
    }
  }, [searchQuery, businesses]);

  const fetchBusinesses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedBusinesses: Business[] = data.map(item => ({
          id: item.id,
          name: item.name || '',
          category: item.category || '',
          description: item.description || '',
          address: item.address || '',
          phone: item.phone || '',
          email: item.email || '',
          website: item.website || '',
          image: item.image || '',
          hours: item.hours || '',
          rating: Number(item.rating) || 0,
          reviews: Number(item.reviews) || 0,
          featured: Boolean(item.featured),
          tags: Array.isArray(item.tags) ? item.tags : [],
          latitude: Number(item.latitude) || 0,
          longitude: Number(item.longitude) || 0,
          created_at: item.created_at || '',
          updated_at: item.updated_at || ''
        }));
        
        setBusinesses(formattedBusinesses);
        setFilteredBusinesses(formattedBusinesses);
      }
    } catch (err) {
      console.error('Error fetching businesses from Supabase:', err);
      setError('Failed to load businesses from the database');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (business: Business) => {
    setSelectedBusiness(business);
    setIsViewModalOpen(true);
  };

  const handleEditBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setIsEditModalOpen(true);
  };

  const handleDeleteBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setIsDeleteModalOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const confirmDelete = async () => {
    if (!selectedBusiness) return;
    
    try {
      if (isNumberId(selectedBusiness.id)) {
        const { error } = await supabase
          .from('businesses')
          .delete()
          .eq('id', toNumberId(selectedBusiness.id));
        
        if (error) {
          throw error;
        }
      }
      
      toast({
        title: "Business Deleted",
        description: `${selectedBusiness.name} has been removed from the database.`
      });
      
      // Remove from local state
      setBusinesses(businesses.filter(b => b.id !== selectedBusiness.id));
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting business:', err);
      toast({
        title: "Error",
        description: "Failed to delete business. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddBusiness = () => {
    // For now just a placeholder function
    toast({
      title: "Add Business",
      description: "This feature is not yet implemented"
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Supabase Businesses</CardTitle>
          <CardDescription>Manage business listings stored in Supabase</CardDescription>
        </div>
        <Button onClick={handleAddBusiness}>
          <Plus className="mr-2 h-4 w-4" /> Add Business
        </Button>
      </CardHeader>
      
      <CardContent>
        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="mb-4">
              <Input
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="max-w-sm"
              />
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Loading businesses...
                      </TableCell>
                    </TableRow>
                  ) : filteredBusinesses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No businesses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBusinesses.map((business) => (
                      <TableRow key={business.id}>
                        <TableCell className="font-medium">{business.name}</TableCell>
                        <TableCell>{business.category}</TableCell>
                        <TableCell>{business.address}</TableCell>
                        <TableCell>{business.rating} / 5</TableCell>
                        <TableCell>
                          <Badge variant={business.featured ? "default" : "secondary"}>
                            {business.featured ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(business)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditBusiness(business)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteBusiness(business)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* View Details Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {selectedBusiness?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedBusiness && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Category</h3>
                    <p>{selectedBusiness.category}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Rating</h3>
                    <p>{selectedBusiness.rating} / 5 ({selectedBusiness.reviews} reviews)</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Address</h3>
                    <p>{selectedBusiness.address}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p>{selectedBusiness.phone}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p>{selectedBusiness.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Website</h3>
                    <p>
                      <a href={selectedBusiness.website} target="_blank" rel="noopener noreferrer">
                        {selectedBusiness.website}
                      </a>
                    </p>
                  </div>
                  <div className="col-span-2">
                    <h3 className="font-medium">Description</h3>
                    <p>{selectedBusiness.description}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Featured</h3>
                    <p>{selectedBusiness.featured ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Tags</h3>
                    <p>{selectedBusiness.tags.join(", ")}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        {/* Placeholder for Edit Modal - To be implemented */}

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <div>
              <p>Are you sure you want to delete {selectedBusiness?.name}?</p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SupabaseBusinessesPanel;
