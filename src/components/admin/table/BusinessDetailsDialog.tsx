
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Business } from '@/lib/csv-utils';
import BusinessDetails from './BusinessDetails';

interface BusinessDetailsDialogProps {
  business: Business | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BusinessDetailsDialog: React.FC<BusinessDetailsDialogProps> = ({
  business,
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{business?.name}</DialogTitle>
          <DialogDescription>Business Details</DialogDescription>
        </DialogHeader>
        {business && <BusinessDetails business={business} />}
      </DialogContent>
    </Dialog>
  );
};

export default BusinessDetailsDialog;
