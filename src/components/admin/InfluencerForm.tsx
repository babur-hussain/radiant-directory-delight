
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
    <div className="p-6 space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="w-full"
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full"
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full"
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="niche" className="text-sm font-medium text-gray-700">Niche</Label>
              <Input
                id="niche"
                value={formData.niche}
                onChange={(e) => handleInputChange('niche', e.target.value)}
                placeholder="e.g., Fashion, Tech, Food"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full"
                placeholder="City, State/Country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium text-gray-700">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
              className="w-full resize-none"
              placeholder="Brief description about the influencer"
            />
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Metrics & Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="followers_count" className="text-sm font-medium text-gray-700">Followers Count</Label>
              <Input
                id="followers_count"
                type="number"
                min="0"
                value={formData.followers_count}
                onChange={(e) => handleInputChange('followers_count', parseInt(e.target.value) || 0)}
                className="w-full"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="engagement_rate" className="text-sm font-medium text-gray-700">Engagement Rate (%)</Label>
              <Input
                id="engagement_rate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.engagement_rate}
                onChange={(e) => handleInputChange('engagement_rate', parseFloat(e.target.value) || 0)}
                className="w-full"
                placeholder="0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating" className="text-sm font-medium text-gray-700">Rating (0-5)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                className="w-full"
                placeholder="0.0"
              />
            </div>
          </div>
        </div>

        {/* Social Media Handles */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Social Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram_handle" className="text-sm font-medium text-gray-700">Instagram Handle</Label>
              <Input
                id="instagram_handle"
                value={formData.instagram_handle}
                onChange={(e) => handleInputChange('instagram_handle', e.target.value)}
                placeholder="username (without @)"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube_handle" className="text-sm font-medium text-gray-700">YouTube Handle</Label>
              <Input
                id="youtube_handle"
                value={formData.youtube_handle}
                onChange={(e) => handleInputChange('youtube_handle', e.target.value)}
                placeholder="channel name"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktok_handle" className="text-sm font-medium text-gray-700">TikTok Handle</Label>
              <Input
                id="tiktok_handle"
                value={formData.tiktok_handle}
                onChange={(e) => handleInputChange('tiktok_handle', e.target.value)}
                placeholder="username (without @)"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter_handle" className="text-sm font-medium text-gray-700">Twitter Handle</Label>
              <Input
                id="twitter_handle"
                value={formData.twitter_handle}
                onChange={(e) => handleInputChange('twitter_handle', e.target.value)}
                placeholder="username (without @)"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook_handle" className="text-sm font-medium text-gray-700">Facebook Handle</Label>
              <Input
                id="facebook_handle"
                value={formData.facebook_handle}
                onChange={(e) => handleInputChange('facebook_handle', e.target.value)}
                placeholder="page or profile name"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_handle" className="text-sm font-medium text-gray-700">LinkedIn Handle</Label>
              <Input
                id="linkedin_handle"
                value={formData.linkedin_handle}
                onChange={(e) => handleInputChange('linkedin_handle', e.target.value)}
                placeholder="profile name"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile_image" className="text-sm font-medium text-gray-700">Profile Image URL</Label>
              <Input
                id="profile_image"
                type="url"
                value={formData.profile_image}
                onChange={(e) => handleInputChange('profile_image', e.target.value)}
                className="w-full"
                placeholder="https://example.com/profile.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover_image" className="text-sm font-medium text-gray-700">Cover Image URL</Label>
              <Input
                id="cover_image"
                type="url"
                value={formData.cover_image}
                onChange={(e) => handleInputChange('cover_image', e.target.value)}
                className="w-full"
                placeholder="https://example.com/cover.jpg"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-sm font-medium text-gray-700">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="fashion, lifestyle, beauty, tech"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="previous_brands" className="text-sm font-medium text-gray-700">Previous Brands (comma separated)</Label>
              <Input
                id="previous_brands"
                value={formData.previous_brands}
                onChange={(e) => handleInputChange('previous_brands', e.target.value)}
                placeholder="Nike, Adidas, Zara, Apple"
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium text-gray-700">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min="0"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 0)}
                  className="w-full"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center space-x-3 pt-6">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                />
                <Label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured Influencer</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-6 border-t bg-gray-50 -mx-6 px-6 py-4">
          <Button type="submit" disabled={isSubmitting} className="px-8">
            {isSubmitting ? "Saving..." : influencer ? "Update Influencer" : "Add Influencer"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InfluencerForm;
