
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SubscriptionPackage } from "@/data/subscriptionData";
import { nanoid } from "nanoid";
import { featuresToString, stringToFeatures } from "@/lib/subscription-utils";

const formSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  monthlyPrice: z.coerce.number().min(0, "Monthly price must be a positive number"),
  setupFee: z.coerce.number().min(0, "Setup fee must be a positive number"),
  durationMonths: z.coerce.number().min(1, "Duration must be at least 1 month"),
  shortDescription: z.string().min(1, "Short description is required"),
  fullDescription: z.string().min(1, "Full description is required"),
  termsAndConditions: z.string().optional(),
  featuresString: z.string(),
  popular: z.boolean().default(false),
  type: z.enum(["Business", "Influencer"]),
  billingCycle: z.enum(["monthly", "yearly"]).default("yearly"),
  advancePaymentMonths: z.coerce.number().min(0).default(0),
  paymentType: z.enum(["recurring", "one-time"]).default("recurring")
});

type SubscriptionPackageFormProps = {
  initialData?: SubscriptionPackage;
  onSubmit: (data: SubscriptionPackage) => void;
  onCancel: () => void;
};

type FormValues = z.infer<typeof formSchema>;

const SubscriptionPackageForm: React.FC<SubscriptionPackageFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialData?.id || nanoid(),
      title: initialData?.title || "",
      price: initialData?.price || 0,
      monthlyPrice: initialData?.monthlyPrice || (initialData ? Math.round(initialData.price / 12) : 0),
      setupFee: initialData?.setupFee || 0,
      durationMonths: initialData?.durationMonths || 12,
      shortDescription: initialData?.shortDescription || "",
      fullDescription: initialData?.fullDescription || "",
      termsAndConditions: initialData?.termsAndConditions || "",
      featuresString: featuresToString(initialData?.features),
      popular: initialData?.popular || false,
      type: initialData?.type || "Business",
      billingCycle: initialData?.billingCycle || "yearly",
      advancePaymentMonths: initialData?.advancePaymentMonths || 0,
      paymentType: initialData?.paymentType || "recurring"
    }
  });

  const billingCycle = form.watch("billingCycle");
  const paymentType = form.watch("paymentType");

  useEffect(() => {
    // Only setup the price/monthly price synchronization for recurring subscriptions
    if (paymentType === "recurring") {
      const subscription = form.watch((value, { name }) => {
        if (name === "price" && value.price) {
          const monthlyPrice = Math.round(Number(value.price) / 12);
          form.setValue("monthlyPrice", monthlyPrice);
        } else if (name === "monthlyPrice" && value.monthlyPrice) {
          const yearlyPrice = Number(value.monthlyPrice) * 12;
          form.setValue("price", yearlyPrice);
        }
      });
      
      return () => subscription.unsubscribe();
    }
  }, [form, paymentType]);

  const handleSubmit = (values: FormValues) => {
    const featureArray = stringToFeatures(values.featuresString);
    
    const price = Number(values.price);
    const monthlyPrice = Number(values.monthlyPrice);
    const setupFee = Number(values.setupFee);
    
    const packageData: SubscriptionPackage = {
      id: values.id,
      title: values.title,
      price: price,
      monthlyPrice: monthlyPrice,
      setupFee: setupFee,
      durationMonths: Number(values.durationMonths),
      shortDescription: values.shortDescription,
      fullDescription: values.fullDescription,
      features: featureArray,
      popular: values.popular,
      type: values.type,
      termsAndConditions: values.termsAndConditions || "",
      billingCycle: values.billingCycle,
      advancePaymentMonths: Number(values.advancePaymentMonths),
      paymentType: values.paymentType
    };
    
    console.log("Form submitted with data:", packageData);
    onSubmit(packageData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Basic Plan" {...field} />
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
                <FormLabel>Package Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
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
            name="paymentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Type</FormLabel>
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
                    <SelectItem value="recurring">Recurring Subscription</SelectItem>
                    <SelectItem value="one-time">One-time Payment</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose whether this is a subscription with recurring payments or a one-time purchase
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {paymentType === "recurring" && (
            <FormField
              control={form.control}
              name="billingCycle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Cycle</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={paymentType !== "recurring"}
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

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{paymentType === "one-time" ? "Price (₹)" : (billingCycle === "monthly" ? "Monthly Price (₹)" : "Annual Price (₹)")}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="1" 
                    {...field} 
                    onChange={(e) => {
                      // For one-time payments, just update the price without recalculation
                      field.onChange(e);
                      
                      // Only perform automatic calculation for recurring subscriptions
                      if (paymentType === "recurring") {
                        if (billingCycle === "monthly") {
                          const yearlyPrice = Number(e.target.value) * 12;
                          form.setValue("price", yearlyPrice);
                        } else if (billingCycle === "yearly") {
                          const monthlyPrice = Math.round(Number(e.target.value) / 12);
                          form.setValue("monthlyPrice", monthlyPrice);
                        }
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {paymentType === "recurring" && billingCycle === "monthly" && (
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Price (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="1" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The annual price is calculated automatically (monthly × 12)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {paymentType === "recurring" && billingCycle === "yearly" && (
            <FormField
              control={form.control}
              name="monthlyPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Price (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="1" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The monthly price is calculated automatically (yearly ÷ 12)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {paymentType === "recurring" && (
            <FormField
              control={form.control}
              name="setupFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setup Fee (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="1" {...field} />
                  </FormControl>
                  <FormDescription>
                    One-time fee charged at subscription start
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Only show duration field for recurring subscriptions */}
          {paymentType === "recurring" && (
            <FormField
              control={form.control}
              name="durationMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (months)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" step="1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Duration of the subscription
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {paymentType === "recurring" && (
            <FormField
              control={form.control}
              name="advancePaymentMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Advance Payment (months)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Number of months to be paid in advance (0 for no advance payment)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="popular"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Mark as Popular</FormLabel>
                  <FormDescription>
                    Highlight this package in the subscription page
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

        <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Input placeholder="Brief description of the package" {...field} />
              </FormControl>
              <FormDescription>
                This will appear in the package card in the subscription page
              </FormDescription>
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
                  placeholder="Detailed description of the package"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="featuresString"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Features (one per line)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List the features of this package (one per line)"
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter each feature on a new line. These will be displayed as bullet points.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="termsAndConditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terms & Conditions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Package terms and conditions"
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Terms and conditions for this subscription package
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update Package" : "Create Package"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SubscriptionPackageForm;
