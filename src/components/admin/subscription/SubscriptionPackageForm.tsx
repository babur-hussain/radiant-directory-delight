
import React from "react";
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

// Form schema validation
const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  setupFee: z.coerce.number().min(0, "Setup fee must be a positive number"),
  durationMonths: z.coerce.number().min(1, "Duration must be at least 1 month"),
  shortDescription: z.string().min(1, "Short description is required"),
  fullDescription: z.string().min(1, "Full description is required"),
  termsAndConditions: z.string().optional(),
  features: z.string().transform(val => val.split('\n').filter(f => f.trim().length > 0)),
  popular: z.boolean().default(false),
  type: z.enum(["Business", "Influencer"])
});

type SubscriptionPackageFormProps = {
  initialData?: SubscriptionPackage;
  onSubmit: (data: SubscriptionPackage) => void;
  onCancel: () => void;
};

const SubscriptionPackageForm: React.FC<SubscriptionPackageFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      id: nanoid(),
      title: "",
      price: 0,
      setupFee: 0,
      durationMonths: 12,
      shortDescription: "",
      fullDescription: "",
      termsAndConditions: "",
      features: [],
      popular: false,
      type: "Business"
    }
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const packageData: SubscriptionPackage = {
      ...values,
      id: values.id || nanoid()
    };
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
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annual Price (₹)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="setupFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Setup Fee (₹)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="durationMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (months)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" step="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Features (one per line)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List the features of this package (one per line)"
                  className="min-h-[150px]"
                  value={Array.isArray(field.value) ? field.value.join('\n') : field.value}
                  onChange={(e) => field.onChange(e.target.value)}
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
