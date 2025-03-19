
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { 
  createSubscriptionPackage, 
  getAllSubscriptionPackages, 
  updateSubscriptionPackage, 
  deleteSubscriptionPackage 
} from '@/api/mongoAPI';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import SubscriptionLoader from './SubscriptionLoader';
import SubscriptionPermissionError from './SubscriptionPermissionError';
import CentralizedSubscriptionManager from './CentralizedSubscriptionManager';

interface SubscriptionManagementProps {
  onPermissionError: (error: any) => void;
  dbInitialized: boolean;
  connectionStatus: 'connecting' | 'connected' | 'error' | 'offline';
  onRetryConnection: () => void;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ 
  onPermissionError,
  dbInitialized,
  connectionStatus,
  onRetryConnection
}) => {
  const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ISubscriptionPackage | null>(null);
  const { toast } = useToast();
  const [error, setError] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllSubscriptionPackages();
      setPackages(data);
    } catch (err) {
      console.error("Error fetching subscription packages:", err);
      setError(err);
      onPermissionError(err);
      toast({
        title: "Failed to load packages",
        description: "Failed to load subscription packages. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [onPermissionError, toast]);

  useEffect(() => {
    if (dbInitialized) {
      fetchData();
    }
  }, [fetchData, dbInitialized]);

  const handleCreate = () => {
    setSelectedPackage(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (packageData: ISubscriptionPackage) => {
    setSelectedPackage(packageData);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubscriptionPackage(id);
      setPackages(packages.filter(p => p.id !== id));
      toast({
        title: "Package deleted",
        description: "Subscription package deleted successfully.",
      });
    } catch (err) {
      console.error("Error deleting subscription package:", err);
      setError(err);
      onPermissionError(err);
      toast({
        title: "Failed to delete package",
        description: "Failed to delete subscription package. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (packageData: ISubscriptionPackage) => {
    try {
      if (isEditing && selectedPackage?.id) {
        // Update existing package
        await updateSubscriptionPackage(selectedPackage.id, packageData);
        setPackages(packages.map(p => (p.id === selectedPackage.id ? { ...p, ...packageData } : p)));
        toast({
          title: "Package updated",
          description: "Subscription package updated successfully.",
        });
      } else {
        // Create new package
        await createSubscriptionPackage(packageData);
        setPackages([...packages, packageData]);
        toast({
          title: "Package created",
          description: "Subscription package created successfully.",
        });
      }
      setIsDialogOpen(false);
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Error saving subscription package:", err);
      setError(err);
      onPermissionError(err);
      toast({
        title: "Failed to save package",
        description: "Failed to save subscription package. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsDialogOpen(false);
  };

  const sortedPackages = [...packages].sort((a, b) => {
    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bTime - aTime;
  });

  const initialData: ISubscriptionPackage = {
    name: '',
    description: '',
    price: 0,
    type: 'business',
    duration: 1,
  };

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Subscription Packages</h2>
        <Button onClick={handleCreate}>Create New</Button>
      </div>

      <SubscriptionLoader 
        isLoading={isLoading} 
        connectionStatus={connectionStatus}
        onRetry={onRetryConnection}
      />
      
      {error && !isLoading && (
        <SubscriptionPermissionError error={error} onRetry={fetchData} />
      )}

      {!isLoading && !error && (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPackages.length > 0 ? (
                sortedPackages.map((pkg) => (
                  <TableRow key={pkg.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEdit(pkg)}>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>{pkg.type}</TableCell>
                    <TableCell>₹{pkg.price}</TableCell>
                    <TableCell>{pkg.duration} months</TableCell>
                    <TableCell>
                      <Badge variant={pkg.isActive ? "default" : "secondary"}>
                        {pkg.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(pkg.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(pkg);
                      }}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(pkg.id || '');
                        }}
                        className="ml-2"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No subscription packages found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <CentralizedSubscriptionManager 
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        isEditing={isEditing}
        selectedPackage={selectedPackage}
        onSave={handleSave}
        onCancel={handleCancelEdit}
        initialData={initialData}
      />
    </div>
  );
};

export default SubscriptionManagement;
