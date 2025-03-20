
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
  type?: string;
  termsAndConditions?: string;
  paymentType?: string;
  billingCycle?: string;
  advancePaymentMonths?: number;
  dashboardSections?: string[];
  createdAt?: string;
  updatedAt?: string;
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
  type: string;
  termsAndConditions?: string;
  paymentType: string;
  billingCycle?: string;
  advancePaymentMonths: number;
  dashboardSections?: string[];
  createdAt?: string;
  updatedAt?: string;

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
  }
}
