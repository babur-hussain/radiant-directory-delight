
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AdvancePaymentOption } from "@/lib/subscription/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface AdvancedSubscriptionControlsProps {
  advancePaymentMonths: number;
  setAdvancePaymentMonths: (months: number) => void;
  signupFee: number;
  setSignupFee: (fee: number) => void;
  isPausable: boolean;
  setIsPausable: (pausable: boolean) => void;
  advancePaymentOptions: AdvancePaymentOption[];
  isDisabled: boolean;
}

const AdvancedSubscriptionControls: React.FC<AdvancedSubscriptionControlsProps> = ({
  advancePaymentMonths,
  setAdvancePaymentMonths,
  signupFee,
  setSignupFee,
  isPausable,
  setIsPausable,
  advancePaymentOptions,
  isDisabled
}) => {
  return (
    <div className="space-y-4 p-4 border rounded-md bg-muted/30">
      <h3 className="text-sm font-medium text-primary mb-2">Advanced Subscription Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="advancePayment" className="text-xs">Advance Payment Period</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[200px] text-xs">
                    Number of months the user must pay in advance. Subscription starts after this period.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select
            value={advancePaymentMonths.toString()}
            onValueChange={(value) => setAdvancePaymentMonths(parseInt(value))}
            disabled={isDisabled}
          >
            <SelectTrigger id="advancePayment" className="w-full">
              <SelectValue placeholder="Select advance payment period" />
            </SelectTrigger>
            <SelectContent>
              {advancePaymentOptions.map((option) => (
                <SelectItem key={option.months} value={option.months.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="signupFee" className="text-xs">One-time Signup Fee (₹)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[200px] text-xs">
                    One-time fee charged when the subscription is created
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="signupFee"
            type="number"
            value={signupFee}
            onChange={(e) => setSignupFee(parseInt(e.target.value) || 0)}
            min={0}
            step={100}
            disabled={isDisabled}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 pt-2">
        <Switch
          id="pausable"
          checked={isPausable}
          onCheckedChange={setIsPausable}
          disabled={isDisabled}
        />
        <div className="grid gap-1.5 leading-none">
          <Label htmlFor="pausable" className="text-xs cursor-pointer">
            Allow admin to pause this subscription
          </Label>
          <p className="text-xs text-muted-foreground">
            If enabled, admins can pause and resume this subscription
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSubscriptionControls;
