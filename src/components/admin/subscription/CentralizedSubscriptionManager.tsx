
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
  isSaving?: boolean;
}

const CentralizedSubscriptionManager: React.FC<CentralizedSubscriptionManagerProps> = ({
  isDialogOpen,
  setIsDialogOpen,
  isEditing,
  selectedPackage,
  handleSave,
  handleCancelEdit,
  initialData,
  isSaving = false,
}) => {
  const onSubmit = async (packageData: ISubscriptionPackage) => {
    // Ensure text fields are properly handled without truncation
    const processedData: ISubscriptionPackage = {
      ...packageData,
      // Ensure proper string conversion for text fields
      fullDescription: String(packageData.fullDescription || ''),
      termsAndConditions: String(packageData.termsAndConditions || ''),
      shortDescription: String(packageData.shortDescription || '')
    };
    
    await handleSave(processedData);
  };

  const onCancel = () => {
    handleCancelEdit();
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
            isSaving={isSaving}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CentralizedSubscriptionManager;
