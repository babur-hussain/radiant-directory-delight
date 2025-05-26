
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {influencer ? "Edit Influencer" : "Add New Influencer"}
          </DialogTitle>
        </DialogHeader>
        
        <InfluencerForm
          influencer={influencer}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default InfluencerFormDialog;
