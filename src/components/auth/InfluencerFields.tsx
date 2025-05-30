
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InfluencerFieldsProps {
  formData: any;
  onChange: (field: string, value: string) => void;
}

const InfluencerFields: React.FC<InfluencerFieldsProps> = ({ formData, onChange }) => {
  const niches = [
    'Fashion & Style', 'Food & Cooking', 'Travel', 'Technology', 'Fitness & Health',
    'Beauty & Makeup', 'Lifestyle', 'Gaming', 'Education', 'Business & Finance',
    'Entertainment', 'Art & Design', 'Photography', 'Music', 'Sports', 'Other'
  ];

  const followerRanges = [
    '1K - 10K', '10K - 50K', '50K - 100K', '100K - 500K', '500K - 1M', '1M+'
  ];

  return (
    <div className="space-y-4">
      <div className="text-center py-2">
        <h4 className="font-medium text-purple-600">Influencer Information</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Niche/Category *</Label>
          <Select value={formData.niche || ''} onValueChange={(value) => onChange('niche', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your niche" />
            </SelectTrigger>
            <SelectContent>
              {niches.map((niche) => (
                <SelectItem key={niche} value={niche}>
                  {niche}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Followers Count</Label>
          <Select value={formData.followersCount || ''} onValueChange={(value) => onChange('followersCount', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select follower range" />
            </SelectTrigger>
            <SelectContent>
              {followerRanges.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="instagramHandle">Instagram Handle</Label>
          <Input
            id="instagramHandle"
            placeholder="@yourusername"
            value={formData.instagramHandle || ''}
            onChange={(e) => onChange('instagramHandle', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="facebookHandle">Facebook Handle</Label>
          <Input
            id="facebookHandle"
            placeholder="Your Facebook profile"
            value={formData.facebookHandle || ''}
            onChange={(e) => onChange('facebookHandle', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Bio *</Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself and your content..."
          value={formData.bio || ''}
          onChange={(e) => onChange('bio', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
};

export default InfluencerFields;
