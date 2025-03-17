
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Save, Info, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PackageSectionsListProps {
  packages: any[];
  selectedPackage: string;
  setSelectedPackage: (packageId: string) => void;
  packageSections: string[];
  availableSections: string[];
  togglePackageSection: (section: string) => void;
  savePackageSections: () => void;
  refreshData: () => void;
}

const PackageSectionsList: React.FC<PackageSectionsListProps> = ({
  packages,
  selectedPackage,
  setSelectedPackage,
  packageSections,
  availableSections,
  togglePackageSection,
  savePackageSections,
  refreshData,
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">
            Dashboard sections for subscription packages
          </h3>
          <p className="text-sm text-muted-foreground">
            Define which dashboard sections are included in each package
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {packages.length === 0 ? (
        <Alert className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No packages available</AlertTitle>
          <AlertDescription>
            No subscription packages have been created yet. Please add packages through the Subscription Management 
            section before configuring dashboard sections.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Select value={selectedPackage} onValueChange={setSelectedPackage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a package" />
            </SelectTrigger>
            <SelectContent>
              {packages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  {pkg.title} ({pkg.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Separator className="my-4" />
          
          {selectedPackage && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableSections.map((section) => (
                  <div key={section} className="flex items-center justify-between space-x-2 p-2 border rounded">
                    <Label htmlFor={`package-${section}`} className="flex-1 cursor-pointer">
                      {section.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <Switch
                      id={`package-${section}`}
                      checked={packageSections.includes(section)}
                      onCheckedChange={() => togglePackageSection(section)}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-4">
                <Button onClick={savePackageSections}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Package Settings
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default PackageSectionsList;
