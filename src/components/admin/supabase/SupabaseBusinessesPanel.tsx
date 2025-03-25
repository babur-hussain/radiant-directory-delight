import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, Edit, Trash2, Upload, Download, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import CSVUploader from '@/components/admin/CSVUploader';
import CSVUploadDialog from '@/components/admin/CSVUploadDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { getAllBusinesses } from '@/services/businessService';
import { Business } from '@/lib/csv-utils';

const SupabaseBusinessesPanel = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const { toast } = useToast();
  const itemsPerPage = 10;
  
  // Load businesses on component mount
  React.useEffect(() => {
    fetchBusinesses();
  }, []);
  
  // Load businesses from supabase
  const fetchBusinesses = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' });
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%,description.ilike.%${search}%`);
      }
      
      // Apply pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      const { data, error, count } = await query
        .order('name', { ascending: true })
        .range(from, to);
      
      if (error) throw error;
      
      // Convert Supabase data to our Business type
      const formattedData: Business[] = data?.map(item => ({
        ...item,
        tags: Array.isArray(item.tags) ? item.tags : (item.tags || []),
        rating: Number(item.rating) || 0,
        reviews: Number(item.reviews) || 0
      })) || [];
      
      setBusinesses(formattedData);
      setTotalCount(count || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast({
        title: "Failed to Load Businesses",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsSearching(false);
    }
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setSearchTerm('');
    fetchBusinesses(1);
  };
  
  const handleSearch = () => {
    setIsSearching(true);
    fetchBusinesses(1, searchTerm);
  };
  
  const handlePageChange = (page: number) => {
    fetchBusinesses(page, searchTerm);
  };
  
  const handleCreateBusiness = () => {
    setEditingBusiness({
      id: 0,
      name: '',
      category: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      rating: 0,
      reviews: 0,
      featured: false,
      tags: [],
      image: ''
    });
    setIsCreating(true);
  };
  
  const handleEditBusiness = (business: Business) => {
    setEditingBusiness({...business});
    setIsEditing(true);
  };
  
  const handleDeleteBusiness = (business: Business) => {
    setBusinessToDelete(business);
    setConfirmDelete(true);
  };
  
  const handleCloseDialog = () => {
    setIsEditing(false);
    setIsCreating(false);
    setEditingBusiness(null);
  };
  
  const handleConfirmDelete = async () => {
    if (!businessToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: "Business Deleted",
        description: `${businessToDelete.name} has been deleted.`,
      });
      
      fetchBusinesses(currentPage, searchTerm);
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
      setBusinessToDelete(null);
    }
  };
  
  const handleSaveBusiness = async () => {
    if (!editingBusiness) return;
    
    try {
      if (isCreating) {
        // Process tags to ensure it's an array
        let tagsArray: string[] = [];
        
        if (typeof editingBusiness.tags === 'string') {
          tagsArray = editingBusiness.tags.split(',').map(tag => tag.trim());
        } else if (Array.isArray(editingBusiness.tags)) {
          tagsArray = editingBusiness.tags;
        }
        
        // Create new business
        const { error } = await supabase
          .from('businesses')
          .insert([{
            name: editingBusiness.name,
            category: editingBusiness.category,
            description: editingBusiness.description,
            address: editingBusiness.address,
            phone: editingBusiness.phone,
            email: editingBusiness.email,
            website: editingBusiness.website,
            rating: editingBusiness.rating,
            reviews: editingBusiness.reviews || 0,
            featured: editingBusiness.featured,
            tags: tagsArray,
            image: editingBusiness.image
          }]);
        
        if (error) throw error;
        
        toast({
          title: "Business Created",
          description: `${editingBusiness.name} has been created.`,
        });
      } else {
        // Process tags for update
        let tagsArray: string[] = [];
        
        if (typeof editingBusiness.tags === 'string') {
          tagsArray = editingBusiness.tags.split(',').map(tag => tag.trim());
        } else if (Array.isArray(editingBusiness.tags)) {
          tagsArray = editingBusiness.tags;
        }
        
        const { error } = await supabase
          .from('businesses')
          .update({
            name: editingBusiness.name,
            category: editingBusiness.category,
            description: editingBusiness.description,
            address: editingBusiness.address,
            phone: editingBusiness.phone,
            email: editingBusiness.email,
            website: editingBusiness.website,
            rating: editingBusiness.rating,
            reviews: editingBusiness.reviews,
            featured: editingBusiness.featured,
            tags: tagsArray,
            image: editingBusiness.image
          })
          .eq('id', editingBusiness.id);
        
        if (error) throw error;
        
        toast({
          title: "Business Updated",
          description: `${editingBusiness.name} has been updated.`,
        });
      }
      
      fetchBusinesses(currentPage, searchTerm);
      handleCloseDialog();
    } catch (error) {
      toast({
        title: "Save Failed",
        description: String(error),
        variant: "destructive"
      });
    }
  };
  
  const handleDownloadTemplate = () => {
    try {
      // Create a sample CSV template
      const csvHeader = "Business Name,Category,Address,Mobile Number,Review,Description,Email,Website,Tags\n";
      const sampleRow1 = "Acme Coffee Shop,Cafe,123 Main St,555-123-4567,4.5,Best coffee in town,info@acmecoffee.com,https://acmecoffee.com,\"coffee, pastries\"\n";
      const sampleRow2 = "Tech Solutions,Technology,456 Tech Blvd,555-987-6543,5,Professional IT services,contact@techsolutions.com,https://techsolutions.com,\"it, services, computer repair\"\n";
      const csvContent = csvHeader + sampleRow1 + sampleRow2;
      
      // Create blob and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', 'business_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Template Downloaded",
        description: "CSV template has been downloaded.",
      });
    } catch (error) {
      console.error("Error downloading template:", error);
      toast({
        title: "Download Error",
        description: "There was an error downloading the template.",
        variant: "destructive"
      });
    }
  };
  
  const handleUploadComplete = (success: boolean, message: string, count?: number) => {
    setShowUploadDialog(false);
    
    if (success) {
      toast({
        title: "Upload Successful",
        description: `Successfully imported ${count} businesses`,
      });
      
      // Refresh the list after successful upload
      fetchBusinesses(1);
    } else {
      toast({
        title: "Upload Failed",
        description: message,
        variant: "destructive",
      });
    }
  };
  
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Business Listings</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading businesses...' : `Total businesses: ${totalCount}`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
            <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              CSV Upload
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleCreateBusiness}>
              <Plus className="h-4 w-4 mr-2" />
              Add Business
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Input
              placeholder="Search by name, category or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="max-w-sm"
              disabled={isLoading || isSearching}
            />
            <Button 
              variant="outline" 
              onClick={handleSearch}
              disabled={isLoading || isSearching}
            >
              Search
            </Button>
          </div>
          
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
                      </div>
                      <div className="mt-2">Loading businesses...</div>
                    </TableCell>
                  </TableRow>
                ) : businesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No businesses found.
                    </TableCell>
                  </TableRow>
                ) : (
                  businesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                            {business.image ? (
                              <img 
                                src={business.image} 
                                alt={business.name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-lg text-gray-400">
                                {business.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{business.name}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {business.address || 'No address'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {business.category || 'Uncategorized'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span>{business.rating.toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground ml-1">
                            ({business.reviews || 0})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {business.phone || 'No phone'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {business.email || 'No email'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {business.featured ? (
                          <Badge variant="default">Featured</Badge>
                        ) : (
                          <Badge variant="outline">Regular</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditBusiness(business)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteBusiness(business)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <CSVUploadDialog
        show={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUploadComplete={handleUploadComplete}
      />
      
      <Sheet 
        open={isEditing || isCreating} 
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
      >
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? 'Edit' : 'Create'} Business
            </SheetTitle>
            <SheetDescription>
              {isEditing 
                ? 'Update the business details' 
                : 'Create a new business listing'}
            </SheetDescription>
          </SheetHeader>
          
          {editingBusiness && (
            <div className="py-4 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name</Label>
                <Input 
                  id="name" 
                  value={editingBusiness.name} 
                  onChange={(e) => setEditingBusiness({...editingBusiness, name: e.target.value})}
                  placeholder="e.g. Acme Coffee Shop"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category" 
                  value={editingBusiness.category || ''} 
                  onChange={(e) => setEditingBusiness({...editingBusiness, category: e.target.value})}
                  placeholder="e.g. Cafe, Restaurant, Technology"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={editingBusiness.description || ''} 
                  onChange={(e) => setEditingBusiness({...editingBusiness, description: e.target.value})}
                  placeholder="Business description"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  value={editingBusiness.address || ''} 
                  onChange={(e) => setEditingBusiness({...editingBusiness, address: e.target.value})}
                  placeholder="Full address"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={editingBusiness.phone || ''} 
                    onChange={(e) => setEditingBusiness({...editingBusiness, phone: e.target.value})}
                    placeholder="Contact phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={editingBusiness.email || ''} 
                    onChange={(e) => setEditingBusiness({...editingBusiness, email: e.target.value})}
                    placeholder="Contact email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  value={editingBusiness.website || ''} 
                  onChange={(e) => setEditingBusiness({...editingBusiness, website: e.target.value})}
                  placeholder="Website URL"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input 
                    id="rating" 
                    type="number" 
                    min="0" 
                    max="5" 
                    step="0.1"
                    value={editingBusiness.rating || 0} 
                    onChange={(e) => setEditingBusiness({...editingBusiness, rating: Number(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reviews">Reviews Count</Label>
                  <Input 
                    id="reviews" 
                    type="number"
                    min="0"
                    value={editingBusiness.reviews || 0} 
                    onChange={(e) => setEditingBusiness({...editingBusiness, reviews: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input 
                  id="image" 
                  value={editingBusiness.image || ''} 
                  onChange={(e) => setEditingBusiness({...editingBusiness, image: e.target.value})}
                  placeholder="Image URL"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input 
                  id="tags" 
                  value={Array.isArray(editingBusiness.tags) ? editingBusiness.tags.join(', ') : (editingBusiness.tags || '')} 
                  onChange={(e) => setEditingBusiness({...editingBusiness, tags: e.target.value})}
                  placeholder="e.g. coffee, pastries, breakfast"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="featured" 
                  checked={editingBusiness.featured || false} 
                  onCheckedChange={(checked) => setEditingBusiness({...editingBusiness, featured: checked})}
                />
                <Label htmlFor="featured">Featured Business</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSaveBusiness}>
                  Save Business
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      
      {confirmDelete && businessToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Confirm Deletion</CardTitle>
              <CardDescription>
                Are you sure you want to delete this business? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p><strong>Business:</strong> {businessToDelete.name}</p>
                <p><strong>Category:</strong> {businessToDelete.category || 'Uncategorized'}</p>
                <p><strong>Address:</strong> {businessToDelete.address || 'No address'}</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setConfirmDelete(false);
                    setBusinessToDelete(null);
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Business'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default SupabaseBusinessesPanel;
