
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart, Maximize2 } from "lucide-react";
import { ResponsiveLine } from "@nivo/line";

const PerformanceMetrics = () => {
  // Mock data
  const data = [
    {
      id: "engagement",
      color: "hsl(var(--primary))",
      data: [
        { x: "Jan", y: 25 },
        { x: "Feb", y: 30 },
        { x: "Mar", y: 28 },
        { x: "Apr", y: 45 },
        { x: "May", y: 52 },
        { x: "Jun", y: 60 }
      ]
    },
    {
      id: "reach",
      color: "hsl(var(--muted-foreground))",
      data: [
        { x: "Jan", y: 40 },
        { x: "Feb", y: 45 },
        { x: "Mar", y: 50 },
        { x: "Apr", y: 60 },
        { x: "May", y: 75 },
        { x: "Jun", y: 85 }
      ]
    }
  ];
  
  const metrics = [
    { name: "Engagement Rate", value: "4.8%", change: "+0.6%", positive: true },
    { name: "Avg. Reach", value: "12.5K", change: "+2.3K", positive: true },
    { name: "Impressions", value: "45.2K", change: "+10.1K", positive: true }
  ];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Performance Metrics</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Your growth and engagement metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[160px]">
          <ResponsiveLine
            data={data}
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
          <Maximize2 className="h-3 w-3 mr-2" />
          View Full Analytics
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PerformanceMetrics;
