
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
    return features && Array.isArray(features) ? features.join('\n') : '';
  };
  
  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      id: initialPackage.id || '',
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

  // Enhanced calculation functions for subscription-based packages
  const calculateInitialPayment = () => {
    const setup = setupFee || 0;
    
    if (paymentType === 'one-time') {
      return price + setup;
    } else {
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

  const calculateTotalFirstYear = () => {
    if (paymentType === 'one-time') {
      return price + setupFee;
    } else {
      const setup = setupFee || 0;
      if (billingCycle === 'monthly') {
        return setup + (monthlyPrice * 12);
      } else {
        return setup + price;
      }
    }
  };
  
  const initialPayment = calculateInitialPayment();
  const recurringAmount = calculateRecurringAmount();
  const totalFirstYear = calculateTotalFirstYear();
  
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
                  <FormDescription>
                    {paymentType === 'one-time' 
                      ? 'Customer pays once and gets lifetime access' 
                      : 'Customer pays regularly (monthly/yearly) for continued access'}
                  </FormDescription>
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
                    <FormDescription>
                      {billingCycle === 'monthly' 
                        ? 'Customer pays monthly for continued access' 
                        : 'Customer pays yearly (usually with discount)'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Pricing Summary Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Pricing Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Initial Payment:</span>
                    <div className="text-lg font-bold text-green-600">
                      ₹{formatCurrency(initialPayment)}
                    </div>
                  </div>
                  {paymentType === 'recurring' && (
                    <div>
                      <span className="font-medium">Recurring Amount:</span>
                      <div className="text-lg font-bold text-blue-600">
                        ₹{formatCurrency(recurringAmount)}/{billingCycle === 'monthly' ? 'month' : 'year'}
                      </div>
                    </div>
                  )}
                </div>
                
                {paymentType === 'recurring' && (
                  <div className="border-t pt-3">
                    <span className="font-medium">First Year Total:</span>
                    <div className="text-lg font-bold text-purple-600">
                      ₹{formatCurrency(totalFirstYear)}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {billingCycle === 'monthly' 
                        ? `Setup fee + 12 monthly payments` 
                        : `Setup fee + yearly payment`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {paymentType === 'one-time' ? 'Package Price*' : billingCycle === 'monthly' ? 'Monthly Price*' : 'Yearly Price*'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="0"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    {paymentType === 'one-time' 
                      ? 'Total amount for one-time purchase' 
                      : billingCycle === 'monthly' 
                        ? 'Amount charged monthly' 
                        : 'Amount charged yearly'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {paymentType === 'recurring' && billingCycle === 'yearly' && (
              <FormField
                control={form.control}
                name="monthlyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Price (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Monthly equivalent price (for display purposes)
                    </FormDescription>
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
                  <FormLabel>Setup Fee</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="0"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    One-time setup fee (charged with initial payment)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {paymentType === 'recurring' && (
              <FormField
                control={form.control}
                name="advancePaymentMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advance Payment Months</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of months to charge upfront (0 = no advance payment)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="durationMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (Months)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="12"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    {paymentType === 'one-time' 
                      ? 'Access duration in months' 
                      : 'Contract duration in months (0 = indefinite)'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
