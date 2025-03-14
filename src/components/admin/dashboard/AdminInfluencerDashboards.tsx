import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { VideoIcon, PenTool, Star, Search, MapPin, BarChart3, FileText, Award, Plus, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminInfluencerDashboards = () => {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeServices, setActiveServices] = useState<Record<string, boolean>>({
    reels: true,
    creatives: true,
    ratings: true,
    seo: false,
    google_listing: false,
    performance: false,
    leads: false,
    rank: false,
  });
  const [serviceProgress, setServiceProgress] = useState<Record<string, number>>({
    reels: 60,
    creatives: 75,
    ratings: 90,
    seo: 30,
    google_listing: 45,
    performance: 50,
    leads: 25,
    rank: 40,
  });
  
  // Mock users data
  const mockUsers = [
    { id: "1", name: "Vikram Singh", email: "vikram@gmail.com", role: "Influencer", plan: "Premium" },
    { id: "2", name: "Anjali Patel", email: "anjali@outlook.com", role: "Influencer", plan: "Standard" },
    { id: "3", name: "Rohit Sharma", email: "rohit@gmail.com", role: "Influencer", plan: "Basic" },
  ];
  
  const serviceDetails = [
    { id: "reels", name: "Reels Progress", icon: <VideoIcon className="h-4 w-4" /> },
    { id: "creatives", name: "Creatives", icon: <PenTool className="h-4 w-4" /> },
    { id: "ratings", name: "Ratings & Reviews", icon: <Star className="h-4 w-4" /> },
    { id: "seo", name: "SEO Optimization", icon: <Search className="h-4 w-4" /> },
    { id: "google_listing", name: "Google Listing", icon: <MapPin className="h-4 w-4" /> },
    { id: "performance", name: "Performance Metrics", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "leads", name: "Leads Generated", icon: <FileText className="h-4 w-4" /> },
    { id: "rank", name: "Rank & Earnings", icon: <Award className="h-4 w-4" /> },
  ];
  
  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    // In a real app, we would fetch the user's services and progress here
    // For now, we'll just simulate different services being active for different users
    
    const user = mockUsers.find(u => u.id === userId);
    
    if (user) {
      if (user.plan === "Basic") {
        setActiveServices({
          reels: true,
          creatives: true,
          ratings: true,
          seo: false,
          google_listing: false,
          performance: false,
          leads: false,
          rank: false,
        });
      } else if (user.plan === "Standard") {
        setActiveServices({
          reels: true,
          creatives: true,
          ratings: true,
          seo: true,
          google_listing: true,
          performance: false,
          leads: false,
          rank: false,
        });
      } else {
        // Premium
        setActiveServices({
          reels: true,
          creatives: true,
          ratings: true,
          seo: true,
          google_listing: true,
          performance: true,
          leads: true,
          rank: true,
        });
      }
    }
    
    setIsEditing(false);
  };
  
  const handleToggleService = (serviceId: string) => {
    setActiveServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };
  
  const handleProgressChange = (serviceId: string, value: number) => {
    setServiceProgress(prev => ({
      ...prev,
      [serviceId]: value
    }));
  };
  
  const handleSaveChanges = () => {
    toast({
      title: "Changes saved",
      description: "The dashboard services have been updated",
      variant: "success",
    });
    setIsEditing(false);
  };
  
  const handleAddNewService = () => {
    toast({
      title: "Feature coming soon",
      description: "Adding custom services will be available in the next update",
      variant: "info",
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Influencer Dashboards</CardTitle>
          <CardDescription>
            Configure which services appear on influencer dashboards and update their progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="select-user">Select Influencer</Label>
            <Select onValueChange={handleUserSelect} value={selectedUser || undefined}>
              <SelectTrigger id="select-user" className="mt-1">
                <SelectValue placeholder="Select an influencer" />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.plan})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedUser && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Dashboard Services</h3>
                <div className="flex gap-2">
                  {isEditing ? (
                    <Button onClick={handleSaveChanges}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Edit Services
                    </Button>
                  )}
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceDetails.map(service => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {service.icon}
                          <span>{service.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Switch 
                            checked={activeServices[service.id] || false}
                            onCheckedChange={() => handleToggleService(service.id)}
                          />
                        ) : (
                          <span className={activeServices[service.id] ? "text-green-600" : "text-red-600"}>
                            {activeServices[service.id] ? "Active" : "Inactive"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {activeServices[service.id] && (
                          <div className="space-y-1">
                            {isEditing ? (
                              <Input 
                                type="number" 
                                min="0" 
                                max="100" 
                                value={serviceProgress[service.id]} 
                                onChange={(e) => handleProgressChange(service.id, parseInt(e.target.value) || 0)}
                              />
                            ) : (
                              <>
                                <Progress value={serviceProgress[service.id]} className="h-2" />
                                <span className="text-xs text-muted-foreground">{serviceProgress[service.id]}%</span>
                              </>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {isEditing && (
                <Button variant="outline" onClick={handleAddNewService}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Service
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInfluencerDashboards;
