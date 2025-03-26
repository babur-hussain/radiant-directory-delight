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
      return {
        ...prev,
        status: 'active',
        transaction_id: transactionId // Use the correct property name
      };
    });

    toast({
      title: "Subscription Assigned",
      description: `Subscription assigned successfully with transaction ID: ${transactionId}`,
    });
  };

  return { subscription, setSubscription, assignSubscription };
};
