
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BusinessForm, { BusinessFormValues } from './BusinessForm';
import { Business } from '@/lib/csv-utils';
import { ScrollArea } from "@/components/ui/scroll-area";

export interface BusinessFormDialogProps {
  show: boolean;
  isOpen?: boolean; // Add this for backward compatibility
  onClose: () => void;
  business?: Business | null;
  initialData?: Business | null; // Add this for backward compatibility
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
      <DialogContent className="p-0">
        <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle>{businessData ? 'Edit Business' : 'Add New Business'}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <ScrollArea className="h-[70vh] px-6 py-4">
            <BusinessForm 
              currentBusiness={businessData}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
            />
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessFormDialog;
