import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import SubscriptionPackageForm from './SubscriptionPackageForm';
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

  const handleEdit = (params: GridRowParams) => {
    const packageData = params.row as ISubscriptionPackage;
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

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'price', headerName: 'Price', width: 100, valueFormatter: ({ value }) => `₹${value}` },
    { field: 'duration', headerName: 'Duration', width: 100, valueFormatter: ({ value }) => `${value} months` },
    { field: 'isActive', headerName: 'Active', type: 'boolean', width: 80, editable: true },
    {
      field: 'updatedAt',
      headerName: 'Last Updated',
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const date = new Date(params.value as string);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <div>
          <Button variant="outline" size="sm" onClick={() => handleEdit(params)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete((params.row as ISubscriptionPackage).id || '')}
            className="ml-2"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

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
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={sortedPackages}
            columns={columns}
            getRowId={(row) => row.id || ''}
            disableSelectionOnClick
            onRowDoubleClick={handleEdit}
          />
        </div>
      )}

      <CentralizedSubscriptionManager 
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        isEditing={isEditing}
        selectedPackage={selectedPackage}
        handleSave={handleSave}
        handleCancelEdit={handleCancelEdit}
        initialData={initialData}
      />
    </div>
  );
};

export default SubscriptionManagement;
