
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import SubscriptionPackageForm from './SubscriptionPackageForm';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

interface CentralizedSubscriptionManagerProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  isEditing: boolean;
  selectedPackage: ISubscriptionPackage | null;
  onSave: (packageData: ISubscriptionPackage) => Promise<void>;
  onCancel: () => void;
  initialData: ISubscriptionPackage;
}

const CentralizedSubscriptionManager: React.FC<CentralizedSubscriptionManagerProps> = ({
  isDialogOpen,
  setIsDialogOpen,
  isEditing,
  selectedPackage,
  onSave,
  onCancel,
  initialData
}) => {
  const packageData = isEditing && selectedPackage ? selectedPackage : initialData;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Create'} Subscription Package</DialogTitle>
        </DialogHeader>
        
        <SubscriptionPackageForm
          packageData={packageData}
          onSave={onSave}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CentralizedSubscriptionManager;
