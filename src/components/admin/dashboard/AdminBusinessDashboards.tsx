
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  
  return (
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
                      <Button variant="ghost" size="sm">
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
  );
};

export default AdminBusinessDashboards;
