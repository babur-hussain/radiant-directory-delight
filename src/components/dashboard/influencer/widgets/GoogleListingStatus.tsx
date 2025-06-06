
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin } from "lucide-react";

const GoogleListingStatus = () => {
  // Mock data
  const status = "Verified";
  const completionPercentage = 85;
  const tasks = [
    { name: "Business Information", completed: true },
    { name: "Photos Uploaded", completed: true },
    { name: "Business Hours", completed: true },
    { name: "Services Added", completed: false },
    { name: "Q&A Section", completed: false }
  ];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Google Business Listing</CardTitle>
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
        
        <div className="space-y-1">
          <p className="text-sm font-medium mb-2">Tasks:</p>
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`h-4 w-4 rounded-full flex items-center justify-center ${task.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                {task.completed ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-current" />
                )}
              </div>
              <span className="text-sm">{task.name}</span>
            </div>
          ))}
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

export default GoogleListingStatus;
