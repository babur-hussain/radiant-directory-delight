import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PaymentType, BillingCycle } from '@/models/Subscription';
import { Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const packageSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  price: z.number().positive({ message: "Price must be a positive number" }),
  monthlyPrice: z.number().optional(),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  features: z.string().or(z.array(z.string())).optional(),
  setupFee: z.number().optional(),
  durationMonths: z.number().optional(),
  advancePaymentMonths: z.number().optional(),
  termsAndConditions: z.string().optional(),
  type: z.enum(["Business", "Influencer"]),
  paymentType: z.enum(["recurring", "one-time"]),
  billingCycle: z.enum(["monthly", "yearly"]).optional(),
  maxBusinesses: z.number().optional(),
  maxInfluencers: z.number().optional(),
  popular: z.boolean().default(false).optional()
});

type PackageFormData = z.infer<typeof packageSchema>;

interface SubscriptionPackageFormProps {
  package: ISubscriptionPackage;
  onSave: (pkg: ISubscriptionPackage) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

const SubscriptionPackageForm: React.FC<SubscriptionPackageFormProps> = ({
  package: initialPackage,
  onSave,
  onCancel,
  isSaving = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuresArray, setFeaturesArray] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  
  const featuresToString = (features: string[] | undefined) => {
    return features ? features.join('\n') : '';
  };
  
  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      id: initialPackage.id || uuidv4().substring(0, 8),
      title: initialPackage.title || '',
      price: initialPackage.price || 0,
      monthlyPrice: initialPackage.monthlyPrice || 0,
      shortDescription: initialPackage.shortDescription || '',
      fullDescription: initialPackage.fullDescription || '',
      features: featuresToString(initialPackage.features),
      setupFee: initialPackage.setupFee || 0,
      durationMonths: initialPackage.durationMonths || 12,
      advancePaymentMonths: initialPackage.advancePaymentMonths || 0,
      termsAndConditions: initialPackage.termsAndConditions || '',
      type: initialPackage.type || 'Business',
      paymentType: initialPackage.paymentType || 'recurring',
      billingCycle: initialPackage.billingCycle || 'yearly',
      maxBusinesses: initialPackage.maxBusinesses || 1,
      maxInfluencers: initialPackage.maxInfluencers || 1,
      popular: initialPackage.popular || false
    }
  });
  
  const paymentType = form.watch('paymentType');
  const price = form.watch('price') || 0;
  const monthlyPrice = form.watch('monthlyPrice') || 0;
  const setupFee = form.watch('setupFee') || 0;
  const durationMonths = form.watch('durationMonths') || 12;
  const advancePaymentMonths = form.watch('advancePaymentMonths') || 0;
  const billingCycle = form.watch('billingCycle');
  
  useEffect(() => {
    if (initialPackage.features && Array.isArray(initialPackage.features)) {
      setFeaturesArray(initialPackage.features);
    }
  }, [initialPackage.features]);
  
  const calculateInitialPayment = () => {
    if (paymentType === 'one-time') {
      return price;
    } else {
      const setup = setupFee || 0;
      const advance = advancePaymentMonths || 0;
      
      if (billingCycle === 'monthly') {
        return setup + (monthlyPrice * advance);
      } else {
        return setup + (advance > 0 ? price : 0);
      }
    }
  };
  
  const calculateRecurringAmount = () => {
    if (paymentType === 'one-time') {
      return 0;
    } else {
      return billingCycle === 'monthly' ? monthlyPrice : price;
    }
  };
  
  const initialPayment = calculateInitialPayment();
  const recurringAmount = calculateRecurringAmount();
  
  const onSubmit = async (data: PackageFormData) => {
    setIsSubmitting(true);
    
    try {
      let featuresData: string[] = [];
      
      if (typeof data.features === 'string' && data.features.trim()) {
        featuresData = data.features.split('\n').filter(f => f.trim().length > 0);
      } else if (featuresArray.length > 0) {
        featuresData = featuresArray;
      } else if (Array.isArray(data.features)) {
        featuresData = data.features;
      }
      
      const packageId = data.id || uuidv4().substring(0, 8);
      
      if (!data.title) {
        throw new Error("Package title is required");
      }
      
      const packageData: ISubscriptionPackage = {
        id: packageId,
        title: data.title,
        price: data.price,
        monthlyPrice: data.monthlyPrice || 0,
        features: featuresData,
        paymentType: data.paymentType,
        type: data.type,
        shortDescription: data.shortDescription || `${data.title} subscription package`,
        fullDescription: data.fullDescription || '',
        setupFee: data.setupFee || 0,
        durationMonths: data.durationMonths || 12,
        advancePaymentMonths: data.advancePaymentMonths || 0,
        billingCycle: data.billingCycle,
        termsAndConditions: data.termsAndConditions || '',
        maxBusinesses: data.maxBusinesses || 1,
        maxInfluencers: data.maxInfluencers || 1,
        popular: data.popular || false,
        dashboardSections: initialPackage.dashboardSections || [],
      };
      
      console.log('Submitting package data:', packageData);
      await onSave(packageData);
    } catch (error) {
      console.error('Error saving package:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Title*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter package title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Type*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select package type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Influencer">Influencer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Brief description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fullDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Detailed description of the package"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="popular"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Mark as Popular</FormLabel>
                    <FormDescription className="text-xs">
                      Highlight this package as a popular choice
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Payment Structure</h3>
            
            <FormField
              control={form.control}
              name="paymentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="one-time">One-time Payment</SelectItem>
                      <SelectItem value="recurring">Recurring Subscription</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {paymentType === 'recurring' && (
              <FormField
                control={form.control}
                name="billingCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Cycle</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select billing cycle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {paymentType === 'one-time' ? (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="Package price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {billingCycle === 'monthly' ? 'Yearly Price (₹)*' : 'Yearly Price (₹)*'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="Yearly price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {billingCycle === 'monthly' && (
                  <FormField
                    control={form.control}
                    name="monthlyPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Price (₹)*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            placeholder="Monthly price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="setupFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Setup Fee (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="One-time setup fee"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="advancePaymentMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advance Payment (months)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="Number of months to collect in advance"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <FormField
              control={form.control}
              name="durationMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (months)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="Package duration in months"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                {paymentType === 'one-time' ? (
                  <div className="flex justify-between items-center">
                    <span>One-time payment:</span>
                    <span className="font-semibold">{formatCurrency(price)}</span>
                  </div>
                ) : (
                  <>
                    {setupFee > 0 && (
                      <div className="flex justify-between items-center">
                        <span>Setup fee:</span>
                        <span>{formatCurrency(setupFee)}</span>
                      </div>
                    )}
                    
                    {advancePaymentMonths > 0 && (
                      <div className="flex justify-between items-center">
                        <span>Advance payment ({advancePaymentMonths} {billingCycle === 'monthly' ? 'months' : 'years'}):</span>
                        <span>{formatCurrency(billingCycle === 'monthly' ? monthlyPrice * advancePaymentMonths : price)}</span>
                      </div>
                    )}
                    
                    <Separator className="my-1.5" />
                    
                    <div className="flex justify-between items-center font-semibold">
                      <span>Initial payment:</span>
                      <span>{formatCurrency(initialPayment)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span>Recurring:</span>
                      <span>{formatCurrency(recurringAmount)}/{billingCycle || 'year'}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Package Features</h3>
          
          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Features (one per line)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter package features, one per line"
                    rows={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Additional Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="maxBusinesses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Businesses</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="Maximum number of businesses"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="maxInfluencers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Influencers</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="Maximum number of influencers"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="termsAndConditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terms and Conditions</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Terms and conditions for this package"
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving || isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || isSubmitting}>
            {(isSaving || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {(isSaving || isSubmitting) ? 'Saving...' : 'Save Package'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const FormDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className={`text-sm text-muted-foreground ${className}`}
      {...props}
    />
  );
};

export default SubscriptionPackageForm;
