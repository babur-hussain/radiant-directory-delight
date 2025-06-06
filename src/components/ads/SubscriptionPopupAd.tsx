
import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPopupAdProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubscriptionPopupAd: React.FC<SubscriptionPopupAdProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDismissed, setIsDismissed] = useState(false);
  
  const handleSubscribeClick = useCallback(() => {
    onOpenChange(false);
    localStorage.setItem('subscription_popup_shown', 'true');
    navigate('/subscription');
  }, [navigate, onOpenChange]);
  
  const handleDismiss = useCallback(() => {
    onOpenChange(false);
    localStorage.setItem('subscription_popup_shown', 'true');
    setIsDismissed(true);
    toast({
      title: 'Dismissed',
      description: 'You can always subscribe later from your profile.',
    });
  }, [onOpenChange, toast]);
  
  return (
    <Dialog open={open && !isDismissed} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl flex items-center">
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Unlock Premium Features
            </span>
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Take your experience to the next level with our subscription plans!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-3">
            <p className="text-sm font-medium">Why subscribe?</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Access exclusive premium features and content</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Priority support from our dedicated team</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Unlock advanced analytics and reporting tools</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-primary/10 p-4 rounded-md">
            <p className="text-sm font-semibold mb-1">Limited time offer!</p>
            <p className="text-xs md:text-sm">
              Subscribe today and get 15% off your first month. Use code <strong>WELCOME15</strong>
            </p>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
          <Button variant="ghost" size="sm" onClick={handleDismiss} className="sm:mr-auto">
            <X className="h-4 w-4 mr-1" /> Not now
          </Button>
          
          <Button onClick={handleSubscribeClick}>
            View Subscription Plans <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionPopupAd;
