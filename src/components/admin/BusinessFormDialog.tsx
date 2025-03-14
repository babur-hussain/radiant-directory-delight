
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BusinessForm, { BusinessFormValues } from './BusinessForm';
import { Business } from '@/lib/csv-utils';

interface BusinessFormDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  currentBusinessToEdit: Business | null;
  onSubmit: (values: BusinessFormValues) => void;
  isSubmitting: boolean;
}

const BusinessFormDialog: React.FC<BusinessFormDialogProps> = ({
  showDialog,
  setShowDialog,
  currentBusinessToEdit,
  onSubmit,
  isSubmitting
}) => {
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{currentBusinessToEdit ? 'Edit Business' : 'Add New Business'}</DialogTitle>
          <DialogDescription>
            {currentBusinessToEdit 
              ? 'Update the details for this business.' 
              : 'Enter the details for the new business.'}
          </DialogDescription>
        </DialogHeader>
        
        <BusinessForm
          initialValues={currentBusinessToEdit || undefined}
          onSubmit={onSubmit}
          onCancel={() => setShowDialog(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BusinessFormDialog;
