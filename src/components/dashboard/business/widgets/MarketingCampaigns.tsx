
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp } from "lucide-react";
import { ResponsiveBar } from "@nivo/bar";

const MarketingCampaigns = () => {
  // Mock data
  const campaigns = [
    { id: "Summer Sale", status: "Active", progress: 78, startDate: "Jun 1", endDate: "Aug 31" },
    { id: "New Product", status: "Planned", progress: 0, startDate: "Sep 15", endDate: "Oct 15" },
    { id: "Brand Awareness", status: "Completed", progress: 100, startDate: "Jan 1", endDate: "Mar 31" },
  ];
  
  const chartData = [
    { campaign: "Reels", value: 80 },
    { campaign: "SEO", value: 65 },
    { campaign: "Ads", value: 45 },
    { campaign: "Social", value: 90 },
    { campaign: "Email", value: 30 },
  ];
  
  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Marketing Campaigns</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Overview of your marketing activities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[200px]">
          <ResponsiveBar
            data={chartData}
            keys={["value"]}
            indexBy="campaign"
            margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
            padding={0.3}
            colors="hsl(var(--primary))"
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
            enableGridY={true}
            labelSkipWidth={12}
            labelSkipHeight={12}
            role="application"
            ariaLabel="Marketing campaign performance"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Campaign</span>
            <span>Status</span>
          </div>
          {campaigns.map(campaign => (
            <div key={campaign.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">{campaign.id}</div>
                <div className="text-xs text-muted-foreground">
                  {campaign.startDate} - {campaign.endDate}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    campaign.status === "Active" 
                      ? "bg-green-100 text-green-700" 
                      : campaign.status === "Planned" 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {campaign.status}
                </span>
                {campaign.status === "Active" && (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button variant="outline" size="sm" className="w-full">
          View All Campaigns
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MarketingCampaigns;
