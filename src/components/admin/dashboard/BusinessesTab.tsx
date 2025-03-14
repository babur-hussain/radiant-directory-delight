
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { TableBusinessListings } from "@/components/admin/TableBusinessListings";
import BusinessFormDialog from "@/components/admin/BusinessFormDialog";
import CSVUploadDialog from "@/components/admin/CSVUploadDialog";
import { BusinessFormValues } from "@/components/admin/BusinessForm";
import { Business } from "@/lib/csv-utils";

interface BusinessesTabProps {
  businessCount: number;
  showBusinessFormDialog: boolean;
  setShowBusinessFormDialog: (show: boolean) => void;
  showUploadDialog: boolean;
  setShowUploadDialog: (show: boolean) => void;
  currentBusinessToEdit: Business | null;
  isSubmitting: boolean;
  handleBusinessFormSubmit: (values: BusinessFormValues) => Promise<void>;
  handleUploadComplete: (success: boolean, message: string, count?: number) => void;
  handleAddBusiness: () => void;
  handleEditBusiness: (business: Business) => void;
}

const BusinessesTab = ({
  businessCount,
  showBusinessFormDialog,
  setShowBusinessFormDialog,
  showUploadDialog,
  setShowUploadDialog,
  currentBusinessToEdit,
  isSubmitting,
  handleBusinessFormSubmit,
  handleUploadComplete,
  handleAddBusiness,
  handleEditBusiness
}: BusinessesTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Business Listings</CardTitle>
        <CardDescription>
          View and manage all business listings. Total: {businessCount} businesses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TableBusinessListings 
          onAddBusiness={handleAddBusiness}
          onEditBusiness={handleEditBusiness}
        />
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={() => setShowBusinessFormDialog(true)}
          type="button"
        >
          Add Business
        </Button>
        <Button 
          onClick={() => setShowUploadDialog(true)}
          type="button"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload CSV
        </Button>
      </CardFooter>
      
      <BusinessFormDialog 
        showDialog={showBusinessFormDialog}
        setShowDialog={setShowBusinessFormDialog}
        currentBusinessToEdit={currentBusinessToEdit}
        onSubmit={handleBusinessFormSubmit}
        isSubmitting={isSubmitting}
      />
      
      <CSVUploadDialog 
        showUploadDialog={showUploadDialog}
        setShowUploadDialog={setShowUploadDialog}
        handleUploadComplete={handleUploadComplete}
      />
    </Card>
  );
};

export default BusinessesTab;
