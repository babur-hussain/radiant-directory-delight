
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { User, UserRole, UserSubscription, getPrimaryRole } from '@/types/auth';
import { fetchSubscriptionPackagesByType, saveSubscription } from '@/api/mongoAPI';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface UserSubscriptionAssignmentSimpleProps {
  user: User;
  onAssigned?: () => void;
}

interface SubscriptionPackage {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  type: string;
}

const UserSubscriptionAssignmentSimple: React.FC<UserSubscriptionAssignmentSimpleProps> = ({ user, onAssigned }) => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [assigning, setAssigning] = useState<boolean>(false);
  const { toast } = useToast();

  // Determine package type based on user role
  const getPackageType = (role: UserRole | UserRole[] | undefined): string => {
    const primaryRole = getPrimaryRole(role);
    
    if (primaryRole === 'Business') return 'business';
    if (primaryRole === 'Influencer') return 'influencer';
    if (primaryRole === 'Admin' || user.isAdmin) return 'admin';
    return 'user';
  };

  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoading(true);
        const packageType = getPackageType(user.role);
        const data = await fetchSubscriptionPackagesByType(packageType);
        setPackages(data);
        
        // Set default selected package if available
        if (data.length > 0) {
          setSelectedPackage(data[0]._id);
        }
      } catch (error) {
        console.error('Error loading subscription packages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load subscription packages',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, [user.role, toast]);

  const handleAssignSubscription = async () => {
    if (!selectedPackage) {
      toast({
        title: 'Error',
        description: 'Please select a subscription package',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAssigning(true);
      
      // Find the selected package details
      const packageDetails = packages.find(pkg => pkg._id === selectedPackage);
      
      // Create subscription data
      const subscriptionData: UserSubscription = {
        userId: user.uid,
        packageId: selectedPackage,
        startDate: new Date(),
        // Calculate end date based on package duration (in days)
        endDate: new Date(Date.now() + (packageDetails?.duration || 30) * 24 * 60 * 60 * 1000),
        status: 'active',
        paymentStatus: 'paid',
        packageDetails: packageDetails,
        id: `sub_${Date.now()}`,
        packageName: packageDetails?.name || 'Unknown Package',
        amount: packageDetails?.price || 0,
        paymentType: 'recurring'
      };
      
      // Save subscription
      await saveSubscription(subscriptionData);
      
      toast({
        title: 'Success',
        description: `Subscription assigned to ${user.displayName || user.email}`,
      });
      
      // Call onAssigned callback if provided
      if (onAssigned) {
        onAssigned();
      }
    } catch (error) {
      console.error('Error assigning subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign subscription',
        variant: 'destructive',
      });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Assign Subscription</CardTitle>
        <CardDescription>
          Assign a subscription package to {user.displayName || user.email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading packages...</span>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No subscription packages available for {user.role} users.
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Package</label>
                <Select
                  value={selectedPackage}
                  onValueChange={setSelectedPackage}
                  disabled={assigning}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg._id} value={pkg._id}>
                        {pkg.name} - ${pkg.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPackage && (
                <div className="space-y-2 mt-4">
                  <Separator />
                  <div className="pt-2">
                    <h4 className="font-medium">Package Details</h4>
                    {packages
                      .filter((pkg) => pkg._id === selectedPackage)
                      .map((pkg) => (
                        <div key={pkg._id} className="mt-2 space-y-2">
                          <p className="text-sm">{pkg.description}</p>
                          <div className="text-sm">
                            <span className="font-medium">Price:</span> ${pkg.price}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Duration:</span> {pkg.duration} days
                          </div>
                          {pkg.features && pkg.features.length > 0 && (
                            <div className="text-sm">
                              <span className="font-medium">Features:</span>
                              <ul className="list-disc list-inside mt-1">
                                {pkg.features.map((feature, index) => (
                                  <li key={index}>{feature}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleAssignSubscription}
          disabled={loading || assigning || !selectedPackage || packages.length === 0}
          className="w-full"
        >
          {assigning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Assigning...
            </>
          ) : (
            'Assign Subscription'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserSubscriptionAssignmentSimple;
