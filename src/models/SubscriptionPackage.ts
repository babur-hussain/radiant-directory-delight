
// Import the type definitions
import { PaymentType, BillingCycle } from './Subscription';

export interface ISubscriptionPackage {
  id: string;
  title: string;
  price: number;
  monthlyPrice?: number;
  setupFee?: number;
  durationMonths?: number;
  shortDescription?: string;
  fullDescription?: string;
  features: string[];
  popular?: boolean;
  type?: "Business" | "Influencer";
  termsAndConditions?: string;
  paymentType: PaymentType; 
  billingCycle?: BillingCycle;
  advancePaymentMonths?: number;
  dashboardSections?: string[];
  createdAt?: string;
  updatedAt?: string;
  // Adding missing properties that are being used in the code
  isActive?: boolean;
  maxBusinesses?: number;
  maxInfluencers?: number;
}

export class SubscriptionPackage implements ISubscriptionPackage {
  id: string;
  title: string;
  price: number;
  monthlyPrice?: number;
  setupFee: number;
  durationMonths: number;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  popular: boolean;
  type: "Business" | "Influencer";
  termsAndConditions?: string;
  paymentType: PaymentType;
  billingCycle?: BillingCycle;
  advancePaymentMonths: number;
  dashboardSections?: string[];
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  maxBusinesses?: number;
  maxInfluencers?: number;

  constructor(data: ISubscriptionPackage) {
    this.id = data.id;
    this.title = data.title;
    this.price = data.price;
    this.monthlyPrice = data.monthlyPrice;
    this.setupFee = data.setupFee || 0;
    this.durationMonths = data.durationMonths || 12;
    this.shortDescription = data.shortDescription || '';
    this.fullDescription = data.fullDescription || '';
    this.features = Array.isArray(data.features) ? data.features : [];
    this.popular = data.popular || false;
    this.type = data.type || 'Business';
    this.termsAndConditions = data.termsAndConditions;
    this.paymentType = data.paymentType || 'recurring';
    this.billingCycle = data.billingCycle;
    this.advancePaymentMonths = data.advancePaymentMonths || 0;
    this.dashboardSections = data.dashboardSections;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.maxBusinesses = data.maxBusinesses || 1;
    this.maxInfluencers = data.maxInfluencers || 1;
  }

  // Add required methods to emulate Mongoose functionality
  static async find(query: any = {}) {
    console.warn('SubscriptionPackage.find is a compatibility method, not implemented fully');
    return [];
  }

  static async countDocuments(query: any = {}) {
    console.warn('SubscriptionPackage.countDocuments is a compatibility method, not implemented fully');
    return 0;
  }

  static async create(data: any) {
    console.warn('SubscriptionPackage.create is a compatibility method, not implemented fully');
    return new SubscriptionPackage(data);
  }

  static async updateOne(query: any, update: any) {
    console.warn('SubscriptionPackage.updateOne is a compatibility method, not implemented fully');
    return { modifiedCount: 0 };
  }
}
