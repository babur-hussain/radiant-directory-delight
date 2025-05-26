
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Influencer } from "@/lib/csv/influencerTypes";

export interface InfluencerFormValues {
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  niche?: string;
  followers_count?: number;
  engagement_rate?: number;
  location?: string;
  instagram_handle?: string;
  youtube_handle?: string;
  tiktok_handle?: string;
  facebook_handle?: string;
  twitter_handle?: string;
  linkedin_handle?: string;
  website?: string;
  profile_image?: string;
  cover_image?: string;
  rating?: number;
  featured?: boolean;
  priority?: number;
  tags?: string[] | string;
  previous_brands?: string[] | string;
}

interface InfluencerFormProps {
  influencer?: Influencer | null;
  onSubmit: (values: InfluencerFormValues) => void;
  isSubmitting?: boolean;
}

const InfluencerForm: React.FC<InfluencerFormProps> = ({ 
  influencer, 
  onSubmit, 
  isSubmitting = false 
}) => {
  const [formData, setFormData] = useState<InfluencerFormValues>({
    name: "",
    email: "",
    phone: "",
    bio: "",
    niche: "",
    followers_count: 0,
    engagement_rate: 0,
    location: "",
    instagram_handle: "",
    youtube_handle: "",
    tiktok_handle: "",
    facebook_handle: "",
    twitter_handle: "",
    linkedin_handle: "",
    website: "",
    profile_image: "",
    cover_image: "",
    rating: 0,
    featured: false,
    priority: 0,
    tags: "",
    previous_brands: ""
  });

  useEffect(() => {
    if (influencer) {
      setFormData({
        name: influencer.name || "",
        email: influencer.email || "",
        phone: influencer.phone || "",
        bio: influencer.bio || "",
        niche: influencer.niche || "",
        followers_count: influencer.followers_count || 0,
        engagement_rate: Number(influencer.engagement_rate) || 0,
        location: influencer.location || "",
        instagram_handle: influencer.instagram_handle || "",
        youtube_handle: influencer.youtube_handle || "",
        tiktok_handle: influencer.tiktok_handle || "",
        facebook_handle: influencer.facebook_handle || "",
        twitter_handle: influencer.twitter_handle || "",
        linkedin_handle: influencer.linkedin_handle || "",
        website: influencer.website || "",
        profile_image: influencer.profile_image || "",
        cover_image: influencer.cover_image || "",
        rating: Number(influencer.rating) || 0,
        featured: influencer.featured || false,
        priority: influencer.priority || 0,
        tags: Array.isArray(influencer.tags) ? influencer.tags.join(", ") : "",
        previous_brands: Array.isArray(influencer.previous_brands) ? influencer.previous_brands.join(", ") : ""
      });
    }
  }, [influencer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof InfluencerFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="niche">Niche</Label>
          <Input
            id="niche"
            value={formData.niche}
            onChange={(e) => handleInputChange('niche', e.target.value)}
            placeholder="e.g., Fashion, Tech, Food"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="followers_count">Followers Count</Label>
          <Input
            id="followers_count"
            type="number"
            value={formData.followers_count}
            onChange={(e) => handleInputChange('followers_count', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="engagement_rate">Engagement Rate (%)</Label>
          <Input
            id="engagement_rate"
            type="number"
            step="0.1"
            max="100"
            value={formData.engagement_rate}
            onChange={(e) => handleInputChange('engagement_rate', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Rating (0-5)</Label>
          <Input
            id="rating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={formData.rating}
            onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Input
            id="priority"
            type="number"
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram_handle">Instagram Handle</Label>
          <Input
            id="instagram_handle"
            value={formData.instagram_handle}
            onChange={(e) => handleInputChange('instagram_handle', e.target.value)}
            placeholder="username (without @)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtube_handle">YouTube Handle</Label>
          <Input
            id="youtube_handle"
            value={formData.youtube_handle}
            onChange={(e) => handleInputChange('youtube_handle', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="profile_image">Profile Image URL</Label>
          <Input
            id="profile_image"
            type="url"
            value={formData.profile_image}
            onChange={(e) => handleInputChange('profile_image', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cover_image">Cover Image URL</Label>
          <Input
            id="cover_image"
            type="url"
            value={formData.cover_image}
            onChange={(e) => handleInputChange('cover_image', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => handleInputChange('tags', e.target.value)}
          placeholder="fashion, lifestyle, beauty"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="previous_brands">Previous Brands (comma separated)</Label>
        <Input
          id="previous_brands"
          value={formData.previous_brands}
          onChange={(e) => handleInputChange('previous_brands', e.target.value)}
          placeholder="Nike, Adidas, Zara"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="featured"
          checked={formData.featured}
          onCheckedChange={(checked) => handleInputChange('featured', checked)}
        />
        <Label htmlFor="featured">Featured Influencer</Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Saving..." : influencer ? "Update Influencer" : "Add Influencer"}
        </Button>
      </div>
    </form>
  );
};

export default InfluencerForm;
