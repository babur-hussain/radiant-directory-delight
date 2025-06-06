
import React from "react";
import { CalendarDays, Clock, AlertTriangle, Pause, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdvancedSubscriptionDetailsProps {
  subscription: any;
}

const AdvancedSubscriptionDetails: React.FC<AdvancedSubscriptionDetailsProps> = ({ 
  subscription 
}) => {
  if (!subscription) return null;

  // Format dates
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-2 text-sm">
      <div className="flex flex-col space-y-1 mt-2">
        <div className="flex items-center text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span className="text-xs">Advanced Settings</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pl-1 mt-1">
          <div>
            <span className="text-xs text-muted-foreground">Advance Payment:</span>
            <span className="text-xs ml-1 font-medium">
              {subscription.advancePaymentMonths || 0} months
            </span>
          </div>
          
          <div>
            <span className="text-xs text-muted-foreground">Signup Fee:</span>
            <span className="text-xs ml-1 font-medium">
              ₹{subscription.signupFee || 0}
            </span>
          </div>
          
          <div>
            <span className="text-xs text-muted-foreground">Assignment Date:</span>
            <span className="text-xs ml-1 font-medium">
              {formatDate(subscription.startDate)}
            </span>
          </div>
          
          <div>
            <span className="text-xs text-muted-foreground">Actual Start Date:</span>
            <span className="text-xs ml-1 font-medium">
              {formatDate(subscription.actualStartDate)}
            </span>
          </div>
        </div>
      </div>
      
      {subscription.isPausable && (
        <div className="flex items-center space-x-2 mt-2">
          {subscription.isPaused ? (
            <Badge variant="outline" className="text-xs flex items-center gap-1 py-0">
              <Pause className="h-3 w-3" />
              Paused ({formatDate(subscription.pausedAt)})
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs flex items-center gap-1 bg-green-50 text-green-700 border-green-200 py-0">
              <Play className="h-3 w-3" />
              Active
            </Badge>
          )}
        </div>
      )}
      
      {!subscription.isUserCancellable && (
        <div className="flex items-center space-x-2 mt-1">
          <AlertTriangle className="h-3 w-3 text-amber-500" />
          <span className="text-xs text-muted-foreground">Non-cancellable by user</span>
        </div>
      )}
    </div>
  );
};

export default AdvancedSubscriptionDetails;
