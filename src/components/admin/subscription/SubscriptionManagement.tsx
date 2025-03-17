
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
import { PlusCircle, Pencil, Trash2, Loader2, RefreshCw } from "lucide-react";
import { nanoid } from "nanoid";
import { ISubscriptionPackage } from "@/models/SubscriptionPackage"; 
import { fetchSubscriptionPackages, saveSubscriptionPackage, deleteSubscriptionPackage } from "@/lib/mongodb-utils";
import SubscriptionPackageForm from "./SubscriptionPackageForm";
import { useToast } from "@/hooks/use-toast";
import AdminPermissionError from "../dashboard/AdminPermissionError";
import BusinessTableLoading from "../table/BusinessTableLoading";
import SubscriptionError from "./SubscriptionError";

interface SubscriptionPackageManagementProps {
  onPermissionError?: (error: any) => void;
  dbInitialized?: boolean;
}

export const SubscriptionPackageManagement: React.FC<SubscriptionPackageManagementProps> = ({ 
  onPermissionError,
  dbInitialized = false
}) => {
  const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<ISubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ISubscriptionPackage | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<ISubscriptionPackage | null>(null);
  const [activeTab, setActiveTab] = useState("business");
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (dbInitialized) {
      loadPackages();
    } else {
      // If MongoDB not initialized, still try to load packages after a delay
      const timer = setTimeout(() => {
        loadPackages();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [dbInitialized]);

  useEffect(() => {
    if (packages && packages.length > 0) {
      const filtered = packages.filter(pkg => 
        pkg.type && pkg.type.toLowerCase() === activeTab
      );
      setFilteredPackages(filtered);
    } else {
      setFilteredPackages([]);
    }
  }, [packages, activeTab]);

  const loadPackages = async () => {
    setIsLoading(true);
    setPermissionError(null);
    try {
      console.log("Fetching subscription packages from MongoDB...");
      const data = await fetchSubscriptionPackages();
      console.log("Fetched subscription packages from MongoDB:", data);
      
      if (data && Array.isArray(data) && data.length > 0) {
        // Ensure all packages have required fields
        const validatedPackages = data.map(pkg => ({
          id: pkg.id || nanoid(),
          title: pkg.title || "Untitled Package",
          price: Number(pkg.price) || 0,
          monthlyPrice: Number(pkg.monthlyPrice) || 0,
          setupFee: Number(pkg.setupFee) || 0,
          durationMonths: Number(pkg.durationMonths) || 12,
          type: pkg.type || "Business",
          shortDescription: pkg.shortDescription || "",
          fullDescription: pkg.fullDescription || "",
          features: Array.isArray(pkg.features) ? pkg.features : [],
          popular: !!pkg.popular,
          termsAndConditions: pkg.termsAndConditions || "",
          paymentType: pkg.paymentType || "recurring"
        }));
        
        setPackages(validatedPackages);
        
        const filtered = validatedPackages.filter(pkg => 
          pkg.type && pkg.type.toLowerCase() === activeTab
        );
        
        setFilteredPackages(filtered);
        console.log(`Loaded ${validatedPackages.length} subscription packages, filtered to ${filtered.length} ${activeTab} packages`);
      } else {
        console.warn("No subscription packages found in MongoDB");
        // Set default empty arrays
        setPackages([]);
        setFilteredPackages([]);
        
        toast({
          title: "No Packages Found",
          description: "No subscription packages found in the database. Try creating one.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error loading packages:", error);
      
      if (error instanceof Error) {
        const errorMessage = "Error loading subscription packages: " + error.message;
        setPermissionError(errorMessage);
        if (onPermissionError) {
          onPermissionError(error);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load subscription packages. Please try again later.",
          variant: "destructive"
        });
      }
      
      // Set empty arrays to prevent undefined errors
      setPackages([]);
      setFilteredPackages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePackage = () => {
    setSelectedPackage(null);
    setIsFormOpen(true);
  };

  const handleEditPackage = (pkg: ISubscriptionPackage) => {
    console.log("Editing package:", pkg);
    // Make a deep copy to avoid reference issues
    const packageCopy = JSON.parse(JSON.stringify(pkg));
    setSelectedPackage(packageCopy);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    console.log("Closing form");
    setIsFormOpen(false);
    setTimeout(() => {
      setSelectedPackage(null);
    }, 100);
  };

  const handleOpenDeleteDialog = (pkg: ISubscriptionPackage) => {
    setPackageToDelete(pkg);
  };

  const handleCloseDeleteDialog = () => {
    setPackageToDelete(null);
  };

  const handleDeletePackage = async () => {
    if (!packageToDelete) return;
    
    setIsLoading(true);
    setPermissionError(null);
    try {
      await deleteSubscriptionPackage(packageToDelete.id);
      
      setPackages(prev => prev.filter(p => p.id !== packageToDelete.id));
      
      toast({
        title: "Success",
        description: "Package deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting package:", error);
      
      const errorMessage = "Error deleting subscription package: " + 
        (error instanceof Error ? error.message : String(error));
      setPermissionError(errorMessage);
      if (onPermissionError) {
        onPermissionError(error);
      }
      
      toast({
        title: "Error",
        description: "Failed to delete package. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setPackageToDelete(null);
    }
  };

  const handleSavePackage = async (packageData: ISubscriptionPackage) => {
    setIsSaving(true);
    setPermissionError(null);
    try {
      console.log("Saving package data to MongoDB:", packageData);
      
      if (!packageData.title || packageData.title.trim() === '') {
        throw new Error("Package title is required");
      }
      
      const validatedPackageData: ISubscriptionPackage = {
        ...packageData,
        id: packageData.id || nanoid(),
        price: Number(packageData.price) || 0,
        monthlyPrice: Number(packageData.monthlyPrice || 0),
        setupFee: Number(packageData.setupFee || 0),
        durationMonths: Number(packageData.durationMonths || 12),
        advancePaymentMonths: Number(packageData.advancePaymentMonths || 0),
        termsAndConditions: packageData.termsAndConditions || '',
        features: Array.isArray(packageData.features) ? packageData.features : [],
      };
      
      if (!validatedPackageData.paymentType) {
        validatedPackageData.paymentType = "recurring";
      }
      
      await saveSubscriptionPackage(validatedPackageData);
      console.log("Package saved successfully to MongoDB");
      
      setPackages(prev => {
        const existingIndex = prev.findIndex(p => p.id === validatedPackageData.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = validatedPackageData;
          return updated;
        } else {
          return [...prev, validatedPackageData];
        }
      });
      
      toast({
        title: "Success",
        description: `Package ${selectedPackage ? 'updated' : 'created'} successfully`,
      });
      
      setIsFormOpen(false);
      setTimeout(() => {
        setSelectedPackage(null);
      }, 100);
      
      setTimeout(() => {
        loadPackages();
      }, 1000);
    } catch (error) {
      console.error("Error saving package:", error);
      
      const errorMessage = "Error saving subscription package: " + 
        (error instanceof Error ? error.message : String(error));
      setPermissionError(errorMessage);
      if (onPermissionError) {
        onPermissionError(error);
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    loadPackages();
    toast({
      title: "Refreshing",
      description: "Refreshing subscription package data",
    });
  };

  const dismissError = () => {
    setPermissionError(null);
  };

  if (isLoading) {
    return <BusinessTableLoading />;
  }

  // Early return if there's a permission error
  if (permissionError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Packages</CardTitle>
          <CardDescription>
            Manage subscription packages for businesses and influencers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionError 
            error={permissionError}
            onRetry={() => {
              dismissError();
              loadPackages();
            }}
          />
          <Button onClick={handleCreatePackage} className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Package
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Subscription Packages</CardTitle>
          <CardDescription>
            Manage subscription packages for businesses and influencers
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isLoading || isSaving}
            title="Refresh package data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleCreatePackage} disabled={isLoading || isSaving}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Package
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {permissionError && (
          <AdminPermissionError 
            permissionError={permissionError} 
            dismissError={dismissError} 
          />
        )}
        
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
        
        {/* Dialog for editing/creating packages */}
        <Dialog 
          open={isFormOpen} 
          onOpenChange={(open) => {
            if (!open) {
              handleCloseForm();
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPackage ? "Edit Package" : "Create New Package"}
              </DialogTitle>
              <DialogDescription>
                Fill in the details for the subscription package
              </DialogDescription>
            </DialogHeader>
            {isFormOpen && (
              <SubscriptionPackageForm
                initialData={selectedPackage || {
                  id: nanoid(),
                  title: "",
                  price: 0,
                  monthlyPrice: 0,
                  setupFee: 0,
                  durationMonths: 12,
                  shortDescription: "",
                  fullDescription: "",
                  features: [],
                  popular: false,
                  type: activeTab === "business" ? "Business" : "Influencer",
                  termsAndConditions: "",
                  paymentType: "recurring"
                }}
                onSubmit={handleSavePackage}
                onCancel={handleCloseForm}
                isSaving={isSaving}
              />
            )}
          </DialogContent>
        </Dialog>
        
        {/* Alert Dialog for confirming package deletion */}
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

  function renderPackagesTable(packages: ISubscriptionPackage[], loading: boolean) {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (!packages || packages.length === 0) {
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
            <TableHead>Type</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map((pkg) => (
            <TableRow key={pkg.id}>
              <TableCell className="font-medium">{pkg.title}</TableCell>
              <TableCell>₹{pkg.price}</TableCell>
              <TableCell>₹{pkg.setupFee || 0}</TableCell>
              <TableCell>
                <Badge variant="outline">{pkg.paymentType === "one-time" ? "One-time" : "Recurring"}</Badge>
              </TableCell>
              <TableCell>{pkg.durationMonths ? `${pkg.durationMonths} months` : 'N/A'}</TableCell>
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
                    disabled={isLoading || isSaving}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleOpenDeleteDialog(pkg)}
                    disabled={isLoading || isSaving}
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
