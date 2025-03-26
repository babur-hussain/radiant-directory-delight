
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { UserSubscription } from '@/types/auth';

interface UseSubscriptionAssignmentReturn {
  subscription: UserSubscription | null;
  setSubscription: (subscription: UserSubscription) => void;
  assignSubscription: (transactionId: string) => void;
}

export const useSubscriptionAssignment = (): UseSubscriptionAssignmentReturn => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const { toast } = useToast();

  const assignSubscription = (transactionId: string) => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to assign a subscription.",
        variant: "destructive",
      });
      return;
    }

    setSubscription(prev => {
      if (!prev) return prev;
      
      // Create a new object that includes all properties from prev
      // and adds/updates the transaction_id property
      return {
        ...prev,
        status: 'active',
        transaction_id: transactionId
      };
    });

    toast({
      title: "Subscription Assigned",
      description: `Subscription assigned successfully with transaction ID: ${transactionId}`,
    });
  };

  return { subscription, setSubscription, assignSubscription };
};
