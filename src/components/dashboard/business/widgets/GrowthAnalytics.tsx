
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ResponsiveLine } from "@nivo/line";

const GrowthAnalytics = () => {
  // Mock data
  const metrics = [
    { 
      name: "New Customers", 
      value: 128, 
      change: 12.8, 
      trend: "up" 
    },
    { 
      name: "Revenue", 
      value: "₹32,450", 
      change: 8.3, 
      trend: "up" 
    },
    { 
      name: "Avg. Order Value", 
      value: "₹1,259", 
      change: -2.1, 
      trend: "down" 
    },
  ];
  
  const chartData = [
    {
      id: "growth",
      color: "hsl(var(--primary))",
      data: [
        { x: "Jan", y: 20 },
        { x: "Feb", y: 25 },
        { x: "Mar", y: 22 },
        { x: "Apr", y: 30 },
        { x: "May", y: 27 },
        { x: "Jun", y: 35 },
        { x: "Jul", y: 42 },
      ]
    }
  ];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Growth Analytics</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Your business growth metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[150px]">
          <ResponsiveLine
            data={chartData}
            margin={{ top: 10, right: 10, bottom: 30, left: 30 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: "auto", max: "auto" }}
            curve="cardinal"
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              tickValues: 5,
            }}
            colors={{ datum: "color" }}
            pointSize={6}
            pointColor="white"
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            enableGridX={false}
            enableArea={true}
            areaOpacity={0.1}
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {metrics.map(metric => (
            <div key={metric.name} className="space-y-1">
              <div className="text-xs text-muted-foreground">{metric.name}</div>
              <div className="text-lg font-bold">{metric.value}</div>
              <div className={`flex items-center text-xs ${
                metric.trend === "up" ? "text-green-600" : "text-red-600"
              }`}>
                {metric.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {metric.change}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button variant="outline" size="sm" className="w-full">
          View Detailed Analytics
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GrowthAnalytics;
