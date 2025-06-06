
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp } from "lucide-react";

const InfluencerRank = () => {
  // Mock data
  const rank = 42;
  const category = "Beauty & Lifestyle";
  const totalInfluencers = 500;
  const percentile = Math.round(((totalInfluencers - rank) / totalInfluencers) * 100);
  
  const metrics = [
    { name: "Content Score", value: 87, max: 100 },
    { name: "Engagement", value: 92, max: 100 },
    { name: "Consistency", value: 79, max: 100 },
    { name: "Growth Rate", value: 85, max: 100 }
  ];
  
  const earnings = {
    currentMonth: 4200,
    previousMonth: 3800,
    change: '+10.5%'
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Influencer Rank</CardTitle>
          <Trophy className="h-4 w-4 text-yellow-500" />
        </div>
        <CardDescription>Your ranking and performance metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-muted-foreground">Current Rank</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold">{rank}</p>
              <p className="text-xs text-muted-foreground">of {totalInfluencers}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="text-sm font-medium">{category}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Percentile</p>
            <p className="text-lg font-bold">Top {percentile}%</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {metrics.map((metric, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span>{metric.name}</span>
                <span className="font-medium">{metric.value}/{metric.max}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div 
                  className="h-1.5 bg-primary rounded-full" 
                  style={{ width: `${(metric.value / metric.max) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Earnings (Current Month)</p>
              <p className="text-lg font-bold">${earnings.currentMonth}</p>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs font-medium">{earnings.change}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button variant="outline" size="sm" className="w-full">
          View Rank Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InfluencerRank;
