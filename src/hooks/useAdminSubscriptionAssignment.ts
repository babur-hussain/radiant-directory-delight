
import { useState, useEffect } from 'react';
import { ISubscription, PaymentType, BillingCycle } from '@/models/Subscription';
import { createSubscription, updateSubscription, cancelSubscription } from '@/services/subscriptionService';
import { nanoid } from 'nanoid';

export interface SubscriptionAssignment {
  id: string;
  userId: string;
  userName: string;
  packageId: string;
  packageName: string;
  assignedBy: string;
  assignedAt: string;
  status: string;
}

export const useAdminSubscriptionAssignment = () => {
  const [assignments, setAssignments] = useState<SubscriptionAssignment[]>([]);
  
  const assignSubscription = async (userId: string, subscriptionId: string, assignedBy: string) => {
    try {
      // Create a subscription record
      const now = new Date().toISOString();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      
      const subscriptionData: Partial<ISubscription> = {
        id: nanoid(),
        userId,
        packageId: subscriptionId,
        packageName: "Premium Package", // This should be fetched from the package
        status: "active",
        startDate: now,
        endDate: endDate.toISOString(),
        amount: 0, // This should be fetched from the package
        paymentType: 'one-time' as PaymentType,
        billingCycle: 'yearly' as BillingCycle,
        assignedBy,
        assignedAt: now,
        createdAt: now
      };
      
      const subscription = await createSubscription(subscriptionData);
      
      if (subscription) {
        const newAssignment: SubscriptionAssignment = {
          id: subscription.id,
          userId: subscription.userId,
          userName: "User Name", // This should be fetched from user data
          packageId: subscription.packageId,
          packageName: subscription.packageName,
          assignedBy: assignedBy,
          assignedAt: now,
          status: subscription.status
        };
        
        setAssignments(prev => [...prev, newAssignment]);
      }
    } catch (error) {
      console.error('Error assigning subscription:', error);
    }
  };
  
  const updateAssignmentStatus = async (userId: string, status: 'active' | 'cancelled' | 'inactive') => {
    try {
      const assignment = assignments.find(a => a.userId === userId);
      
      if (!assignment) {
        console.error('No assignment found for user:', userId);
        return;
      }
      
      if (status === 'cancelled') {
        const updatedSubscription = await cancelSubscription(assignment.id, 'Cancelled by admin');
        
        if (updatedSubscription) {
          setAssignments(prev => 
            prev.map(a => a.id === assignment.id 
              ? { ...a, status: 'cancelled' } 
              : a
            )
          );
        }
      } else {
        const updatedSubscription = await updateSubscription(assignment.id, { status });
        
        if (updatedSubscription) {
          setAssignments(prev => 
            prev.map(a => a.id === assignment.id 
              ? { ...a, status: updatedSubscription.status } 
              : a
            )
          );
        }
      }
    } catch (error) {
      console.error('Error updating assignment status:', error);
    }
  };
  
  return {
    assignments,
    assignSubscription,
    updateAssignmentStatus
  };
};
