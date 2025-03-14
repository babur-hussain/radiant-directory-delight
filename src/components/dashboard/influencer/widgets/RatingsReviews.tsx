
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, StarIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const RatingsReviews = () => {
  // Mock data
  const averageRating = 4.7;
  const totalReviews = 28;
  
  const reviews = [
    {
      id: 1,
      name: "Alex Johnson",
      business: "Tech Solutions",
      rating: 5,
      comment: "Exceptional content creation. Really helped our brand stand out!",
      date: "2 days ago",
      avatarUrl: ""
    },
    {
      id: 2,
      name: "Priya Sharma",
      business: "Wellness Hub",
      rating: 4,
      comment: "Great collaboration experience. Creative and professional.",
      date: "1 week ago",
      avatarUrl: ""
    }
  ];
  
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < rating ? "fill-primary text-primary" : "fill-muted text-muted"}`} 
      />
    ));
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Ratings & Reviews</CardTitle>
          <StarIcon className="h-4 w-4 text-yellow-400" />
        </div>
        <CardDescription>Your client satisfaction metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{averageRating}</span>
            <div className="flex">
              {renderStars(Math.round(averageRating))}
            </div>
          </div>
          <span className="text-sm text-muted-foreground">{totalReviews} reviews</span>
        </div>
        
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={review.avatarUrl} alt={review.name} />
                  <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{review.name}</span>
                  <span className="text-[10px] text-muted-foreground">{review.business}</span>
                </div>
                <div className="ml-auto flex">{renderStars(review.rating)}</div>
              </div>
              <p className="text-xs">{review.comment}</p>
              <span className="text-[10px] text-muted-foreground">{review.date}</span>
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

export default RatingsReviews;
