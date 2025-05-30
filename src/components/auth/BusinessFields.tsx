
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BusinessFieldsProps {
  formData: any;
  onChange: (field: string, value: string) => void;
}

const BusinessFields: React.FC<BusinessFieldsProps> = ({ formData, onChange }) => {
  const businessCategories = [
    'Restaurant', 'Retail', 'Technology', 'Healthcare', 'Education',
    'Real Estate', 'Automotive', 'Beauty & Wellness', 'Sports & Fitness',
    'Entertainment', 'Travel & Tourism', 'Financial Services', 'Other'
  ];

  return (
    <div className="space-y-4">
      <div className="text-center py-2">
        <h4 className="font-medium text-blue-600">Business Information</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            placeholder="Your business name"
            value={formData.businessName || ''}
            onChange={(e) => onChange('businessName', e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="ownerName">Owner Name</Label>
          <Input
            id="ownerName"
            placeholder="Business owner name"
            value={formData.ownerName || ''}
            onChange={(e) => onChange('ownerName', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Business Category *</Label>
          <Select value={formData.businessCategory || ''} onValueChange={(value) => onChange('businessCategory', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {businessCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://www.example.com"
            value={formData.website || ''}
            onChange={(e) => onChange('website', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="gstNumber">GST Number</Label>
        <Input
          id="gstNumber"
          placeholder="GST registration number"
          value={formData.gstNumber || ''}
          onChange={(e) => onChange('gstNumber', e.target.value)}
        />
      </div>
    </div>
  );
};

export default BusinessFields;
