
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building, MapPin, Phone, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveBusiness } from "@/lib/mongodb-utils";
import { generateUniqueId } from "@/lib/csv-utils";

const formSchema = z.object({
  name: z.string().min(2, { message: "Business name must be at least 2 characters" }),
  category: z.string().min(2, { message: "Category must be at least 2 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
});

type FormValues = z.infer<typeof formSchema>;

interface GetListedFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const GetListedForm = ({ isOpen, setIsOpen }: GetListedFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      address: "",
      phone: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Generate a unique ID for the business
      const businessId = await generateUniqueId();
      
      // Create the business object
      const newBusiness = {
        id: businessId,
        name: data.name,
        category: data.category,
        address: data.address,
        phone: data.phone,
        email: "",
        website: "",
        description: `${data.name} is a business in the ${data.category} category.`,
        rating: 0,
        reviews: 0,
        latitude: 0,
        longitude: 0,
        hours: {},
        tags: [data.category.toLowerCase()],
        featured: false,
        image: "/placeholder.svg",
      };
      
      // Save to MongoDB instead of Firebase
      await saveBusiness(newBusiness);
      
      toast({
        title: "Business Listed Successfully",
        description: "Your business has been added to our directory!",
      });
      
      // Reset form and close dialog
      form.reset();
      setIsOpen(false);
      
    } catch (error) {
      console.error("Error adding business:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error adding your business. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Get Listed Now</DialogTitle>
          <DialogDescription>
            Add your business to our directory and reach more customers.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Enter business name" {...field} />
                      <Building className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Restaurant, Retail, Services" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Enter full address" {...field} />
                      <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Enter phone number" {...field} />
                      <Phone className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Listing"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GetListedForm;
