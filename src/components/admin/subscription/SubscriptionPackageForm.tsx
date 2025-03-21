
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { nanoid } from 'nanoid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tag, Plus, X, Trash, DollarSign } from 'lucide-react';

interface SubscriptionPackageFormProps {
  package: ISubscriptionPackage;
  onSave: (packageData: ISubscriptionPackage) => Promise<void>;
  onCancel: () => void;
}

const SubscriptionPackageForm: React.FC<SubscriptionPackageFormProps> = ({
  package: initialPackage,
  onSave,
  onCancel,
}) => {
  const [packageData, setPackageData] = useState<ISubscriptionPackage>({
    ...initialPackage,
    id: initialPackage.id || `pkg_${nanoid(10)}`,
    features: initialPackage.features || [],
  });
  
  const [feature, setFeature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPackageData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPackageData(prev => ({
      ...prev,
      [name]: value === '' ? 0 : Number(value),
    }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setPackageData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setPackageData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // If changing payment type to one-time, reset recurring fields
    if (name === 'paymentType' && value === 'one-time') {
      setPackageData(prev => ({
        ...prev,
        billingCycle: undefined,
        setupFee: 0,
        advancePaymentMonths: 0,
      }));
    }
  };
  
  const addFeature = () => {
    if (feature.trim()) {
      setPackageData(prev => ({
        ...prev,
        features: [...(prev.features || []), feature.trim()],
      }));
      setFeature('');
    }
  };
  
  const removeFeature = (index: number) => {
    setPackageData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || [],
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(packageData);
    } catch (error) {
      console.error('Error saving package:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate recurring amounts to show in the form
  const isRecurring = packageData.paymentType === 'recurring';
  const setupFee = packageData.setupFee || 0;
  const monthlyPrice = packageData.monthlyPrice || 0;
  const yearlyPrice = packageData.price || 0;
  const advanceMonths = packageData.advancePaymentMonths || 0;
  
  // Calculate initial payment (setup fee + advance payment)
  const initialPayment = isRecurring 
    ? setupFee + (packageData.billingCycle === 'monthly' 
      ? monthlyPrice * advanceMonths 
      : yearlyPrice)
    : yearlyPrice;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Billing</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Package Title</Label>
              <Input
                id="title"
                name="title"
                value={packageData.title || ''}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Package Type</Label>
              <Select 
                value={packageData.type || 'Business'} 
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select package type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Influencer">Influencer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                name="shortDescription"
                value={packageData.shortDescription || ''}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Label htmlFor="fullDescription">Full Description</Label>
              <Textarea
                id="fullDescription"
                name="fullDescription"
                value={packageData.fullDescription || ''}
                onChange={handleChange}
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
              <Textarea
                id="termsAndConditions"
                name="termsAndConditions"
                value={packageData.termsAndConditions || ''}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="popular"
                checked={packageData.popular || false}
                onCheckedChange={(checked) => handleSwitchChange('popular', checked)}
              />
              <Label htmlFor="popular">Mark as Popular</Label>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentType">Payment Type</Label>
                  <Select 
                    value={packageData.paymentType || 'recurring'} 
                    onValueChange={(value) => handleSelectChange('paymentType', value as 'recurring' | 'one-time')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recurring">Recurring Subscription</SelectItem>
                      <SelectItem value="one-time">One-time Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {packageData.paymentType === 'recurring' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="billingCycle">Billing Cycle</Label>
                      <Select 
                        value={packageData.billingCycle || 'monthly'} 
                        onValueChange={(value) => handleSelectChange('billingCycle', value as 'monthly' | 'yearly')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select billing cycle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="setupFee">Initial Signup Fee (₹)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="setupFee"
                          name="setupFee"
                          type="number"
                          value={packageData.setupFee || 0}
                          onChange={handleNumberChange}
                          className="pl-8"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">One-time fee charged at signup</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="advancePaymentMonths">Advance Payment Months</Label>
                      <Input
                        id="advancePaymentMonths"
                        name="advancePaymentMonths"
                        type="number"
                        value={packageData.advancePaymentMonths || 0}
                        onChange={handleNumberChange}
                      />
                      <p className="text-xs text-muted-foreground">
                        Number of months to collect payment in advance
                      </p>
                    </div>
                  </>
                )}
                
                {/* Monthly price shown only for recurring with monthly billing */}
                {packageData.paymentType === 'recurring' && packageData.billingCycle === 'monthly' && (
                  <div className="space-y-2">
                    <Label htmlFor="monthlyPrice">Monthly Price (₹)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="monthlyPrice"
                        name="monthlyPrice"
                        type="number"
                        value={packageData.monthlyPrice || 0}
                        onChange={handleNumberChange}
                        className="pl-8"
                      />
                    </div>
                  </div>
                )}
                
                {/* Price field - used as yearly price for recurring or one-time price */}
                <div className="space-y-2">
                  <Label htmlFor="price">
                    {packageData.paymentType === 'recurring' 
                      ? (packageData.billingCycle === 'monthly' ? 'Annual Price (₹)' : 'Yearly Price (₹)')
                      : 'One-time Price (₹)'}
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={packageData.price || 0}
                      onChange={handleNumberChange}
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="durationMonths">Duration (Months)</Label>
                  <Input
                    id="durationMonths"
                    name="durationMonths"
                    type="number"
                    value={packageData.durationMonths || 12}
                    onChange={handleNumberChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    {packageData.paymentType === 'one-time' 
                      ? 'How many months this package is valid for'
                      : 'Minimum contract duration in months'}
                  </p>
                </div>
              </div>
              
              {/* Payment Summary */}
              {packageData.paymentType === 'recurring' && (
                <div className="mt-6 p-4 border rounded-md bg-muted">
                  <h4 className="text-sm font-medium mb-2">Payment Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Initial signup fee:</span>
                      <span>₹{setupFee}</span>
                    </div>
                    
                    {advanceMonths > 0 && (
                      <div className="flex justify-between">
                        <span>Advance payment ({advanceMonths} {packageData.billingCycle === 'monthly' ? 'months' : 'years'}):</span>
                        <span>₹{packageData.billingCycle === 'monthly' 
                          ? monthlyPrice * advanceMonths 
                          : yearlyPrice}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-medium pt-1 border-t mt-1">
                      <span>Total initial payment:</span>
                      <span>₹{initialPayment}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Recurring payment:</span>
                      <span>₹{packageData.billingCycle === 'monthly' ? monthlyPrice : yearlyPrice}/{packageData.billingCycle}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="features" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Add a feature"
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              />
              <Button type="button" onClick={addFeature} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {packageData.features?.length === 0 ? (
                <p className="text-muted-foreground text-sm">No features added yet.</p>
              ) : (
                <div className="space-y-2">
                  {packageData.features?.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span>{feature}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Package'}
        </Button>
      </div>
    </form>
  );
};

export default SubscriptionPackageForm;
