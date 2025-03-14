
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { ResponsiveBar } from "@nivo/bar";

const LeadsAndInquiries = () => {
  // Mock data
  const leadsData = {
    total: 124,
    contacted: 98,
    converted: 42,
    conversionRate: "33.9%"
  };
  
  const barData = [
    { month: "Jan", inquiries: 18, conversions: 5 },
    { month: "Feb", inquiries: 22, conversions: 7 },
    { month: "Mar", inquiries: 25, conversions: 9 },
    { month: "Apr", inquiries: 30, conversions: 11 },
    { month: "May", inquiries: 29, conversions: 10 }
  ];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Leads & Inquiries</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Track customer leads and conversion metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Total Leads</p>
            <p className="text-lg font-bold">{leadsData.total}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Contacted</p>
            <p className="text-lg font-bold">{leadsData.contacted}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Converted</p>
            <p className="text-lg font-bold">{leadsData.converted}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Conv. Rate</p>
            <p className="text-lg font-bold">{leadsData.conversionRate}</p>
          </div>
        </div>
        
        <div className="h-[140px]">
          <ResponsiveBar
            data={barData}
            keys={["inquiries", "conversions"]}
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

export default LeadsAndInquiries;
