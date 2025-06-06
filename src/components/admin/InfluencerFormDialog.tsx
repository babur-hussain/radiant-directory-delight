
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
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {influencer ? "Edit Influencer" : "Add New Influencer"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
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
