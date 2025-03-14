
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Business } from "@/lib/csv-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BusinessDetailsDialogProps {
  business: Business;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BusinessDetailsDialog: React.FC<BusinessDetailsDialogProps> = ({
  business,
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{business.name}</DialogTitle>
          <DialogDescription>
            Detailed information about this business
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Email:</span> {business.email || "N/A"}</p>
                <p><span className="font-medium">Phone:</span> {business.phone || "N/A"}</p>
                <p><span className="font-medium">Website:</span> {business.website || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Business Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Category:</span> {business.category || "N/A"}</p>
                <p><span className="font-medium">Status:</span> {
                  business.status ? (
                    <Badge className="ml-2 bg-green-500">{business.status}</Badge>
                  ) : (
                    <Badge className="ml-2" variant="outline">Not Set</Badge>
                  )
                }</p>
                <p><span className="font-medium">ID:</span> {business.id || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Address</h3>
              <p>
                {[
                  business.address,
                  business.city,
                  business.state,
                  business.zipCode,
                  business.country
                ].filter(Boolean).join(", ") || "No address provided"}
              </p>
            </CardContent>
          </Card>

          {business.description && (
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p>{business.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessDetailsDialog;
