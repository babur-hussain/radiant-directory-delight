import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { formatPrice } from '@/utils/format';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import RazorpayButton from './RazorpayButton';
import { cn } from '@/utils/cn';

interface SubscriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPackage: ISubscriptionPackage;
}

const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedPackage
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { purchaseSubscription } = useSubscription(user?.uid);
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Subscription Activated",
      description: `Successfully subscribed to ${selectedPackage.title}`,
    });
    onOpenChange(false);
  };

  const handleFailure = (error: any) => {
    console.error("Subscription failed:", error);
    toast({
      title: "Subscription Failed",
      description: error.message || "An error occurred while processing your subscription",
      variant: "destructive"
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{selectedPackage.title}</DialogTitle>
          <DialogDescription>
            Confirm your subscription to the {selectedPackage.title} plan.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h4 className="text-sm font-medium text-gray-500">Plan Details</h4>
          <ul className="mt-2 space-y-1">
            {selectedPackage.features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Badge variant="secondary">
              {selectedPackage.paymentType === 'recurring' ? 'Recurring' : 'One-Time'}
            </Badge>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <RazorpayButton
            packageData={selectedPackage}
            onSuccess={handleSuccess}
            onFailure={handleFailure}
            buttonText="Subscribe Now"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
