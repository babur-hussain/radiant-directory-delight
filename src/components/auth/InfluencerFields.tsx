
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
      
      {/* Name - using the name from parent form */}
      <div>
        <Label>Full Name *</Label>
        <Input
          placeholder="Your full name"
          value={formData.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          required
        />
      </div>

      {/* Profile Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="instagramHandle">Instagram Profile Link</Label>
          <Input
            id="instagramHandle"
            placeholder="https://instagram.com/yourusername"
            value={formData.instagramHandle || ''}
            onChange={(e) => onChange('instagramHandle', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="youtubeHandle">YouTube Profile Link</Label>
          <Input
            id="youtubeHandle"
            placeholder="https://youtube.com/@yourusername"
            value={formData.youtubeHandle || ''}
            onChange={(e) => onChange('youtubeHandle', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="facebookHandle">Facebook Profile Link</Label>
          <Input
            id="facebookHandle"
            placeholder="https://facebook.com/yourusername"
            value={formData.facebookHandle || ''}
            onChange={(e) => onChange('facebookHandle', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="tiktokHandle">TikTok Profile Link</Label>
          <Input
            id="tiktokHandle"
            placeholder="https://tiktok.com/@yourusername"
            value={formData.tiktokHandle || ''}
            onChange={(e) => onChange('tiktokHandle', e.target.value)}
          />
        </div>
      </div>

      {/* Followers Count */}
      <div>
        <Label>Followers Count *</Label>
        <Select value={formData.followersCount || ''} onValueChange={(value) => onChange('followersCount', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your follower range" />
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

      {/* Location */}
      <div>
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          placeholder="City, State/Country"
          value={formData.location || formData.city || ''}
          onChange={(e) => onChange('location', e.target.value)}
          required
        />
      </div>

      {/* Category */}
      <div>
        <Label>Category/Niche *</Label>
        <Select value={formData.niche || ''} onValueChange={(value) => onChange('niche', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your niche/category" />
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

      {/* Contact Number */}
      <div>
        <Label htmlFor="contactNumber">Contact Number *</Label>
        <Input
          id="contactNumber"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={formData.phone || ''}
          onChange={(e) => onChange('phone', e.target.value)}
          required
        />
      </div>

      {/* Bio */}
      <div>
        <Label htmlFor="bio">Bio *</Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself and your content..."
          value={formData.bio || ''}
          onChange={(e) => onChange('bio', e.target.value)}
          rows={3}
          required
        />
      </div>
    </div>
  );
};

export default InfluencerFields;
