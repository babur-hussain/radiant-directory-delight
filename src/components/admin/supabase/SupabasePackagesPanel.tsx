import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, Edit, Trash2, Check, X, CopyPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { featuresToString, stringToFeatures } from '@/lib/subscription-utils';
import { generateId } from '@/utils/id-generator';
import { supabase } from '@/integrations/supabase/client';

const SupabasePackagesPanel = () => {
  const { packages, isLoading, error, refetch } = useSubscriptionPackages();
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ISubscriptionPackage | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<ISubscriptionPackage | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const { toast } = useToast();
  
  const handleCreatePackage = () => {
    const newPackage: ISubscriptionPackage = {
      id: generateId(8),
      title: '',
      price: 0,
      features: [],
      type: 'Business',
      paymentType: 'recurring'
    };
    setEditingPackage(newPackage);
    setIsCreating(true);
  };
  
  const handleClonePackage = (pkg: ISubscriptionPackage) => {
    const clonedPackage: ISubscriptionPackage = {
      ...pkg,
      id: generateId(8),
      title: `${pkg.title} (Copy)`,
    };
    setEditingPackage(clonedPackage);
    setIsCloning(true);
  };
  
  const handleEditPackage = (pkg: ISubscriptionPackage) => {
    setEditingPackage({...pkg});
    setIsEditing(true);
  };
  
  const handleDeletePackage = (pkg: ISubscriptionPackage) => {
    setPackageToDelete(pkg);
    setConfirmDelete(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!packageToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('subscription_packages')
        .delete()
        .eq('id', packageToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: "Package Deleted",
        description: `${packageToDelete.title} has been deleted.`,
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
      setPackageToDelete(null);
    }
  };
  
  const handleCloseDialog = () => {
    setIsEditing(false);
    setIsCreating(false);
    setIsCloning(false);
    setEditingPackage(null);
  };
  
  const handleSavePackage = async () => {
    if (!editingPackage) return;
    
    try {
      const featuresString = Array.isArray(editingPackage.features) 
        ? JSON.stringify(editingPackage.features) 
        : editingPackage.features;
      
      if (isCreating || isCloning) {
        const { error } = await supabase
          .from('subscription_packages')
          .insert({
            id: editingPackage.id,
            title: editingPackage.title,
            short_description: editingPackage.shortDescription,
            full_description: editingPackage.fullDescription,
            price: editingPackage.price,
            monthly_price: editingPackage.monthlyPrice,
            features: featuresString,
            popular: editingPackage.popular,
            type: editingPackage.type,
            payment_type: editingPackage.paymentType,
            billing_cycle: editingPackage.billingCycle,
            duration_months: editingPackage.durationMonths,
            setup_fee: editingPackage.setupFee,
            advance_payment_months: editingPackage.advancePaymentMonths,
            terms_and_conditions: editingPackage.termsAndConditions,
            dashboard_sections: editingPackage.dashboardSections
          });
        
        if (error) throw error;
        
        toast({
          title: isCloning ? "Package Cloned" : "Package Created",
          description: `${editingPackage.title} has been ${isCloning ? 'cloned' : 'created'}.`,
        });
      } else {
        const { error } = await supabase
          .from('subscription_packages')
          .update({
            title: editingPackage.title,
            short_description: editingPackage.shortDescription,
            full_description: editingPackage.fullDescription,
            price: editingPackage.price,
            monthly_price: editingPackage.monthlyPrice,
            features: featuresString,
            popular: editingPackage.popular,
            type: editingPackage.type,
            payment_type: editingPackage.paymentType,
            billing_cycle: editingPackage.billingCycle,
            duration_months: editingPackage.durationMonths,
            setup_fee: editingPackage.setupFee,
            advance_payment_months: editingPackage.advancePaymentMonths,
            terms_and_conditions: editingPackage.termsAndConditions,
            dashboard_sections: editingPackage.dashboardSections
          })
          .eq('id', editingPackage.id);
        
        if (error) throw error;
        
        toast({
          title: "Package Updated",
          description: `${editingPackage.title} has been updated.`,
        });
      }
      
      refetch();
      handleCloseDialog();
    } catch (error) {
      toast({
        title: "Save Failed",
        description: String(error),
        variant: "destructive"
      });
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subscription Packages</CardTitle>
            <CardDescription>
              Manage subscription plans for businesses and influencers
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleCreatePackage}>
              <Plus className="h-4 w-4 mr-2" />
              Add Package
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Popular</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
                      </div>
                      <div className="mt-2">Loading packages...</div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-red-500 h-24">
                      Error: {String(error)}
                    </TableCell>
                  </TableRow>
                ) : packages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      No packages found.
                    </TableCell>
                  </TableRow>
                ) : (
                  packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pkg.title}</div>
                          <div className="text-sm text-muted-foreground">{pkg.shortDescription}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={pkg.type === 'Business' ? 'default' : 'secondary'}>
                          {pkg.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        ${pkg.price}
                        {pkg.monthlyPrice && (
                          <div className="text-sm text-muted-foreground">
                            ${pkg.monthlyPrice}/mo
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {pkg.paymentType === 'recurring' ? 'Recurring' : 'One-time'}
                          {pkg.billingCycle && ` (${pkg.billingCycle})`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {pkg.features.length} features
                        </div>
                      </TableCell>
                      <TableCell>
                        {pkg.popular ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleClonePackage(pkg)}>
                            <CopyPlus className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleEditPackage(pkg)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeletePackage(pkg)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Package Edit/Create Sheet */}
      <Sheet 
        open={isEditing || isCreating || isCloning} 
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
      >
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? 'Edit' : isCloning ? 'Clone' : 'Create'} Package
            </SheetTitle>
            <SheetDescription>
              {isEditing 
                ? 'Update the subscription package details' 
                : isCloning 
                  ? 'Create a copy of this package with your customizations'
                  : 'Create a new subscription package'}
            </SheetDescription>
          </SheetHeader>
          
          {editingPackage && (
            <div className="py-4 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Package Title</Label>
                <Input 
                  id="title" 
                  value={editingPackage.title} 
                  onChange={(e) => setEditingPackage({...editingPackage, title: e.target.value})}
                  placeholder="e.g. Business Premium"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input 
                  id="shortDescription" 
                  value={editingPackage.shortDescription || ''} 
                  onChange={(e) => setEditingPackage({...editingPackage, shortDescription: e.target.value})}
                  placeholder="Brief package description"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullDescription">Full Description</Label>
                <Textarea 
                  id="fullDescription" 
                  value={editingPackage.fullDescription || ''} 
                  onChange={(e) => setEditingPackage({...editingPackage, fullDescription: e.target.value})}
                  placeholder="Detailed package description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    value={editingPackage.price} 
                    onChange={(e) => setEditingPackage({...editingPackage, price: Number(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
                  <Input 
                    id="monthlyPrice" 
                    type="number" 
                    value={editingPackage.monthlyPrice || ''} 
                    onChange={(e) => setEditingPackage({...editingPackage, monthlyPrice: e.target.value ? Number(e.target.value) : undefined})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Package Type</Label>
                  <Select 
                    value={editingPackage.type} 
                    onValueChange={(value) => setEditingPackage({...editingPackage, type: value as 'Business' | 'Influencer'})}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Influencer">Influencer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentType">Payment Type</Label>
                  <Select 
                    value={editingPackage.paymentType} 
                    onValueChange={(value) => setEditingPackage({...editingPackage, paymentType: value as 'recurring' | 'one-time'})}
                  >
                    <SelectTrigger id="paymentType">
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recurring">Recurring</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {editingPackage.paymentType === 'recurring' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billingCycle">Billing Cycle</Label>
                    <Select 
                      value={editingPackage.billingCycle || ''} 
                      onValueChange={(value) => setEditingPackage({
                        ...editingPackage, 
                        billingCycle: value as 'monthly' | 'yearly' | undefined
                      })}
                    >
                      <SelectTrigger id="billingCycle">
                        <SelectValue placeholder="Select billing cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="durationMonths">Duration (months)</Label>
                    <Input 
                      id="durationMonths" 
                      type="number" 
                      value={editingPackage.durationMonths || 12} 
                      onChange={(e) => setEditingPackage({
                        ...editingPackage, 
                        durationMonths: Number(e.target.value)
                      })}
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="setupFee">Setup Fee ($)</Label>
                  <Input 
                    id="setupFee" 
                    type="number" 
                    value={editingPackage.setupFee || 0} 
                    onChange={(e) => setEditingPackage({
                      ...editingPackage, 
                      setupFee: Number(e.target.value)
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="advancePaymentMonths">Advance Payment (months)</Label>
                  <Input 
                    id="advancePaymentMonths" 
                    type="number" 
                    value={editingPackage.advancePaymentMonths || 0} 
                    onChange={(e) => setEditingPackage({
                      ...editingPackage, 
                      advancePaymentMonths: Number(e.target.value)
                    })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea 
                  id="features" 
                  value={featuresToString(editingPackage.features)} 
                  onChange={(e) => setEditingPackage({
                    ...editingPackage, 
                    features: stringToFeatures(e.target.value)
                  })}
                  placeholder="Add each feature on a new line"
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
                <Textarea 
                  id="termsAndConditions" 
                  value={editingPackage.termsAndConditions || ''} 
                  onChange={(e) => setEditingPackage({
                    ...editingPackage, 
                    termsAndConditions: e.target.value
                  })}
                  placeholder="Terms and conditions for this package"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="popular" 
                  checked={editingPackage.popular || false} 
                  onCheckedChange={(checked) => setEditingPackage({
                    ...editingPackage, 
                    popular: Boolean(checked)
                  })}
                />
                <Label htmlFor="popular">Mark as Popular</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSavePackage}>
                  Save Package
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      
      {/* Delete Confirmation */}
      {confirmDelete && packageToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Confirm Deletion</CardTitle>
              <CardDescription>
                Are you sure you want to delete this package? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p><strong>Package:</strong> {packageToDelete.title}</p>
                <p><strong>Type:</strong> {packageToDelete.type}</p>
                <p><strong>Price:</strong> ${packageToDelete.price}</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setConfirmDelete(false);
                    setPackageToDelete(null);
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Package'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default SupabasePackagesPanel;

