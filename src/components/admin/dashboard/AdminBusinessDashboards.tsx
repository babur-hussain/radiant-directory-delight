
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Dashboard interface
interface BusinessDashboard {
  id: string;
  businessName: string;
  owner: string;
  email: string;
  subscription: string;
  lastActive: string;
  status: string;
}

const mockBusinessDashboards = [
  {
    id: "bd1",
    businessName: "Global Foods",
    owner: "Rahul Sharma",
    email: "rahul@globalfoods.com",
    subscription: "Premium",
    lastActive: "2023-10-15T10:30:00",
    status: "active"
  },
  {
    id: "bd2",
    businessName: "Tech Solutions",
    owner: "Priya Patel",
    email: "priya@techsolutions.in",
    subscription: "Standard",
    lastActive: "2023-10-14T14:45:00",
    status: "active"
  },
  {
    id: "bd3",
    businessName: "Sunrise Boutique",
    owner: "Amit Kumar",
    email: "amit@sunriseboutique.in",
    subscription: "Basic",
    lastActive: "2023-10-10T09:15:00",
    status: "inactive"
  },
  {
    id: "bd4",
    businessName: "Urban Fitness",
    owner: "Neha Singh",
    email: "neha@urbanfitness.com",
    subscription: "Premium",
    lastActive: "2023-10-13T16:20:00",
    status: "active"
  },
  {
    id: "bd5",
    businessName: "Fresh Grocers",
    owner: "Vikram Reddy",
    email: "vikram@freshgrocers.in",
    subscription: "Standard",
    lastActive: "2023-10-08T11:10:00",
    status: "inactive"
  }
];

const AdminBusinessDashboards = () => {
  const [dashboards, setDashboards] = useState(mockBusinessDashboards);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDashboard, setSelectedDashboard] = useState<BusinessDashboard | null>(null);
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
      dashboard.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dashboard.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
  
  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle view dashboard details
  const handleViewDashboard = (dashboard: BusinessDashboard) => {
    setSelectedDashboard(dashboard);
    setShowDetailsDialog(true);
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Business Dashboards</CardTitle>
          <CardDescription>
            Monitor and manage business dashboards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <div className="mb-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by business name, owner, or email"
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
                  <TableHead>Business</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredDashboards.length > 0 ? (
                  filteredDashboards.map(dashboard => (
                    <TableRow key={dashboard.id}>
                      <TableCell>
                        <div className="font-medium">{dashboard.businessName}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{dashboard.owner}</p>
                          <p className="text-sm text-muted-foreground">{dashboard.email}</p>
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
                    <TableCell colSpan={6} className="h-24 text-center">
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
            <DialogTitle>{selectedDashboard?.businessName} Dashboard</DialogTitle>
            <DialogDescription>Business dashboard details and management</DialogDescription>
          </DialogHeader>
          
          {selectedDashboard && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Owner</h4>
                  <p>{selectedDashboard.owner}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                  <p>{selectedDashboard.email}</p>
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
                  <Button variant="outline">Edit Settings</Button>
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

export default AdminBusinessDashboards;
