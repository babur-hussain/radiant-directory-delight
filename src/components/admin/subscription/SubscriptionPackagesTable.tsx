
import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { formatPrice } from '@/data/subscriptionData';

interface SubscriptionPackagesTableProps {
  packages: any[];
  onEdit: (pkg: any) => void;
  onDelete: (id: string) => void;
}

const SubscriptionPackagesTable: React.FC<SubscriptionPackagesTableProps> = ({ packages, onEdit, onDelete }) => {
  if (!packages || packages.length === 0) {
    return <div className="text-center p-4">No subscription packages found</div>;
  }

  return (
    <Table>
      <TableCaption>List of subscription packages</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Popular</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {packages.map((pkg) => (
          <TableRow key={pkg.id}>
            <TableCell className="font-medium">{pkg.title}</TableCell>
            <TableCell>{pkg.type}</TableCell>
            <TableCell>{formatPrice(pkg.price)}</TableCell>
            <TableCell>{pkg.paymentType || 'recurring'}</TableCell>
            <TableCell>{pkg.popular ? 'Yes' : 'No'}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(pkg)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(pkg.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SubscriptionPackagesTable;
