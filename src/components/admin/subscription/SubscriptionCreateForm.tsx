
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SubscriptionCreateFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isEditing?: boolean;
}

const SubscriptionCreateForm: React.FC<SubscriptionCreateFormProps> = ({ 
  onSubmit,
  initialData = {},
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    price: initialData.price || 0,
    shortDescription: initialData.shortDescription || '',
    fullDescription: initialData.fullDescription || '',
    type: initialData.type || 'Business',
    paymentType: initialData.paymentType || 'recurring',
    popular: initialData.popular || false,
    features: initialData.features?.join('\n') || '',
    // Add more fields as needed
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process and submit data
    const processedData = {
      ...formData,
      price: Number(formData.price),
      features: formData.features.split('\n').filter(f => f.trim() !== '')
    };
    
    onSubmit(processedData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Package' : 'Create Package'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Package Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Influencer">Influencer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentType">Payment Type</Label>
            <RadioGroup 
              value={formData.paymentType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, paymentType: value }))}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="recurring" id="recurring" />
                <Label htmlFor="recurring">Recurring</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one-time" id="one-time" />
                <Label htmlFor="one-time">One-time</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="popular" 
              checked={formData.popular}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, popular: !!checked }))
              }
            />
            <Label htmlFor="popular">Mark as Popular</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Textarea
              id="shortDescription"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullDescription">Full Description</Label>
            <Textarea
              id="fullDescription"
              name="fullDescription"
              value={formData.fullDescription}
              onChange={handleChange}
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea
              id="features"
              name="features"
              value={formData.features}
              onChange={handleChange}
              rows={6}
              placeholder="Enter features, one per line"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">{isEditing ? 'Update Package' : 'Create Package'}</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SubscriptionCreateForm;
