
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Pencil, Trash2, Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { SubscriptionPackage } from "@/data/subscriptionData";
import { fetchSubscriptionPackages, saveSubscriptionPackage, deleteSubscriptionPackage } from "@/lib/firebase-utils";
import SubscriptionPackageForm from "./SubscriptionPackageForm";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPackageManagementProps {
  onPermissionError?: (error: any) => void;
}

export const SubscriptionPackageManagement: React.FC<SubscriptionPackageManagementProps> = ({ 
  onPermissionError 
}) => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<SubscriptionPackage | null>(null);
  const [activeTab, setActiveTab] = useState("business");
  const { toast } = useToast();

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    if (packages.length > 0) {
      setFilteredPackages(packages.filter(pkg => 
        pkg.type.toLowerCase() === activeTab
      ));
    }
  }, [packages, activeTab]);

  const loadPackages = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSubscriptionPackages();
      setPackages(data);
      setFilteredPackages(data.filter(pkg => pkg.type.toLowerCase() === activeTab));
    } catch (error) {
      console.error("Error loading packages:", error);
      
      // Handle permission error
      if (onPermissionError && error instanceof Error && 
          (error.message.includes("Permission denied") || 
           error.message.includes("Missing or insufficient permissions"))) {
        onPermissionError(error);
      } else {
        toast({
          title: "Error",
          description: "Failed to load subscription packages. Please try again later.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePackage = () => {
    setSelectedPackage(null);
    setIsFormOpen(true);
  };

  const handleEditPackage = (pkg: SubscriptionPackage) => {
    setSelectedPackage(pkg);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedPackage(null);
  };

  const handleOpenDeleteDialog = (pkg: SubscriptionPackage) => {
    setPackageToDelete(pkg);
  };

  const handleCloseDeleteDialog = () => {
    setPackageToDelete(null);
  };

  const handleDeletePackage = async () => {
    if (!packageToDelete) return;
    
    setIsLoading(true);
    try {
      await deleteSubscriptionPackage(packageToDelete.id);
      
      // Update state
      setPackages(prev => prev.filter(p => p.id !== packageToDelete.id));
      
      toast({
        title: "Success",
        description: "Package deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting package:", error);
      
      // Handle permission error
      if (onPermissionError && error instanceof Error && 
          (error.message.includes("Permission denied") || 
           error.message.includes("Missing or insufficient permissions"))) {
        onPermissionError(error);
      } else {
        toast({
          title: "Error",
          description: "Failed to delete package. Please try again later.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
      setPackageToDelete(null);
    }
  };

  const handleSavePackage = async (packageData: SubscriptionPackage) => {
    setIsLoading(true);
    try {
      console.log("Attempting to save package:", packageData);
      
      // Validate required fields
      if (!packageData.title || packageData.title.trim() === '') {
        throw new Error("Package title is required");
      }
      
      await saveSubscriptionPackage(packageData);
      
      // Update local state
      setPackages(prev => {
        const existingIndex = prev.findIndex(p => p.id === packageData.id);
        if (existingIndex >= 0) {
          // Update existing package
          const updated = [...prev];
          updated[existingIndex] = packageData;
          return updated;
        } else {
          // Add new package
          return [...prev, packageData];
        }
      });
      
      toast({
        title: "Success",
        description: `Package ${selectedPackage ? 'updated' : 'created'} successfully`,
      });
      
      setIsFormOpen(false);
      setSelectedPackage(null);
    } catch (error) {
      console.error("Error saving package:", error);
      
      // Handle permission error
      if (onPermissionError && error instanceof Error && 
          (error.message.includes("Permission denied") || 
           error.message.includes("Missing or insufficient permissions"))) {
        onPermissionError(error);
      } else {
        let errorMessage = "Failed to save package. Please try again later.";
        
        if (error instanceof Error) {
          errorMessage = error.message || errorMessage;
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Subscription Packages</CardTitle>
          <CardDescription>
            Manage subscription packages for businesses and influencers
          </CardDescription>
        </div>
        <Button onClick={handleCreatePackage} disabled={isLoading}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Package
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4 w-full grid grid-cols-2">
            <TabsTrigger value="business">Business Packages</TabsTrigger>
            <TabsTrigger value="influencer">Influencer Packages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="business" className="w-full">
            {renderPackagesTable(filteredPackages, isLoading)}
          </TabsContent>
          
          <TabsContent value="influencer" className="w-full">
            {renderPackagesTable(filteredPackages, isLoading)}
          </TabsContent>
        </Tabs>
        
        {/* Package form dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPackage ? "Edit Package" : "Create New Package"}
              </DialogTitle>
              <DialogDescription>
                Fill in the details for the subscription package
              </DialogDescription>
            </DialogHeader>
            <SubscriptionPackageForm
              initialData={selectedPackage || {
                id: nanoid(),
                title: "",
                price: 0,
                setupFee: 0,
                durationMonths: 12,
                shortDescription: "",
                fullDescription: "",
                features: [],
                popular: false,
                type: activeTab === "business" ? "Business" : "Influencer",
                termsAndConditions: ""
              }}
              onSubmit={handleSavePackage}
              onCancel={handleCloseForm}
            />
          </DialogContent>
        </Dialog>
        
        {/* Delete confirmation dialog */}
        <AlertDialog open={!!packageToDelete} onOpenChange={open => !open && handleCloseDeleteDialog()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the package "{packageToDelete?.title}".
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeletePackage} 
                className="bg-destructive text-destructive-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );

  function renderPackagesTable(packages: SubscriptionPackage[], loading: boolean) {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (packages.length === 0) {
      return (
        <p className="text-center py-8 text-muted-foreground">
          No packages found. Click "Create Package" to add one.
        </p>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Price (₹)</TableHead>
            <TableHead>Setup Fee (₹)</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map((pkg) => (
            <TableRow key={pkg.id}>
              <TableCell className="font-medium">{pkg.title}</TableCell>
              <TableCell>{pkg.price}</TableCell>
              <TableCell>{pkg.setupFee}</TableCell>
              <TableCell>{pkg.durationMonths} months</TableCell>
              <TableCell>
                {pkg.popular ? (
                  <Badge>Popular</Badge>
                ) : (
                  <Badge variant="outline">Standard</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPackage(pkg)}
                    disabled={isLoading}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleOpenDeleteDialog(pkg)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
};

export default SubscriptionPackageManagement;
