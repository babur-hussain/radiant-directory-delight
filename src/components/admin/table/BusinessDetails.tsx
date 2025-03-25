
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Tag,
  Award
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Business, ensureTagsArray } from '@/types/business';
import { createGoogleSearchUrl } from '@/lib/utils';

interface BusinessDetailsProps {
  business: Business | null;
  open: boolean;
  onClose: () => void;
}

const BusinessDetails: React.FC<BusinessDetailsProps> = ({ 
  business, 
  open, 
  onClose 
}) => {
  if (!business) return null;
  
  // Ensure tags is always an array
  const tags = ensureTagsArray(business.tags);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Business Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4">
          {/* Header with image and rating */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="h-[200px] rounded-md overflow-hidden bg-gray-100">
                {business.image ? (
                  <img 
                    src={business.image} 
                    alt={business.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-2xl font-semibold ml-1">{business.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({business.reviews} reviews)
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {tags.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* Business information */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{business.name}</CardTitle>
                  <CardDescription>{business.category}</CardDescription>
                </div>
                {business.featured && (
                  <Badge className="ml-2">
                    <Award className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{business.description}</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Contact Information</h4>
                  
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <span className="text-sm">{business.address || "No address provided"}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{business.phone || "No phone provided"}</span>
                  </div>
                  
                  {business.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a 
                        href={`mailto:${business.email}`} 
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {business.email}
                      </a>
                    </div>
                  )}
                  
                  {business.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a 
                        href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate max-w-[220px]"
                      >
                        {business.website}
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Business Details</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-muted-foreground">ID</span>
                      <div className="text-sm">{business.id}</div>
                    </div>
                    
                    <div>
                      <span className="text-xs text-muted-foreground">Created At</span>
                      <div className="text-sm">
                        {business.created_at 
                          ? new Date(business.created_at).toLocaleDateString() 
                          : "N/A"}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs text-muted-foreground">Last Updated</span>
                      <div className="text-sm">
                        {business.updated_at 
                          ? new Date(business.updated_at).toLocaleDateString() 
                          : "N/A"}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs text-muted-foreground">Featured</span>
                      <div className="text-sm">{business.featured ? "Yes" : "No"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Action buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <a 
                  href={createGoogleSearchUrl(business.name, business.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Google
                </a>
              </Button>
              <Button>Edit Business</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessDetails;
