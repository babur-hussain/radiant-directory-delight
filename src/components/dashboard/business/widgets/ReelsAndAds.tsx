
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

const ReelsAndAds = () => {
  // Mock data
  const reels = {
    completed: 7,
    total: 10,
    distribution: [
      { platform: "Instagram", count: 3 },
      { platform: "Facebook", count: 2 },
      { platform: "TikTok", count: 1 },
      { platform: "YouTube", count: 1 }
    ]
  };
  
  const ads = {
    active: 3,
    impressions: "24.5K",
    clicks: "2.8K"
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Reels & Video Ads</CardTitle>
          <Video className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Track your video content creation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Reels Progress</span>
              <span className="text-sm font-medium">{reels.completed}/{reels.total}</span>
            </div>
            <Progress value={(reels.completed / reels.total) * 100} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-medium">Distribution</p>
            <div className="grid grid-cols-2 gap-2">
              {reels.distribution.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-xs">{item.platform}</span>
                  <span className="text-xs font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <p className="text-xs font-medium mb-2">Video Ads Performance</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Active Ads</p>
                <p className="text-sm font-medium">{ads.active}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Impressions</p>
                <p className="text-sm font-medium">{ads.impressions}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Clicks</p>
                <p className="text-sm font-medium">{ads.clicks}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button variant="outline" size="sm" className="w-full">
          View All Video Content
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReelsAndAds;
