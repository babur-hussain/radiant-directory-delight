
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin } from "lucide-react";

const GoogleBusinessListing = () => {
  // Mock data
  const status = "Verified";
  const completionPercentage = 82;
  const tasks = [
    { name: "Business Information", completed: true },
    { name: "Photos Uploaded", completed: true },
    { name: "Business Hours", completed: true },
    { name: "Services Added", completed: true },
    { name: "Q&A Section", completed: false },
    { name: "Posts Updated", completed: false }
  ];
  
  const insights = {
    views: 865,
    viewsChange: "+12%",
    searches: 342,
    searchesChange: "+8%",
    actions: 124,
    actionsChange: "+15%"
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Google Business Profile</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Status of your Google My Business listing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Status:</span>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> {status}
          </span>
        </div>
        
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span>Completion</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`h-4 w-4 rounded-full flex items-center justify-center ${task.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                {task.completed ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-current" />
                )}
              </div>
              <span className="text-xs">{task.name}</span>
            </div>
          ))}
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-xs font-medium mb-2">Profile Insights (30 days)</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Views</p>
              <p className="text-sm font-medium">{insights.views}</p>
              <span className="text-xs text-green-600">{insights.viewsChange}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Searches</p>
              <p className="text-sm font-medium">{insights.searches}</p>
              <span className="text-xs text-green-600">{insights.searchesChange}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Actions</p>
              <p className="text-sm font-medium">{insights.actions}</p>
              <span className="text-xs text-green-600">{insights.actionsChange}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button variant="outline" size="sm" className="w-full">
          Manage Listing
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GoogleBusinessListing;
