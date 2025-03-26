
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Business } from '@/types/business';

export interface BusinessFormValues {
  name?: string;
  category?: string;
  address?: string;
  phone?: string;
  rating?: number;
  description?: string;
  featured?: boolean;
  tags?: string | string[];
  image?: string;
}

export interface BusinessFormProps {
  initialData?: Business | null;
  onSubmit: (values: BusinessFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const BusinessForm: React.FC<BusinessFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting
}) => {
  const [formValues, setFormValues] = useState<BusinessFormValues>({
    name: '',
    category: '',
    address: '',
    phone: '',
    rating: 0,
    description: '',
    featured: false,
    tags: '',
    image: ''
  });

  // Initialize form with data if editing
  useEffect(() => {
    if (initialData) {
      const tagsString = Array.isArray(initialData.tags) 
        ? initialData.tags.join(', ') 
        : (typeof initialData.tags === 'string' ? initialData.tags : '');
      
      setFormValues({
        name: initialData.name || '',
        category: initialData.category || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        rating: initialData.rating || 0,
        description: initialData.description || '',
        featured: initialData.featured || false,
        tags: tagsString,
        image: initialData.image || ''
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseFloat(value) : value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormValues((prev) => ({
      ...prev,
      featured: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Business Name*</Label>
          <Input
            id="name"
            name="name"
            value={formValues.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category*</Label>
          <Input
            id="category"
            name="category"
            value={formValues.category}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formValues.address}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formValues.phone}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Rating (0-5)</Label>
          <Input
            id="rating"
            name="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formValues.rating}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formValues.description}
            onChange={handleInputChange}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            name="tags"
            value={formValues.tags}
            onChange={handleInputChange}
            placeholder="restaurant, food, italian"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            name="image"
            value={formValues.image}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="featured"
            checked={formValues.featured}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="featured">Featured Business</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (initialData ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
};

export default BusinessForm;
