import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useToast } from '@/hooks/use-toast';
import SubscriptionPackageForm from './SubscriptionPackageForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Check, Edit, Trash2, Plus, AlertCircle, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CentralizedSubscriptionManagerProps {
  packages: ISubscriptionPackage[];
  onSave: (packageData: ISubscriptionPackage) => Promise<any>;
  onDelete: (packageId: string) => Promise<void>;
  isOffline?: boolean;
}

const CentralizedSubscriptionManager: React.FC<CentralizedSubscriptionManagerProps> = ({
  packages,
  onSave,
  onDelete,
  isOffline = false
}) => {
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ISubscriptionPackage | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<ISubscriptionPackage | null>(null);
  const { toast } = useToast();

  const handleAddNew = () => {
    setSelectedPackage(null);
    setIsFormDialogOpen(true);
  };

  const handleEdit = (pkg: ISubscriptionPackage) => {
    setSelectedPackage(pkg);
    setIsFormDialogOpen(true);
  };

  const handleSave = async (packageData: ISubscriptionPackage) => {
    try {
      await onSave(packageData);
      setIsFormDialogOpen(false);
    } catch (error) {
      console.error("Error saving package:", error);
      // Form will stay open to allow user to retry
    }
  };

  const handleDeleteConfirm = (pkg: ISubscriptionPackage) => {
    setPackageToDelete(pkg);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!packageToDelete) return;
    
    try {
      await onDelete(packageToDelete.id || '');
      setIsDeleteDialogOpen(false);
      setPackageToDelete(null);
    } catch (error) {
      console.error("Error deleting package:", error);
      setIsDeleteDialogOpen(false);
      setPackageToDelete(null);
    }
  };

  // Group packages by type
  const businessPackages = packages.filter(pkg => pkg.type === 'Business');
  const influencerPackages = packages.filter(pkg => pkg.type === 'Influencer');
  const otherPackages = packages.filter(pkg => pkg.type !== 'Business' && pkg.type !== 'Influencer');

  return (
    <div className="space-y-8">
      {isOffline && (
        <Alert variant="warning" className="mb-4">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're in offline mode. Viewing packages only - changes won't be saved.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Subscription Packages</h2>
        <Button onClick={handleAddNew} disabled={isOffline}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Package
        </Button>
      </div>

      {/* Business Packages */}
      {businessPackages.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Business Packages</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessPackages.map((pkg) => (
              <PackageCard
                key={pkg.id || pkg.name}
                packageData={pkg}
                onEdit={handleEdit}
                onDelete={handleDeleteConfirm}
                isOffline={isOffline}
              />
            ))}
          </div>
        </div>
      )}

      {/* Influencer Packages */}
      {influencerPackages.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Influencer Packages</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {influencerPackages.map((pkg) => (
              <PackageCard
                key={pkg.id || pkg.name}
                packageData={pkg}
                onEdit={handleEdit}
                onDelete={handleDeleteConfirm}
                isOffline={isOffline}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Packages */}
      {otherPackages.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Other Packages</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherPackages.map((pkg) => (
              <PackageCard
                key={pkg.id || pkg.name}
                packageData={pkg}
                onEdit={handleEdit}
                onDelete={handleDeleteConfirm}
                isOffline={isOffline}
              />
            ))}
          </div>
        </div>
      )}

      {packages.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No subscription packages found</p>
            <Button onClick={handleAddNew} className="mt-4" disabled={isOffline}>
              Add First Package
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit/Add Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPackage ? 'Edit Package' : 'Add New Package'}
            </DialogTitle>
          </DialogHeader>
          <SubscriptionPackageForm
            packageData={selectedPackage}
            onSubmit={handleSave}
            onCancel={() => setIsFormDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the package "{packageToDelete?.name || packageToDelete?.title}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubmit}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface PackageCardProps {
  packageData: ISubscriptionPackage;
  onEdit: (pkg: ISubscriptionPackage) => void;
  onDelete: (pkg: ISubscriptionPackage) => void;
  isOffline?: boolean;
}

const PackageCard: React.FC<PackageCardProps> = ({ packageData, onEdit, onDelete, isOffline }) => {
  const title = packageData.title || packageData.name;
  const price = packageData.price || 0;
  const description = packageData.shortDescription || packageData.description || '';
  const isPopular = packageData.isPopular || packageData.popular;
  const paymentType = packageData.paymentType || 'recurring';

  return (
    <Card className={isPopular ? 'border-primary' : ''}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          {isPopular && <Badge variant="default">Popular</Badge>}
        </div>
        <div className="flex mt-1">
          <span className="text-2xl font-bold">₹{price}</span>
          <span className="text-muted-foreground ml-1 self-end mb-1">
            /{paymentType === 'one-time' ? 'one-time' : (packageData.billingCycle || 'year')}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-3">{description}</p>
        
        {packageData.features && packageData.features.length > 0 && (
          <ul className="space-y-1 mb-4">
            {packageData.features.slice(0, 3).map((feature, idx) => (
              <li key={idx} className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
            {packageData.features.length > 3 && (
              <li className="text-sm text-muted-foreground pl-6">
                +{packageData.features.length - 3} more features
              </li>
            )}
          </ul>
        )}
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(packageData)}
            disabled={isOffline}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(packageData)}
            disabled={isOffline}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CentralizedSubscriptionManager;
