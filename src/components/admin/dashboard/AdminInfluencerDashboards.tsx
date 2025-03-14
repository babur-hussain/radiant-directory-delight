
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, ArrowRight, CheckCircle, AlertTriangle, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Influencer Dashboard interface
interface InfluencerDashboard {
  id: string;
  name: string;
  email: string;
  followers: number;
  performance: number;
  subscription: string;
  lastActive: string;
  status: string;
}

const mockInfluencerDashboards = [
  {
    id: "id1",
    name: "Aarav Patel",
    email: "aarav@socialinfluencer.in",
    followers: 125000,
    performance: 92,
    subscription: "Premium",
    lastActive: "2023-10-15T11:20:00",
    status: "active"
  },
  {
    id: "id2",
    name: "Diya Sharma",
    email: "diya@contentcreator.com",
    followers: 78500,
    performance: 84,
    subscription: "Standard",
    lastActive: "2023-10-14T09:45:00",
    status: "active"
  },
  {
    id: "id3",
    name: "Rohan Mehta",
    email: "rohan@digitalcreator.in",
    followers: 42000,
    performance: 76,
    subscription: "Basic",
    lastActive: "2023-10-10T15:30:00",
    status: "inactive"
  },
  {
    id: "id4",
    name: "Ananya Singh",
    email: "ananya@trendsetter.com",
    followers: 210000,
    performance: 95,
    subscription: "Premium",
    lastActive: "2023-10-13T16:50:00",
    status: "active"
  },
  {
    id: "id5",
    name: "Vikram Kapoor",
    email: "vikram@socialstar.in",
    followers: 65000,
    performance: 81,
    subscription: "Standard",
    lastActive: "2023-10-09T14:15:00",
    status: "inactive"
  }
];

const AdminInfluencerDashboards = () => {
  const [dashboards, setDashboards] = useState(mockInfluencerDashboards);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDashboard, setSelectedDashboard] = useState<InfluencerDashboard | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  useEffect(() => {
    // Simulate API call to fetch dashboards
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter dashboards based on search term
  const filteredDashboards = dashboards.filter(
    dashboard =>
      dashboard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dashboard.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Format followers count
  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };
  
  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle view dashboard details
  const handleViewDashboard = (dashboard: InfluencerDashboard) => {
    setSelectedDashboard(dashboard);
    setShowDetailsDialog(true);
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Influencer Dashboards</CardTitle>
          <CardDescription>
            Monitor and manage influencer dashboards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <div className="mb-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email"
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          {/* Dashboards Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Influencer</TableHead>
                  <TableHead>Followers</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredDashboards.length > 0 ? (
                  filteredDashboards.map(dashboard => (
                    <TableRow key={dashboard.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{dashboard.name}</p>
                          <p className="text-sm text-muted-foreground">{dashboard.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatFollowers(dashboard.followers)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className={`font-medium ${
                            dashboard.performance >= 90 ? 'text-green-600' :
                            dashboard.performance >= 80 ? 'text-blue-600' :
                            dashboard.performance >= 70 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {dashboard.performance}%
                          </span>
                          {dashboard.performance >= 90 && (
                            <Star className="h-4 w-4 ml-1 text-amber-400 fill-amber-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{dashboard.subscription}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(dashboard.lastActive)}</TableCell>
                      <TableCell>
                        {dashboard.status === "active" ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDashboard(dashboard)}
                        >
                          View
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <p className="text-muted-foreground">No dashboards found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedDashboard?.name} Dashboard</DialogTitle>
            <DialogDescription>Influencer dashboard details and management</DialogDescription>
          </DialogHeader>
          
          {selectedDashboard && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                  <p>{selectedDashboard.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                  <p>{selectedDashboard.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Followers</h4>
                  <p>{formatFollowers(selectedDashboard.followers)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Performance</h4>
                  <div className="flex items-center">
                    <span className={`font-medium ${
                      selectedDashboard.performance >= 90 ? 'text-green-600' :
                      selectedDashboard.performance >= 80 ? 'text-blue-600' :
                      selectedDashboard.performance >= 70 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {selectedDashboard.performance}%
                    </span>
                    {selectedDashboard.performance >= 90 && (
                      <Star className="h-4 w-4 ml-1 text-amber-400 fill-amber-400" />
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Subscription</h4>
                  <Badge variant="outline">{selectedDashboard.subscription}</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  {selectedDashboard.status === "active" ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800">Inactive</Badge>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Last Active</h4>
                  <p>{formatDate(selectedDashboard.lastActive)}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Dashboard Management</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline">Edit Profile</Button>
                  <Button variant={selectedDashboard.status === "active" ? "destructive" : "default"}>
                    {selectedDashboard.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminInfluencerDashboards;
