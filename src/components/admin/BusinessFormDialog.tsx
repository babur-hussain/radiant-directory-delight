
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {currentBusinessToEdit ? 'Edit Business' : 'Add New Business'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDialog(false)}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <DialogDescription>
            {currentBusinessToEdit 
              ? 'Update the details for this business.' 
              : 'Enter the details for the new business.'}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="px-6 py-4 max-h-[calc(90vh-140px)]">
          <BusinessForm
            initialValues={currentBusinessToEdit || undefined}
            onSubmit={onSubmit}
            onCancel={() => setShowDialog(false)}
            isSubmitting={isSubmitting}
          />
        </ScrollArea>
        
        <DialogFooter className="p-6 pt-2 border-t">
          <Button 
            variant="outline" 
            onClick={() => setShowDialog(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            disabled={isSubmitting}
            form="business-form"
            type="submit"
          >
            {isSubmitting ? "Saving..." : currentBusinessToEdit ? "Update Business" : "Add Business"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessFormDialog;
