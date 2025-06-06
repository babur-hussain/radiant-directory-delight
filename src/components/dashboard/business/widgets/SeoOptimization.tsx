
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const SeoOptimization = () => {
  // Mock data
  const seoScore = 72;
  const metrics = [
    { name: "Keyword Rankings", value: 68, target: 100 },
    { name: "Page Optimization", value: 85, target: 100 },
    { name: "Backlinks", value: 62, target: 100 },
    { name: "Technical SEO", value: 79, target: 100 }
  ];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">SEO Optimization</CardTitle>
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Track your search engine optimization progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center flex-col">
          <div className="relative flex items-center justify-center w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 40 * seoScore / 100} ${2 * Math.PI * 40 * (100 - seoScore) / 100}`}
                strokeDashoffset={2 * Math.PI * 40 * 0.25}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{seoScore}</span>
            </div>
          </div>
          <p className="text-sm font-medium mt-2">SEO Score</p>
        </div>
        
        <div className="space-y-2">
          {metrics.map((metric, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span>{metric.name}</span>
                <span className="font-medium">{metric.value}/{metric.target}</span>
              </div>
              <Progress 
                value={(metric.value / metric.target) * 100} 
                className="h-1.5" 
              />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button variant="outline" size="sm" className="w-full">
          View SEO Report
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SeoOptimization;
