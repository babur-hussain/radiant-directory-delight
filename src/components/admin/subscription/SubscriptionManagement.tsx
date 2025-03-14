
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, RefreshCw, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { SubscriptionPackage } from "@/data/subscriptionData";
import { fetchSubscriptionPackages, saveSubscriptionPackage, deleteSubscriptionPackage } from "@/lib/firebase-utils";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import SubscriptionPackageForm from "./SubscriptionPackageForm";

export const SubscriptionPackageManagement = () => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<SubscriptionPackage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("business");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);
  
  useEffect(() => {
    loadPackages();
  }, []);
  
  const loadPackages = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSubscriptionPackages();
      setPackages(data);
      setFilteredPackages(data.filter(pkg => pkg.type.toLowerCase() === activeTab));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subscription packages. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const filtered = packages.filter(pkg => 
      pkg.type.toLowerCase() === activeTab &&
      (pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       pkg.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPackages(filtered);
  }, [packages, searchTerm, activeTab]);
  
  const handleAddPackage = () => {
    setSelectedPackage(null);
    setIsFormOpen(true);
  };
  
  const handleEditPackage = (pkg: SubscriptionPackage) => {
    setSelectedPackage(pkg);
    setIsFormOpen(true);
  };
  
  const handleDeletePackage = (pkg: SubscriptionPackage) => {
    setSelectedPackage(pkg);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeletePackage = async () => {
    if (!selectedPackage) return;
    
    setIsLoading(true);
    try {
      await deleteSubscriptionPackage(selectedPackage.id);
      setPackages(packages.filter(p => p.id !== selectedPackage.id));
      
      toast({
        title: "Package Deleted",
        description: `${selectedPackage.title} has been deleted successfully.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete package. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedPackage(null);
    }
  };
  
  const handleSavePackage = async (packageData: SubscriptionPackage) => {
    setIsLoading(true);
    try {
      await saveSubscriptionPackage(packageData);
      
      // Update local state
      if (selectedPackage) {
        // Edit case
        setPackages(packages.map(p => p.id === packageData.id ? packageData : p));
      } else {
        // Add case
        setPackages([...packages, packageData]);
      }
      
      toast({
        title: selectedPackage ? "Package Updated" : "Package Created",
        description: `${packageData.title} has been ${selectedPackage ? 'updated' : 'created'} successfully.`
      });
      
      setIsFormOpen(false);
      setSelectedPackage(null);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${selectedPackage ? 'update' : 'create'} package. Please try again later.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Package Management</CardTitle>
        <CardDescription>Manage subscription packages for businesses and influencers</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="business" 
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            setSearchTerm("");
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="business">Business Packages</TabsTrigger>
              <TabsTrigger value="influencer">Influencer Packages</TabsTrigger>
            </TabsList>
            
            <Button onClick={handleAddPackage}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Package
            </Button>
          </div>
          
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or description"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSearchTerm("")} 
              disabled={!searchTerm}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={loadPackages}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          
          {activeTab === "business" && (
            <TabsContent value="business" className="mt-0">
              <PackageTable 
                packages={filteredPackages}
                isLoading={isLoading}
                onEdit={handleEditPackage}
                onDelete={handleDeletePackage}
                formatPrice={formatPrice}
              />
            </TabsContent>
          )}
          
          {activeTab === "influencer" && (
            <TabsContent value="influencer" className="mt-0">
              <PackageTable 
                packages={filteredPackages}
                isLoading={isLoading}
                onEdit={handleEditPackage}
                onDelete={handleDeletePackage}
                formatPrice={formatPrice}
              />
            </TabsContent>
          )}
        </Tabs>
        
        {/* Package Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPackage ? "Edit Package" : "Add New Package"}</DialogTitle>
              <DialogDescription>
                {selectedPackage 
                  ? "Update the details of this subscription package"
                  : "Create a new subscription package for your platform"}
              </DialogDescription>
            </DialogHeader>
            
            <SubscriptionPackageForm
              initialData={selectedPackage || undefined}
              onSubmit={handleSavePackage}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog 
          open={isDeleteDialogOpen} 
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Package</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the "{selectedPackage?.title}" package?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeletePackage}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

interface PackageTableProps {
  packages: SubscriptionPackage[];
  isLoading: boolean;
  onEdit: (pkg: SubscriptionPackage) => void;
  onDelete: (pkg: SubscriptionPackage) => void;
  formatPrice: (price: number) => string;
}

const PackageTable: React.FC<PackageTableProps> = ({
  packages,
  isLoading,
  onEdit,
  onDelete,
  formatPrice
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground">Loading packages...</p>
      </div>
    );
  }
  
  if (packages.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md">
        <p className="text-muted-foreground">No packages found</p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Features</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map((pkg) => (
            <TableRow key={pkg.id}>
              <TableCell className="font-medium">{pkg.title}</TableCell>
              <TableCell className="max-w-[200px] truncate">{pkg.shortDescription}</TableCell>
              <TableCell>{formatPrice(pkg.price)}</TableCell>
              <TableCell>{pkg.durationMonths} months</TableCell>
              <TableCell>{pkg.features.length} features</TableCell>
              <TableCell>
                <Badge variant={pkg.popular ? "default" : "secondary"}>
                  {pkg.popular ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {pkg.popular ? "Popular" : "Regular"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(pkg)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    onClick={() => onDelete(pkg)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
