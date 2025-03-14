
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PieChart, VideoIcon } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ResponsivePie } from "@nivo/pie";

const ReelsProgress = () => {
  // Mock data
  const totalReels = 20;
  const completedReels = 12;
  const pendingReels = totalReels - completedReels;
  const progressPercentage = (completedReels / totalReels) * 100;
  
  const pieData = [
    { id: "Completed", value: completedReels, color: "hsl(var(--primary))" },
    { id: "Pending", value: pendingReels, color: "hsl(var(--muted))" },
  ];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Reels Progress</CardTitle>
          <VideoIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Track your reels creation progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[180px]">
          <ResponsivePie
            data={pieData}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            innerRadius={0.6}
            padAngle={0.5}
            cornerRadius={3}
            colors={{ datum: 'data.color' }}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
            enableArcLabels={false}
            enableArcLinkLabels={false}
            activeOuterRadiusOffset={8}
          />
        </div>
        <div className="mt-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{completedReels} of {totalReels} reels</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button variant="outline" size="sm" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReelsProgress;
