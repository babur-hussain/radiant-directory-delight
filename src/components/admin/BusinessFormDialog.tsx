
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BusinessForm, { BusinessFormValues } from './BusinessForm';
import { Business } from '@/lib/csv-utils';

export interface BusinessFormDialogProps {
  show: boolean;
  onClose: () => void;
  business: Business | null;
  onSubmit: (values: BusinessFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const BusinessFormDialog: React.FC<BusinessFormDialogProps> = ({
  show,
  onClose,
  business,
  onSubmit,
  isSubmitting
}) => {
  return (
    <Dialog open={show} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{business ? 'Edit Business' : 'Add New Business'}</DialogTitle>
        </DialogHeader>
        
        <BusinessForm 
          initialData={business}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BusinessFormDialog;
