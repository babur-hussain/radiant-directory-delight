
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useSubscriptionPackages, ISubscriptionPackage } from '@/hooks/useSubscriptionPackages';
import { CheckCircle2, AlertCircle, RefreshCw, Database, Activity } from 'lucide-react';

interface SubscriptionPackageManagementProps {
  onPermissionError?: (error: any) => void; 
  dbInitialized: boolean; 
  connectionStatus: string;
  onRetryConnection?: () => void;
}

const SubscriptionPackageManagement: React.FC<SubscriptionPackageManagementProps> = ({ 
  onPermissionError, 
  dbInitialized, 
  connectionStatus,
  onRetryConnection
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newPackage, setNewPackage] = useState<Partial<ISubscriptionPackage>>({
    type: 'Business',
    paymentType: 'recurring'
  });
  const { toast } = useToast();
  const { packages, isLoading, isError, error, refetch, createOrUpdate, remove } = useSubscriptionPackages();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPackage(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewPackage(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddPackage = async () => {
    if (!newPackage.title || !newPackage.price || !newPackage.durationMonths || !newPackage.shortDescription || !newPackage.fullDescription) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createOrUpdate(newPackage as ISubscriptionPackage);
      toast({
        title: "Success",
        description: "Subscription package added successfully.",
      });
      setNewPackage({ type: 'Business', paymentType: 'recurring' });
      setIsAdding(false);
      await refetch();
    } catch (err) {
      console.error("Error adding package:", err);
      toast({
        title: "Error",
        description: `Failed to add package: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive"
      });
    }
  };

  const handleRemovePackage = async (id: string) => {
    try {
      await remove(id);
      toast({
        title: "Success",
        description: "Subscription package removed successfully.",
      });
      await refetch();
    } catch (err) {
      console.error("Error removing package:", err);
      toast({
        title: "Error",
        description: `Failed to remove package: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <p>Loading subscription packages...</p>;
  }

  if (isError) {
    return <p>Error: {error?.message}</p>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Subscription Package Management</CardTitle>
        <CardDescription>
          Add, edit, and remove subscription packages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
            {isAdding ? 'Adding...' : 'Add New Package'}
          </Button>
        </div>

        {isAdding && (
          <Card className="mb-4">
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input type="text" id="title" name="title" value={newPackage.title || ''} onChange={handleInputChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input type="number" id="price" name="price" value={newPackage.price || ''} onChange={handleInputChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="durationMonths">Duration (Months)</Label>
                <Input type="number" id="durationMonths" name="durationMonths" value={newPackage.durationMonths || ''} onChange={handleInputChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input type="text" id="shortDescription" name="shortDescription" value={newPackage.shortDescription || ''} onChange={handleInputChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fullDescription">Full Description</Label>
                <Input type="text" id="fullDescription" name="fullDescription" value={newPackage.fullDescription || ''} onChange={handleInputChange} />
              </div>
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button onClick={handleAddPackage}>Add Package</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Table>
          <TableCaption>List of available subscription packages.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-mono text-xs">{pkg.id}</TableCell>
                <TableCell>{pkg.title}</TableCell>
                <TableCell>₹{pkg.price}</TableCell>
                <TableCell>{pkg.type}</TableCell>
                <TableCell>
                  <Button variant="destructive" size="sm" onClick={() => handleRemovePackage(pkg.id)}>
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPackageManagement;
