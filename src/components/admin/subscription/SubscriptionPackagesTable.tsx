
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { Edit, Trash2, Check, X, Star } from 'lucide-react';

interface SubscriptionPackagesTableProps {
  packages: ISubscriptionPackage[];
  onEdit: (pkg: ISubscriptionPackage) => void;
  onDelete: (id: string) => void;
}

const SubscriptionPackagesTable: React.FC<SubscriptionPackagesTableProps> = ({
  packages,
  onEdit,
  onDelete,
}) => {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Package</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Pricing</TableHead>
            <TableHead>Features</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                No subscription packages found
              </TableCell>
            </TableRow>
          ) : (
            packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    {pkg.popular && <Star className="h-4 w-4 text-yellow-500" />}
                    <span>{pkg.title}</span>
                  </div>
                  {pkg.shortDescription && (
                    <span className="text-xs text-muted-foreground block mt-1">
                      {pkg.shortDescription}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={pkg.type === 'Business' ? 'default' : 'secondary'}>
                    {pkg.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={pkg.paymentType === 'recurring' ? 'outline' : 'default'} className="mb-1">
                    {pkg.paymentType === 'recurring' ? 'Recurring' : 'One-time'}
                  </Badge>
                  
                  {pkg.paymentType === 'recurring' && pkg.billingCycle && (
                    <div className="text-xs text-muted-foreground">
                      {pkg.billingCycle.charAt(0).toUpperCase() + pkg.billingCycle.slice(1)} billing
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {formatCurrency(pkg.price)}
                    {pkg.paymentType === 'recurring' && pkg.billingCycle === 'yearly' && (
                      <span className="text-xs ml-1">/year</span>
                    )}
                  </div>
                  
                  {pkg.paymentType === 'recurring' && (
                    <div className="text-xs space-y-1 mt-1">
                      {pkg.monthlyPrice > 0 && pkg.billingCycle === 'monthly' && (
                        <div>{formatCurrency(pkg.monthlyPrice)}/month</div>
                      )}
                      {pkg.setupFee > 0 && (
                        <div className="text-muted-foreground">
                          Setup: {formatCurrency(pkg.setupFee)}
                        </div>
                      )}
                      {pkg.advancePaymentMonths > 0 && (
                        <div className="text-muted-foreground">
                          Advance: {pkg.advancePaymentMonths} months
                        </div>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {pkg.features?.length || 0} features
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(pkg)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(pkg.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubscriptionPackagesTable;
