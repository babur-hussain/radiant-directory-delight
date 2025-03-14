
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
import { BarChart3, VideoIcon, PenTool, Star, Search, MapPin, TrendingUp, FileText, ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminBusinessDashboards = () => {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeServices, setActiveServices] = useState<Record<string, boolean>>({
    marketing: true,
    reels: true,
    creatives: true,
    ratings: true,
    seo: false,
    google_listing: false,
    growth: false,
    leads: false,
    reach: false,
  });
  const [serviceProgress, setServiceProgress] = useState<Record<string, number>>({
    marketing: 55,
    reels: 70,
    creatives: 80,
    ratings: 65,
    seo: 40,
    google_listing: 30,
    growth: 60,
    leads: 45,
    reach: 25,
  });
  
  // Mock users data
  const mockUsers = [
    { id: "1", name: "Rajesh Ventures", email: "rajesh@ventures.com", role: "Business", plan: "Premium" },
    { id: "2", name: "Maya's Boutique", email: "maya@boutique.com", role: "Business", plan: "Standard" },
    { id: "3", name: "Sharma Electronics", email: "info@sharma.com", role: "Business", plan: "Basic" },
  ];
  
  const serviceDetails = [
    { id: "marketing", name: "Marketing Campaigns", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "reels", name: "Reels & Video Ads", icon: <VideoIcon className="h-4 w-4" /> },
    { id: "creatives", name: "Creative Designs", icon: <PenTool className="h-4 w-4" /> },
    { id: "ratings", name: "Ratings & Reviews", icon: <Star className="h-4 w-4" /> },
    { id: "seo", name: "SEO Optimization", icon: <Search className="h-4 w-4" /> },
    { id: "google_listing", name: "Google Business Listing", icon: <MapPin className="h-4 w-4" /> },
    { id: "growth", name: "Growth Analytics", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "leads", name: "Leads & Inquiries", icon: <FileText className="h-4 w-4" /> },
    { id: "reach", name: "Reach & Visibility", icon: <ExternalLink className="h-4 w-4" /> },
  ];
  
  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    // In a real app, we would fetch the user's services and progress here
    // For now, we'll just simulate different services being active for different users
    
    const user = mockUsers.find(u => u.id === userId);
    
    if (user) {
      if (user.plan === "Basic") {
        setActiveServices({
          marketing: true,
          reels: true,
          creatives: false,
          ratings: true,
          seo: false,
          google_listing: false,
          growth: false,
          leads: false,
          reach: false,
        });
      } else if (user.plan === "Standard") {
        setActiveServices({
          marketing: true,
          reels: true,
          creatives: true,
          ratings: true,
          seo: true,
          google_listing: false,
          growth: false,
          leads: false,
          reach: false,
        });
      } else {
        // Premium
        setActiveServices({
          marketing: true,
          reels: true,
          creatives: true,
          ratings: true,
          seo: true,
          google_listing: true,
          growth: true,
          leads: true,
          reach: true,
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
          <CardTitle>Manage Business Dashboards</CardTitle>
          <CardDescription>
            Configure which services appear on business dashboards and update their progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="select-user">Select Business</Label>
            <Select onValueChange={handleUserSelect} value={selectedUser || undefined}>
              <SelectTrigger id="select-user" className="mt-1">
                <SelectValue placeholder="Select a business" />
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

export default AdminBusinessDashboards;
