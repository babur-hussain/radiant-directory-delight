import React, { useState, useEffect } from 'react';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

export interface SubscriptionPackageFormProps {
  package: ISubscriptionPackage;
  onSave: (packageData: ISubscriptionPackage) => Promise<void>;
  onCancel: () => void;
}

const SubscriptionPackageForm: React.FC<SubscriptionPackageFormProps> = ({
  package: initialPackage,
  onSave,
  onCancel
}) => {
  const [packageData, setPackageData] = useState<ISubscriptionPackage>(initialPackage);
  const [activeTab, setActiveTab] = useState("basic");
  const [newFeature, setNewFeature] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!packageData.id) {
      setPackageData(prev => ({
        ...prev,
        id: `${prev.type.toLowerCase()}-${uuidv4().slice(0, 8)}`
      }));
    }
  }, [packageData.id, packageData.type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPackageData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPackageData(prev => ({
      ...prev,
      [name]: value === '' ? '' : Number(value)
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setPackageData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setPackageData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'paymentType') {
      if (value === 'one-time') {
        setPackageData(prev => ({
          ...prev,
          billingCycle: undefined,
          setupFee: 0,
          monthlyPrice: undefined
        }));
      } else {
        setPackageData(prev => ({
          ...prev,
          billingCycle: prev.billingCycle || 'yearly'
        }));
      }
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setPackageData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setPackageData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!packageData.title) newErrors.title = "Title is required";
    if (!packageData.price && packageData.price !== 0) newErrors.price = "Price is required";
    if (!packageData.shortDescription) newErrors.shortDescription = "Short description is required";
    if (!packageData.fullDescription) newErrors.fullDescription = "Full description is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      await onSave({
        ...packageData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error saving package:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>
              {packageData.id ? `Edit Package: ${packageData.title}` : 'Create New Package'}
            </CardTitle>
            <Badge variant={packageData.type === 'Business' ? 'default' : 'secondary'}>
              {packageData.type}
            </Badge>
          </div>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6">
            <TabsList className="w-full">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
          </div>
          
          <CardContent className="pt-4">
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="title" className={errors.title ? "text-destructive" : ""}>
                    Package Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={packageData.title}
                    onChange={handleChange}
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
                </div>
                
                <div>
                  <Label htmlFor="shortDescription" className={errors.shortDescription ? "text-destructive" : ""}>
                    Short Description
                  </Label>
                  <Input
                    id="shortDescription"
                    name="shortDescription"
                    value={packageData.shortDescription}
                    onChange={handleChange}
                    className={errors.shortDescription ? "border-destructive" : ""}
                  />
                  {errors.shortDescription && <p className="text-xs text-destructive mt-1">{errors.shortDescription}</p>}
                </div>
                
                <div>
                  <Label htmlFor="fullDescription" className={errors.fullDescription ? "text-destructive" : ""}>
                    Full Description
                  </Label>
                  <Textarea
                    id="fullDescription"
                    name="fullDescription"
                    value={packageData.fullDescription}
                    onChange={handleChange}
                    rows={4}
                    className={errors.fullDescription ? "border-destructive" : ""}
                  />
                  {errors.fullDescription && <p className="text-xs text-destructive mt-1">{errors.fullDescription}</p>}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="popular"
                    checked={!!packageData.popular}
                    onCheckedChange={(checked) => handleSwitchChange('popular', checked)}
                  />
                  <Label htmlFor="popular">Mark as Popular</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="pricing" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentType">Payment Type</Label>
                  <Select
                    value={packageData.paymentType}
                    onValueChange={(value) => handleSelectChange('paymentType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recurring">Recurring</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {packageData.paymentType === 'recurring' && (
                  <div>
                    <Label htmlFor="billingCycle">Billing Cycle</Label>
                    <Select
                      value={packageData.billingCycle || 'yearly'}
                      onValueChange={(value) => handleSelectChange('billingCycle', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select billing cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="price" className={errors.price ? "text-destructive" : ""}>
                    {packageData.paymentType === 'recurring' 
                      ? `${packageData.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} Price (₹)` 
                      : 'One-time Price (₹)'}
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={packageData.price}
                    onChange={handleNumberChange}
                    className={errors.price ? "border-destructive" : ""}
                  />
                  {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
                </div>
                
                {packageData.paymentType === 'recurring' && packageData.billingCycle === 'yearly' && (
                  <div>
                    <Label htmlFor="monthlyPrice">Monthly Equivalent (₹)</Label>
                    <Input
                      id="monthlyPrice"
                      name="monthlyPrice"
                      type="number"
                      value={packageData.monthlyPrice || ''}
                      onChange={handleNumberChange}
                      placeholder="Calculated monthly price"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      For display purposes only (yearly price ÷ 12)
                    </p>
                  </div>
                )}
                
                {packageData.paymentType === 'recurring' && (
                  <div>
                    <Label htmlFor="setupFee">Setup Fee (₹)</Label>
                    <Input
                      id="setupFee"
                      name="setupFee"
                      type="number"
                      value={packageData.setupFee || 0}
                      onChange={handleNumberChange}
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="durationMonths">Duration (Months)</Label>
                  <Input
                    id="durationMonths"
                    name="durationMonths"
                    type="number"
                    value={packageData.durationMonths}
                    onChange={handleNumberChange}
                  />
                </div>
                
                {packageData.paymentType === 'recurring' && (
                  <div>
                    <Label htmlFor="advancePaymentMonths">Advance Payment (Months)</Label>
                    <Input
                      id="advancePaymentMonths"
                      name="advancePaymentMonths"
                      type="number"
                      value={packageData.advancePaymentMonths || 0}
                      onChange={handleNumberChange}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      How many months to charge in advance (0 = pay as you go)
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor="newFeature">Add Feature</Label>
                    <Input
                      id="newFeature"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Enter a feature"
                    />
                  </div>
                  <Button type="button" onClick={addFeature} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Features List</h3>
                  {packageData.features && packageData.features.length > 0 ? (
                    <ul className="space-y-2">
                      {packageData.features.map((feature, index) => (
                        <li key={index} className="flex items-center justify-between">
                          <span>{feature}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFeature(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No features added yet</p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
                  <Textarea
                    id="termsAndConditions"
                    name="termsAndConditions"
                    value={packageData.termsAndConditions || ''}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter any specific terms and conditions for this package"
                  />
                </div>
                
                <div>
                  <Label>Dashboard Sections</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Select which dashboard sections are available with this package
                  </p>
                  
                  <
