
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";

const SeoProgress = () => {
  // Mock data
  const overallScore = 78;
  const keywordRanking = 65;
  const contentOptimization = 82;
  const backlinks = 72;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">SEO Progress</CardTitle>
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Track your SEO optimization progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span>Overall SEO Score</span>
            <span className="font-medium">{overallScore}%</span>
          </div>
          <Progress value={overallScore} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>Keyword Ranking</span>
              <span className="font-medium">{keywordRanking}%</span>
            </div>
            <Progress value={keywordRanking} className="h-1.5" />
          </div>
          
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>Content Optimization</span>
              <span className="font-medium">{contentOptimization}%</span>
            </div>
            <Progress value={contentOptimization} className="h-1.5" />
          </div>
          
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>Backlinks</span>
              <span className="font-medium">{backlinks}%</span>
            </div>
            <Progress value={backlinks} className="h-1.5" />
          </div>
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

export default SeoProgress;
