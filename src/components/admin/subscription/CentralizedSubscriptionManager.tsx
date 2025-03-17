
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionPackage, convertToSubscriptionPackage } from "@/data/subscriptionData";
import { fetchSubscriptionPackages, fetchSubscriptionPackagesByType } from "@/lib/mongodb-utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AdvancedSubscriptionControls from "./AdvancedSubscriptionControls";
import { useAuth } from "@/hooks/useAuth";
import SubscriptionPackageForm from "./SubscriptionPackageForm";

export const CentralizedSubscriptionManager = () => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [businessPkgs, setBusinessPkgs] = useState<SubscriptionPackage[]>([]);
  const [influencerPkgs, setInfluencerPkgs] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("business");
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<SubscriptionPackage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Default global subscription settings
  const [globalAdvancePaymentMonths, setGlobalAdvancePaymentMonths] = useState(6);
  const [globalSignupFee, setGlobalSignupFee] = useState(0);
  const [globalIsPausable, setGlobalIsPausable] = useState(false);
  
  const advancePaymentOptions = [
    { months: 0, label: "No advance payment" },
    { months: 1, label: "1 month" },
    { months: 3, label: "3 months" },
    { months: 6, label: "6 months (recommended)" },
    { months: 12, label: "12 months" }
  ];
  
  // Fetch packages on component mount
  useEffect(() => {
    loadPackages();
  }, []);
  
  const loadPackages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch packages from MongoDB
      const allPackages = await fetchSubscriptionPackages();
      
      if (allPackages && allPackages.length > 0) {
        // Convert ISubscriptionPackage to SubscriptionPackage
        const convertedPackages = allPackages.map(pkg => convertToSubscriptionPackage(pkg));
        setPackages(convertedPackages);
        
        // Split packages by type
        const business = convertedPackages.filter(pkg => pkg.type === "Business");
        const influencer = convertedPackages.filter(pkg => pkg.type === "Influencer");
        
        setBusinessPkgs(business);
        setInfluencerPkgs(influencer);
      } else {
        // If no packages found
        setBusinessPkgs([]);
        setInfluencerPkgs([]);
        setPackages([]);
        
        toast({
          title: "No Packages Found",
          description: "No subscription packages found in the database.",
        });
      }
    } catch (err) {
      console.error("Error loading packages:", err);
      setError("Failed to load subscription packages.");
      
      // Set empty arrays as fallback
      setBusinessPkgs([]);
      setInfluencerPkgs([]);
      setPackages([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreatePackage = () => {
    setCurrentPackage(null);
    setShowPackageForm(true);
  };
  
  const handleEditPackage = (pkg: SubscriptionPackage) => {
    setCurrentPackage(pkg);
    setShowPackageForm(true);
  };
  
  const handleSavePackage = (packageData: SubscriptionPackage) => {
    // Here you would save the package to Firebase
    // For now, we'll just update the local state
    
    if (currentPackage) {
      // Update existing package
      const updatedPackages = packages.map(pkg => 
        pkg.id === packageData.id ? packageData : pkg
      );
      setPackages(updatedPackages);
      
      // Update the specific type arrays
      if (packageData.type === "Business") {
        setBusinessPkgs(businessPkgs.map(pkg => 
          pkg.id === packageData.id ? packageData : pkg
        ));
      } else {
        setInfluencerPkgs(influencerPkgs.map(pkg => 
          pkg.id === packageData.id ? packageData : pkg
        ));
      }
      
      toast({
        title: "Package Updated",
        description: `${packageData.title} has been updated successfully.`,
      });
    } else {
      // Add new package
      setPackages([...packages, packageData]);
      
      // Add to the specific type array
      if (packageData.type === "Business") {
        setBusinessPkgs([...businessPkgs, packageData]);
      } else {
        setInfluencerPkgs([...influencerPkgs, packageData]);
      }
      
      toast({
        title: "Package Created",
        description: `${packageData.title} has been created successfully.`,
      });
    }
    
    setShowPackageForm(false);
  };
  
  const handleSaveGlobalSettings = () => {
    // Here you would save the global settings to your database
    toast({
      title: "Global Settings Saved",
      description: `Global subscription settings have been updated successfully.`,
    });
  };
  
  const displayedPackages = activeTab === "business" ? businessPkgs : influencerPkgs;
  
  if (!user?.isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to access the subscription management section.
          Only administrators can manage subscription packages.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Subscription Management</CardTitle>
        <CardDescription>
          Configure and manage all subscription packages and global settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="packages" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="packages">Subscription Packages</TabsTrigger>
            <TabsTrigger value="settings">Global Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="packages" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList>
                  <TabsTrigger value="business">Business Packages</TabsTrigger>
                  <TabsTrigger value="influencer">Influencer Packages</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button onClick={handleCreatePackage}>
                <Plus className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package Name</TableHead>
                    <TableHead>Price (₹)</TableHead>
                    <TableHead>Setup Fee (₹)</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                          <span className="ml-2">Loading packages...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : displayedPackages.length > 0 ? (
                    displayedPackages.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell>
                          <div className="font-medium">{pkg.title}</div>
                          <div className="text-sm text-muted-foreground">{pkg.shortDescription}</div>
                        </TableCell>
                        <TableCell>₹{pkg.price}</TableCell>
                        <TableCell>₹{pkg.setupFee}</TableCell>
                        <TableCell>{pkg.durationMonths} months</TableCell>
                        <TableCell>
                          {pkg.popular ? (
                            <Badge>Popular</Badge>
                          ) : (
                            <Badge variant="outline">Standard</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEditPackage(pkg)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No packages found. Add your first package.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Global Subscription Settings</CardTitle>
                <CardDescription>
                  These settings will apply to all new subscription assignments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <AdvancedSubscriptionControls
                  advancePaymentMonths={globalAdvancePaymentMonths}
                  setAdvancePaymentMonths={setGlobalAdvancePaymentMonths}
                  signupFee={globalSignupFee}
                  setSignupFee={setGlobalSignupFee}
                  isPausable={globalIsPausable}
                  setIsPausable={setGlobalIsPausable}
                  advancePaymentOptions={advancePaymentOptions}
                  isDisabled={false}
                />
                
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Default Subscription Behavior</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Badge variant="outline" className="mr-2 mt-0.5">Default</Badge>
                      <span>
                        Subscriptions will start after the advance payment period ({globalAdvancePaymentMonths} months)
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Badge variant="outline" className="mr-2 mt-0.5">Default</Badge>
                      <span>
                        Users cannot cancel or modify their subscriptions
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Badge variant="outline" className="mr-2 mt-0.5">Default</Badge>
                      <span>
                        Only admins can assign or manage subscriptions
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Badge variant="outline" className="mr-2 mt-0.5">Default</Badge>
                      <span>
                        Initial signup fee: ₹{globalSignupFee}
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveGlobalSettings}>
                    Save Global Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Dialog open={showPackageForm} onOpenChange={setShowPackageForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{currentPackage ? "Edit Package" : "Create New Package"}</DialogTitle>
              <DialogDescription>
                Configure the subscription package details below.
              </DialogDescription>
            </DialogHeader>
            <SubscriptionPackageForm
              initialData={currentPackage || undefined}
              onSubmit={handleSavePackage}
              onCancel={() => setShowPackageForm(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CentralizedSubscriptionManager;
