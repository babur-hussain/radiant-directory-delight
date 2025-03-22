
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, CreditCard, Check, Calendar, AlertTriangle } from 'lucide-react';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useNavigate } from 'react-router-dom';

interface SubscriptionDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedPackage: ISubscriptionPackage | null;
}

const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedPackage
}) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (selectedPackage) {
      navigate(`/subscription/details/${selectedPackage.id}`);
    }
  };

  // Format currency with Indian format
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!selectedPackage) return null;

  const isOneTime = selectedPackage.paymentType === 'one-time';
  const isMonthly = selectedPackage.billingCycle === 'monthly';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{selectedPackage.title}</DialogTitle>
          <DialogDescription>
            {selectedPackage.shortDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Price Display */}
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-primary">
                {isOneTime 
                  ? formatCurrency(selectedPackage.price)
                  : isMonthly && selectedPackage.monthlyPrice 
                    ? formatCurrency(selectedPackage.monthlyPrice) 
                    : formatCurrency(selectedPackage.price)}
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                {isOneTime ? 'one-time' : (isMonthly ? '/month' : '/year')}
              </span>
            </div>
          </div>

          {/* Package Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Duration:</span>
              </div>
              <span>{selectedPackage.durationMonths || 12} months</span>
            </div>

            {selectedPackage.setupFee > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Setup Fee:</span>
                </div>
                <span>{formatCurrency(selectedPackage.setupFee)}</span>
              </div>
            )}

            {!isOneTime && selectedPackage.advancePaymentMonths > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Advance Payment:</span>
                </div>
                <span>{selectedPackage.advancePaymentMonths} months</span>
              </div>
            )}
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-medium mb-2">Key Features:</h4>
            <ul className="space-y-1">
              {selectedPackage.features?.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-start text-sm">
                  <Check className="h-3.5 w-3.5 text-green-500 mr-2 mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
              {selectedPackage.features?.length > 4 && (
                <li className="text-xs text-muted-foreground ml-5">
                  +{selectedPackage.features.length - 4} more features
                </li>
              )}
            </ul>
          </div>

          {/* Payment Type Notice */}
          {isOneTime ? (
            <div className="flex items-start gap-2 bg-amber-50 p-2 rounded text-xs border border-amber-200">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-amber-700">
                This is a one-time payment. No automatic renewals.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2 bg-blue-50 p-2 rounded text-xs border border-blue-200">
              <AlertTriangle className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-blue-700">
                This is a {selectedPackage.billingCycle} subscription with automatic renewal.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
            Close
          </Button>
          <Button onClick={handleGetStarted} className="w-full sm:w-auto">
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
