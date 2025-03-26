
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BusinessForm, { BusinessFormValues } from './BusinessForm';
import { Business } from '@/types/business';
import { ScrollArea } from "@/components/ui/scroll-area";

export interface BusinessFormDialogProps {
  show: boolean;
  isOpen?: boolean; // For backward compatibility
  onClose: () => void;
  business?: Business | null;
  initialData?: Business | null; // For backward compatibility
  onSubmit: (values: BusinessFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const BusinessFormDialog: React.FC<BusinessFormDialogProps> = ({
  show,
  isOpen,
  onClose,
  business,
  initialData,
  onSubmit,
  isSubmitting
}) => {
  // Use show or isOpen, whichever is provided
  const isDialogOpen = show || isOpen || false;
  // Use business or initialData, whichever is provided
  const businessData = business || initialData || null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{businessData ? 'Edit Business' : 'Add New Business'}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-1">
            <BusinessForm 
              initialData={businessData}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessFormDialog;
