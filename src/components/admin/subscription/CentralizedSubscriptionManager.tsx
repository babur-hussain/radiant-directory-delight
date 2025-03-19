
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SubscriptionPackageForm from './SubscriptionPackageForm';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

interface CentralizedSubscriptionManagerProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  isEditing: boolean;
  selectedPackage: ISubscriptionPackage | null;
  handleSave: (packageData: ISubscriptionPackage) => Promise<void>;
  handleCancelEdit: () => void;
  initialData: ISubscriptionPackage;
}

const CentralizedSubscriptionManager: React.FC<CentralizedSubscriptionManagerProps> = ({
  isDialogOpen,
  setIsDialogOpen,
  isEditing,
  selectedPackage,
  handleSave,
  handleCancelEdit,
  initialData,
}) => {
  const onSubmit = async (packageData: ISubscriptionPackage) => {
    await handleSave(packageData);
    setIsDialogOpen(false);
  };

  const onCancel = () => {
    handleCancelEdit();
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Subscription Package' : 'Create New Subscription Package'}
          </DialogTitle>
        </DialogHeader>
        {isDialogOpen && (
          <SubscriptionPackageForm
            package={selectedPackage || initialData}
            onSave={onSubmit}
            onCancel={onCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CentralizedSubscriptionManager;
