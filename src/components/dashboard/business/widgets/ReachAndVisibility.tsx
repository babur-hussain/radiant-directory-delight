
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, TrendingUp } from "lucide-react";
import { ResponsiveLine } from "@nivo/line";

const ReachAndVisibility = () => {
  // Mock data
  const reachData = [
    {
      id: "Social Media",
      color: "hsl(var(--primary))",
      data: [
        { x: "Jan", y: 1200 },
        { x: "Feb", y: 1800 },
        { x: "Mar", y: 2200 },
        { x: "Apr", y: 2800 },
        { x: "May", y: 3500 },
        { x: "Jun", y: 4200 }
      ]
    },
    {
      id: "Web Traffic",
      color: "hsl(var(--secondary))",
      data: [
        { x: "Jan", y: 800 },
        { x: "Feb", y: 1200 },
        { x: "Mar", y: 1300 },
        { x: "Apr", y: 1800 },
        { x: "May", y: 2100 },
        { x: "Jun", y: 2500 }
      ]
    }
  ];
  
  const metrics = [
    { name: "Social Media Reach", value: "4.2K", change: "+28%", positive: true },
    { name: "Website Visitors", value: "2.5K", change: "+15%", positive: true },
    { name: "Offline Visitors", value: "850", change: "+8%", positive: true }
  ];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Reach & Visibility</CardTitle>
          <LineChart className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Track your online and offline visibility</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[160px]">
          <ResponsiveLine
            data={reachData}
            margin={{ top: 10, right: 10, bottom: 30, left: 30 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: "auto", max: "auto", stacked: false, reverse: false }}
            curve="monotoneX"
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "",
              legendOffset: 36,
              legendPosition: "middle"
            }}
            axisLeft={null}
            enableGridX={false}
            enableGridY={false}
            enablePoints={false}
            pointSize={4}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            useMesh={true}
            legends={[]}
            colors={{ datum: "color" }}
          />
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-0.5">
              <p className="text-xs text-muted-foreground truncate">{metric.name}</p>
              <p className="text-sm font-medium">{metric.value}</p>
              <span className={`text-xs ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button variant="outline" size="sm" className="w-full">
          <TrendingUp className="h-3 w-3 mr-2" />
          View Full Report
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReachAndVisibility;
