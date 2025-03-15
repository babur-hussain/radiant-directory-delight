
import { Timestamp } from "firebase/firestore";

// Define subscription data interface
export interface SubscriptionData {
  id?: string;
  userId: string;
  packageId: string;
  packageName: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt?: any;
  updatedAt?: any;
  cancelledAt?: string;
  cancelReason?: string;
  assignedBy?: string;
  assignedAt?: string;
  [key: string]: any; // Allow additional properties
}
