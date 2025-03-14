
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { Business } from "@/lib/csv-utils";
import BusinessDetailsDialog from "../table/BusinessDetailsDialog";

interface AdminInfluencerDashboardsProps {
  influencers: Business[];
  onEdit?: (influencer: Business) => void;
}

const AdminInfluencerDashboards: React.FC<AdminInfluencerDashboardsProps> = ({
  influencers,
  onEdit
}) => {
  const [selectedInfluencer, setSelectedInfluencer] = useState<Business | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Handle viewing influencer details
  const handleViewDetails = (influencer: Business) => {
    setSelectedInfluencer(influencer);
    setShowDetailsDialog(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Influencer Dashboards</CardTitle>
        </CardHeader>
        <CardContent>
          {influencers.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No influencers found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {influencers.map((influencer) => (
                  <TableRow key={influencer.id || influencer.email}>
                    <TableCell className="font-medium">{influencer.name}</TableCell>
                    <TableCell>{influencer.email}</TableCell>
                    <TableCell>{influencer.category}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(influencer)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(influencer)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedInfluencer && (
        <BusinessDetailsDialog
          business={selectedInfluencer}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
        />
      )}
    </>
  );
};

export default AdminInfluencerDashboards;
