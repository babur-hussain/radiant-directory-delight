
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const BusinessRatings = () => {
  // Mock data
  const overallRating = 4.6;
  const totalReviews = 142;
  const platformRatings = [
    { platform: "Google", rating: 4.7, reviews: 78 },
    { platform: "Facebook", rating: 4.5, reviews: 45 },
    { platform: "Yelp", rating: 4.3, reviews: 19 }
  ];
  
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : i < rating ? "fill-yellow-400 text-yellow-400 fill-opacity-50" : "fill-gray-200 text-gray-200"}`} 
      />
    ));
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Business Ratings</CardTitle>
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        </div>
        <CardDescription>Monitor your business reputation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-bold">{overallRating}</span>
            <div className="flex mt-1">
              {renderStars(overallRating)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm">Based on</span>
            <p className="font-medium">{totalReviews} reviews</p>
          </div>
        </div>
        
        <div className="space-y-3 pt-2">
          {platformRatings.map((platform, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{platform.platform}</span>
                <div className="flex">
                  {renderStars(platform.rating)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">{platform.rating}</span>
                <p className="text-xs text-muted-foreground">{platform.reviews} reviews</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button variant="outline" size="sm" className="w-full">
          View All Reviews
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BusinessRatings;
