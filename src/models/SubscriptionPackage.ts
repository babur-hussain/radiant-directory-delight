
export interface ISubscriptionPackage {
  id?: string;
  name: string;
  description: string;
  price: number;
  type: string;
  duration: number;
  features?: string[];
  isActive?: boolean;
  updatedAt?: string | Date;
  createdAt?: string | Date;
  displayOrder?: number;
  discountPercentage?: number;
  maxUsers?: number;
  isPopular?: boolean;
  metadata?: Record<string, any>;
}
