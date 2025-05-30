
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InfluencerForm, { InfluencerFormValues } from "./InfluencerForm";
import { Influencer } from "@/lib/csv/influencerTypes";

interface InfluencerFormDialogProps {
  show: boolean;
  onClose: () => void;
  influencer?: Influencer | null;
  onSubmit: (values: InfluencerFormValues) => void;
  isSubmitting?: boolean;
}

const InfluencerFormDialog: React.FC<InfluencerFormDialogProps> = ({
  show,
  onClose,
  influencer,
  onSubmit,
  isSubmitting = false
}) => {
  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            {influencer ? "Edit Influencer" : "Add New Influencer"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <InfluencerForm
            influencer={influencer}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfluencerFormDialog;
