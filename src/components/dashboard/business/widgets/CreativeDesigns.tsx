
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Paintbrush } from "lucide-react";

const CreativeDesigns = () => {
  // Mock data
  const designs = [
    { type: "Social Media Posts", completed: 12, total: 15 },
    { type: "Banners", completed: 5, total: 8 },
    { type: "Flyers", completed: 3, total: 5 },
    { type: "Business Cards", completed: 1, total: 1 },
  ];
  
  const getCompletedPercentage = () => {
    const totalCompleted = designs.reduce((acc, curr) => acc + curr.completed, 0);
    const total = designs.reduce((acc, curr) => acc + curr.total, 0);
    return (totalCompleted / total) * 100;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Creative Designs</CardTitle>
          <Paintbrush className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Track your creative assets production</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Overall Progress</span>
            <span className="text-sm font-medium">{getCompletedPercentage().toFixed(0)}%</span>
          </div>
          <Progress value={getCompletedPercentage()} className="h-2" />
        </div>
        
        <div className="space-y-2">
          {designs.map((design, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span>{design.type}</span>
                <span className="font-medium">{design.completed}/{design.total}</span>
              </div>
              <Progress 
                value={(design.completed / design.total) * 100} 
                className="h-1.5" 
              />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button variant="outline" size="sm" className="w-full">
          View All Designs
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreativeDesigns;
