
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PenTool } from "lucide-react";

const CreativesTracker = () => {
  // Mock data
  const data = {
    posters: { completed: 8, total: 10 },
    thumbnails: { completed: 15, total: 20 },
    banners: { completed: 3, total: 5 },
  };
  
  const getTotalProgress = () => {
    const completed = Object.values(data).reduce((acc, curr) => acc + curr.completed, 0);
    const total = Object.values(data).reduce((acc, curr) => acc + curr.total, 0);
    return (completed / total) * 100;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Creatives</CardTitle>
          <PenTool className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Track your creative designs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span>Total Progress</span>
            <span className="font-medium">{getTotalProgress().toFixed(0)}%</span>
          </div>
          <Progress value={getTotalProgress()} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>Posters</span>
              <span className="font-medium">{data.posters.completed}/{data.posters.total}</span>
            </div>
            <Progress value={(data.posters.completed / data.posters.total) * 100} className="h-1.5" />
          </div>
          
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>Thumbnails</span>
              <span className="font-medium">{data.thumbnails.completed}/{data.thumbnails.total}</span>
            </div>
            <Progress value={(data.thumbnails.completed / data.thumbnails.total) * 100} className="h-1.5" />
          </div>
          
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>Banners</span>
              <span className="font-medium">{data.banners.completed}/{data.banners.total}</span>
            </div>
            <Progress value={(data.banners.completed / data.banners.total) * 100} className="h-1.5" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button variant="outline" size="sm" className="w-full">
          View All Creatives
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreativesTracker;
