
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Business } from '@/lib/csv-utils';
import { X } from 'lucide-react';

// Schema for business validation
const businessSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters."),
  category: z.string().min(2, "Category must be at least 2 characters."),
  address: z.string().min(5, "Please enter a valid address."),
  phone: z.string().min(7, "Please enter a valid phone number."),
  rating: z.coerce.number().min(0).max(5).default(0),
  image: z.string().url("Please enter a valid image URL.").optional(),
  description: z.string().min(10, "Description must be at least 10 characters."),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  priority: z.coerce.number().optional().or(z.literal('')),
  // reviews will be auto-generated
});

export type BusinessFormValues = z.infer<typeof businessSchema>;

interface BusinessFormProps {
  initialValues?: Partial<Business>;
  onSubmit: (values: BusinessFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  hideButtons?: boolean; // New prop to hide form buttons
}

const BusinessForm: React.FC<BusinessFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  hideButtons = false, // Default to showing buttons
}) => {
  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: initialValues?.name || "",
      category: initialValues?.category || "",
      address: initialValues?.address || "",
      phone: initialValues?.phone || "",
      rating: initialValues?.rating || 0,
      image: initialValues?.image || "",
      description: initialValues?.description || "",
      featured: initialValues?.featured || false,
      tags: initialValues?.tags || [],
      priority: initialValues?.priority ?? "",
    },
  });

  // State for tags input
  const [tagInput, setTagInput] = React.useState("");

  // Add tag to form
  const addTag = () => {
    if (tagInput.trim() !== "") {
      const currentTags = form.getValues("tags");
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue("tags", [...currentTags, tagInput.trim()]);
        setTagInput("");
      }
    }
  };

  // Remove tag from form
  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  // Handle Enter key in tag input
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Form {...form}>
      <form id="business-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter business name" {...field} />
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
                <FormLabel>Category*</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., Restaurant, Hotel, Retail" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Address*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full address" {...field} />
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
                <FormLabel>Phone Number*</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., (123) 456-7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating (0-5)*</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    max="5" 
                    step="0.1" 
                    placeholder="Rating from 0 to 5" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* New Priority Field */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    placeholder="Lower numbers appear first (optional)" 
                    {...field}
                    value={field.value === undefined ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? "" : Number(value));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Lower numbers will appear at the top of listings
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter URL to business image" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  If left empty, a default image will be used
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Description*</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter a description of the business" 
                    className="min-h-[100px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-full">
            <FormLabel>Tags</FormLabel>
            <div className="flex space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tags and press Enter"
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={addTag}
                variant="outline"
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {form.watch("tags").map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center bg-primary/10 text-primary text-sm rounded-full px-3 py-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-primary hover:text-primary/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Featured Business</FormLabel>
                  <FormDescription>
                    Featured businesses appear prominently on the homepage
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Only render the buttons if hideButtons is false */}
        {!hideButtons && (
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : initialValues?.id ? "Update Business" : "Add Business"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default BusinessForm;
