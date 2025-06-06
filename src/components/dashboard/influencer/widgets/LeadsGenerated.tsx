
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { ResponsiveBar } from "@nivo/bar";

const LeadsGenerated = () => {
  // Mock data
  const totalLeads = 87;
  const convertedLeads = 32;
  const conversionRate = Math.round((convertedLeads / totalLeads) * 100);
  
  const barData = [
    { month: "Jan", leads: 12, converted: 4 },
    { month: "Feb", leads: 15, converted: 6 },
    { month: "Mar", leads: 18, converted: 7 },
    { month: "Apr", leads: 22, converted: 8 },
    { month: "May", leads: 20, converted: 7 }
  ];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Leads Generated</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Inquiries and conversions from your content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-muted-foreground">Total Leads</p>
            <p className="text-2xl font-bold">{totalLeads}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Converted</p>
            <p className="text-2xl font-bold">{convertedLeads}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rate</p>
            <p className="text-2xl font-bold">{conversionRate}%</p>
          </div>
        </div>
        
        <div className="h-[140px]">
          <ResponsiveBar
            data={barData}
            keys={["leads", "converted"]}
            indexBy="month"
            margin={{ top: 10, right: 0, bottom: 20, left: 0 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={["hsl(var(--muted))", "hsl(var(--primary))"]}
            borderRadius={2}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 5,
              tickRotation: 0,
            }}
            axisLeft={null}
            enableGridY={false}
            enableLabel={false}
            role="application"
            legends={[]}
          />
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button variant="outline" size="sm" className="w-full">
          View Lead Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LeadsGenerated;
