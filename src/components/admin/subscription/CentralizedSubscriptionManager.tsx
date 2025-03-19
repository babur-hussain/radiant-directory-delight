import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, Copy, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import SubscriptionPackageForm from './SubscriptionPackageForm';

interface CentralizedSubscriptionManagerProps {
  packages: ISubscriptionPackage[];
  onSave: (packageData: ISubscriptionPackage) => Promise<void>;
  onDelete: (packageId: string) => Promise<void>;
}

const CentralizedSubscriptionManager: React.FC<CentralizedSubscriptionManagerProps> = ({ 
  packages, 
  onSave, 
  onDelete 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [initialData, setInitialData] = useState<ISubscriptionPackage>({
    name: '',
    description: '',
    price: 0,
    type: 'business',
    duration: 1,
    isActive: true,
  });
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreate = () => {
    setInitialData({
      name: '',
      description: '',
      price: 0,
      type: 'business',
      duration: 1,
      isActive: true,
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleEdit = (packageId: string) => {
    const packageToEdit = packages.find(p => p.id === packageId);
    if (packageToEdit) {
      setInitialData(packageToEdit);
      setSelectedPackageId(packageId);
      setIsEditing(true);
      setIsCreating(false);
    }
  };

  const handleDelete = async (packageId: string) => {
    try {
      await onDelete(packageId);
      toast({
        title: "Package Deleted",
        description: "Subscription package deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting package:", error);
      toast({
        title: "Error",
        description: "Failed to delete subscription package.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data: ISubscriptionPackage) => {
    try {
      await onSave(data);
      toast({
        title: "Package Saved",
        description: "Subscription package saved successfully.",
      });
      handleCancelEdit();
    } catch (error) {
      console.error("Error saving package:", error);
      toast({
        title: "Error",
        description: "Failed to save subscription package.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedPackageId(null);
  };

  const columns: ColumnDef<ISubscriptionPackage>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => `₹${row.getValue("price")}`,
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => `${row.getValue("duration")} months`,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive");
        return (
          <Badge variant={isActive ? "outline" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const packageId = row.original.id;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(packageId || '')}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-500">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the subscription package from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(packageId || '')}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={handleCreate}>Create New Package</Button>
      </div>

      {isCreating || isEditing ? (
        <SubscriptionPackageForm 
          packageData={initialData}
          onSave={handleSubmit}
          onCancel={handleCancelEdit}
        />
      ) : (
        <DataTable columns={columns} data={packages} />
      )}
    </div>
  );
};

export default CentralizedSubscriptionManager;
