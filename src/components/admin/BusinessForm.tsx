
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Business } from "@/lib/csv-utils";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

// Form schema with validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Business name must be at least 2 characters" }),
  category: z.string().min(1, { message: "Category is required" }),
  image: z.string().url({ message: "Must be a valid URL" }).optional(),
  rating: z.coerce.number().min(0).max(5),
  reviews: z.coerce.number().min(0),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  phone: z.string().min(7, { message: "Phone number must be at least 7 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  featured: z.boolean().default(false),
  tags: z.string(), // This will be used just for form validation, but we'll manage tags separately
  priority: z.coerce.number().min(0).max(100).optional(),
  website: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
  email: z.string().email({ message: "Must be a valid email" }).optional().or(z.literal("")),
});

export type BusinessFormValues = z.infer<typeof formSchema> & { tags: string[] };

interface BusinessFormProps {
  onSubmit: (values: BusinessFormValues) => void;
  currentBusiness?: Business | null;
  isSubmitting?: boolean;
  hideButtons?: boolean;
  onCancel?: () => void;
}

const BusinessForm = ({ 
  onSubmit, 
  currentBusiness, 
  isSubmitting = false,
  hideButtons = false,
  onCancel
}: BusinessFormProps) => {
  const [tagInput, setTagInput] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  
  // Initialize the form with default values or current business data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      image: "",
      rating: 0,
      reviews: 0,
      address: "",
      phone: "",
      description: "",
      featured: false,
      tags: "",
      priority: 0,
      website: "",
      email: "",
    }
  });

  // Update form values when currentBusiness changes
  useEffect(() => {
    if (currentBusiness) {
      form.reset({
        name: currentBusiness.name,
        category: currentBusiness.category,
        image: currentBusiness.image,
        rating: currentBusiness.rating,
        reviews: currentBusiness.reviews,
        address: currentBusiness.address,
        phone: currentBusiness.phone,
        description: currentBusiness.description,
        featured: currentBusiness.featured,
        tags: currentBusiness.tags.join(", "),
        priority: currentBusiness.priority || 0,
        website: currentBusiness.website || "",
        email: currentBusiness.email || "",
      });
      
      setFormTags(currentBusiness.tags);
    } else {
      form.reset({
        name: "",
        category: "",
        image: "",
        rating: 0,
        reviews: 0,
        address: "",
        phone: "",
        description: "",
        featured: false,
        tags: "",
        priority: 0,
        website: "",
        email: "",
      });
      
      setFormTags([]);
    }
  }, [currentBusiness, form]);

  // Function to handle tag input and update the tags array
  const handleTagUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  // Function to add a tag to the formTags array
  const handleTagAdd = () => {
    if (tagInput.trim() !== "") {
      setFormTags([...formTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Function to remove a tag from the formTags array
  const handleTagRemove = (tagToRemove: string) => {
    setFormTags(formTags.filter((tag) => tag !== tagToRemove));
  };

  // Handle form submission
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Combine form values with the tags array
    const submitValues = {
      ...values,
      tags: formTags,
    };
    
    onSubmit(submitValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" id="business-form">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="Business name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Business category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority (0-100, lower shows first)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Priority" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="Image URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Information</h3>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Business address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Website URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="Email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Detailed Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Detailed Information</h3>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Business description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (0-5)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Rating" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reviews"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Reviews</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Reviews" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Tags and Featured */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Tags and Featured</h3>
          <div>
            <FormLabel>Tags</FormLabel>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Add a tag"
                value={tagInput}
                onChange={handleTagUpdate}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleTagAdd();
                  }
                }}
              />
              <Button type="button" size="sm" onClick={handleTagAdd}>
                Add Tag
              </Button>
            </div>
            <div className="mt-2">
              {formTags.map((tag) => (
                <Button
                  key={tag}
                  variant="secondary"
                  size="sm"
                  className="mr-2 mb-2"
                  onClick={() => handleTagRemove(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Featured</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Mark this business as featured
                  </p>
                </div>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {!hideButtons && (
            <div className="flex justify-end gap-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Business"
                )}
              </Button>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};

export default BusinessForm;
