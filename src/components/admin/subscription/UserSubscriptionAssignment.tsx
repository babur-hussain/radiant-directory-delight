import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, XCircle, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
// Fix import to use default import
import useSubscriptionAssignment from "@/hooks/useSubscriptionAssignment";
import { UserSubscription } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

interface UserSubscriptionAssignmentProps {
  userId: string;
  userName?: string;
}

const UserSubscriptionAssignment: React.FC<UserSubscriptionAssignmentProps> = ({ userId, userName }) => {
  const {
    selectedPackage,
    setSelectedPackage,
    userCurrentSubscription,
    setUserCurrentSubscription,
    isSubmitting,
    isLoading,
    error,
    handleAssignPackage,
    handleCancelSubscription,
    isCancelSubmitting
  } = useSubscriptionAssignment({ userId });
  
  const [subscriptionPackages, setSubscriptionPackages] = useState<any[]>([]);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubscriptionPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_packages')
          .select('*');

        if (error) {
          throw error;
        }

        setSubscriptionPackages(data || []);
      } catch (err) {
        console.error("Error fetching subscription packages:", err);
        toast({
          title: "Error Fetching Packages",
          description: "Failed to load subscription packages. Please try again.",
          variant: "destructive"
        });
      }
    };

    fetchSubscriptionPackages();
  }, []);

  const handlePackageSelect = (packageId: string) => {
    const selected = subscriptionPackages.find(pkg => pkg.id === packageId);
    if (selected) {
      setSelectedPackage({
        id: selected.id,
        title: selected.title,
        price: selected.amount
      });
    }
  };

  const handleAssign = async () => {
    const success = await handleAssignPackage(userId);
    if (success) {
      toast({
        title: "Subscription Assigned",
        description: "The subscription has been successfully assigned.",
      });
    }
  };

  const handleCancel = async () => {
    const success = await handleCancelSubscription(userId, cancelReason);
    if (success) {
      toast({
        title: "Subscription Cancelled",
        description: "The subscription has been successfully cancelled.",
      });
      setIsCancelDialogOpen(false);
      setCancelReason('');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Subscription Assignment</CardTitle>
        <CardDescription>Assign or manage subscriptions for user: {userName || userId}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {isLoading ? (
          <Alert>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <AlertDescription>Loading subscription data...</AlertDescription>
          </Alert>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="mr-2 h-4 w-4" />
            <AlertDescription>Error: {error}</AlertDescription>
          </Alert>
        ) : (
          <>
            {userCurrentSubscription ? (
              <>
                <Alert>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <AlertDescription>
                    Current Subscription: <Badge variant="secondary">{userCurrentSubscription.packageName}</Badge>
                    <br />
                    Status: <Badge variant="outline">{userCurrentSubscription.status}</Badge>
                    <br />
                    Start Date: {formatDate(userCurrentSubscription.startDate)}
                    <br />
                    End Date: {formatDate(userCurrentSubscription.endDate)}
                    <br />
                    Price: {formatCurrency(userCurrentSubscription.price)}
                  </AlertDescription>
                </Alert>
                <Separator />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="destructive" onClick={() => setIsCancelDialogOpen(true)} disabled={isCancelSubmitting}>
                        {isCancelSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Subscription
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cancel the user's current subscription.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <Alert>
                <AlertDescription>No active subscription found for this user.</AlertDescription>
              </Alert>
            )}
            <Separator />
            <div>
              <Label htmlFor="package">Select Subscription Package</Label>
              <Select onValueChange={handlePackageSelect}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionPackages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>{pkg.title} - {formatCurrency(pkg.amount)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleAssign} disabled={!selectedPackage || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Assigning...
            </>
          ) : (
            "Assign Package"
          )}
        </Button>
      </CardFooter>
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Input id="reason" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsCancelDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleCancel} disabled={isCancelSubmitting}>
              {isCancelSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserSubscriptionAssignment;
