
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Business, IBusiness, convertIBusinessToBusiness, toNumberId, isNumberId } from "@/types/business";

interface TableBusinessListingsProps {
  businesses: Business[];
  onAdd?: () => void;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  onRefresh?: () => Promise<void> | void;
  handleSearch?: (query: string) => void;
  loading?: boolean;
}

const TableBusinessListings: React.FC<TableBusinessListingsProps> = ({
  businesses,
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
  handleSearch,
  loading = false,
}) => {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const { toast } = useToast();

  const handleViewDetails = (business: Business) => {
    setSelectedBusiness(business);
    setIsViewModalOpen(true);
  };

  const handleEditBusiness = (business: Business) => {
    if (onEdit) {
      onEdit(business.id);
    }
  };

  const handleDeleteBusiness = (businessId: string | number) => {
    setSelectedBusiness(businesses.find((b) => b.id === businessId) || null);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBusiness) return;

    setIsDeleteLoading(true);
    try {
      // For numeric IDs, delete from Supabase
      if (isNumberId(selectedBusiness.id)) {
        const { error } = await supabase
          .from("businesses")
          .delete()
          .eq("id", toNumberId(selectedBusiness.id));

        if (error) {
          throw error;
        }
      }

      // If onDelete callback is provided, call it
      if (onDelete) {
        onDelete(selectedBusiness.id);
      }

      toast({
        title: "Business Deleted",
        description: `${selectedBusiness.name} has been deleted successfully.`,
      });

      setIsDeleteModalOpen(false);
      
      // Refresh the list if onRefresh is provided
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Error deleting business:", error);
      toast({
        title: "Error",
        description: "Failed to delete business. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (handleSearch) {
      handleSearch(query);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(businesses.map((business) => business.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectBusiness = (id: string | number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((businessId) => businessId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      // Filter to only numeric IDs for Supabase deletion
      const numericIds = selectedIds
        .filter(id => isNumberId(id))
        .map(id => toNumberId(id));

      if (numericIds.length > 0) {
        // Delete from Supabase
        const { error } = await supabase
          .from("businesses")
          .delete()
          .in("id", numericIds);

        if (error) {
          throw error;
        }
      }

      // Call onDelete for each deleted business
      if (onDelete) {
        selectedIds.forEach((id) => onDelete(id));
      }

      toast({
        title: "Businesses Deleted",
        description: `${selectedIds.length} businesses have been deleted successfully.`,
      });

      setSelectedIds([]);
      
      // Refresh the list if onRefresh is provided
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Error deleting businesses:", error);
      toast({
        title: "Error",
        description: "Failed to delete businesses. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Business Listings</CardTitle>
          <CardDescription>Manage business listings in your directory</CardDescription>
        </div>
        <div className="flex gap-2">
          {onAdd && (
            <Button onClick={onAdd}>
              Add Business
            </Button>
          )}
          {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete Selected ({selectedIds.length})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
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
                <TableHead className="w-12">
                  <Checkbox
                    onCheckedChange={(checked) => {
                      if (typeof checked === 'boolean') {
                        if (checked) {
                          setSelectedIds(businesses.map((business) => business.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }
                    }}
                    checked={selectedIds.length === businesses.length && businesses.length > 0}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Loading businesses...
                  </TableCell>
                </TableRow>
              ) : businesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    No businesses found.
                  </TableCell>
                </TableRow>
              ) : (
                businesses.map((business) => (
                  <TableRow key={business.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(business.id)}
                        onCheckedChange={(checked) => {
                          if (typeof checked === 'boolean') {
                            handleSelectBusiness(business.id, checked);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{business.name}</TableCell>
                    <TableCell>{business.category}</TableCell>
                    <TableCell>{business.rating} / 5</TableCell>
                    <TableCell>{business.featured ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(business)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBusiness(business)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBusiness(business.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

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

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedBusiness?.name}</span>? This action
              cannot be undone.
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleteLoading}
              >
                {isDeleteLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TableBusinessListings;
