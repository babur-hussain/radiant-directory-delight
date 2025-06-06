
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Instagram, Linkedin, Facebook } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export interface SocialStats {
  instagram?: { followers: string; engagement: string };
  youtube?: { subscribers: string; views: string };
  tiktok?: { followers: string; likes: string };
  facebook?: { likes: string; reach: string };
  twitter?: { followers: string; engagement: string };
  linkedin?: { followers: string; engagement: string };
  [key: string]: any;
}

export interface InfluencerProps {
  id: string;
  name: string;
  profileImage: string;
  coverImage?: string;
  niche: string[];
  bio: string;
  location?: string;
  socialStats: SocialStats;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  previousBrands?: string[];
  featured?: boolean;
}

const InfluencerProfile: React.FC<InfluencerProps> = ({
  name,
  profileImage,
  coverImage,
  niche,
  bio,
  location,
  socialStats,
  socialLinks,
  previousBrands,
  featured = false,
}) => {
  return (
    <Card className={`overflow-hidden ${featured ? 'border-brand-orange border-2' : ''}`}>
      {/* Cover Image */}
      <div className="h-32 bg-gradient-orange-yellow relative">
        {coverImage && (
          <img
            src={coverImage}
            alt={`${name}'s cover`}
            className="w-full h-full object-cover"
          />
        )}
        {featured && (
          <Badge className="absolute top-3 right-3 bg-brand-orange">Featured Influencer</Badge>
        )}
      </div>
      
      {/* Profile Image */}
      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden -mt-12 relative z-10">
          <img
            src={profileImage}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      <CardHeader className="text-center pt-2">
        <h3 className="text-xl font-bold">{name}</h3>
        <div className="flex flex-wrap justify-center gap-2 mt-1">
          {niche.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        {location && (
          <p className="text-sm text-gray-500 mt-1">{location}</p>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Bio */}
        <p className="text-gray-600 text-sm mb-4">{bio}</p>
        
        <Separator className="my-4" />
        
        {/* Social Stats */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Audience Reach</h4>
          <div className="grid grid-cols-2 gap-2">
            {socialStats.instagram && (
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">Instagram</p>
                <p className="font-semibold">{socialStats.instagram.followers}</p>
                <p className="text-xs text-brand-orange">{socialStats.instagram.engagement} Engagement</p>
              </div>
            )}
            {socialStats.youtube && (
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">YouTube</p>
                <p className="font-semibold">{socialStats.youtube.subscribers}</p>
                <p className="text-xs text-brand-orange">{socialStats.youtube.views} Avg. Views</p>
              </div>
            )}
            {socialStats.tiktok && (
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">TikTok</p>
                <p className="font-semibold">{socialStats.tiktok.followers}</p>
                <p className="text-xs text-brand-orange">{socialStats.tiktok.likes} Likes</p>
              </div>
            )}
            {socialStats.facebook && (
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">Facebook</p>
                <p className="font-semibold">{socialStats.facebook.likes}</p>
                <p className="text-xs text-brand-orange">{socialStats.facebook.reach} Reach</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Social Links */}
        <div className="flex justify-center space-x-3 mb-4">
          {socialLinks.instagram && (
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram className="h-5 w-5 text-gray-600 hover:text-brand-orange transition-colors" />
            </a>
          )}
          {socialLinks.facebook && (
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook className="h-5 w-5 text-gray-600 hover:text-brand-orange transition-colors" />
            </a>
          )}
          {socialLinks.linkedin && (
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5 text-gray-600 hover:text-brand-orange transition-colors" />
            </a>
          )}
        </div>
        
        {/* Previous Brands */}
        {previousBrands && previousBrands.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Previous Collaborations</h4>
            <div className="flex flex-wrap gap-1">
              {previousBrands.map((brand, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {brand}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* CTA Button */}
        <div className="mt-4">
          <Button className="w-full bg-brand-orange">Contact Influencer</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfluencerProfile;
