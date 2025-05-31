
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap } from 'lucide-react';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import { useAuth } from '@/hooks/useAuth';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { Skeleton } from '@/components/ui/skeleton';

interface SubscriptionPackagesProps {
  userRole?: string;
  filterByType?: boolean;
  onSelectPackage?: (pkg: ISubscriptionPackage) => void;
}

const SubscriptionPackages: React.FC<SubscriptionPackagesProps> = ({ 
  userRole = "Business", 
  filterByType = false,
  onSelectPackage
}) => {
  const { user } = useAuth();
  
  console.log("=== SubscriptionPackages Component Render ===");
  console.log("Props:", { userRole, filterByType, onSelectPackage: !!onSelectPackage });
  console.log("User:", user ? { id: user.id, role: user.role } : 'No user');
  
  // Always fetch all packages, then filter in component if needed
  const { packages, isLoading, isError, error } = useSubscriptionPackages();

  console.log("=== Hook Response ===");
  console.log("packages:", packages);
  console.log("packages type:", typeof packages);
  console.log("packages is array:", Array.isArray(packages));
  console.log("packages length:", packages?.length);
  console.log("isLoading:", isLoading);
  console.log("isError:", isError);
  console.log("error:", error);

  // Filter packages based on filterByType prop
  const filteredPackages = React.useMemo(() => {
    console.log("=== Filtering packages ===");
    console.log("filterByType:", filterByType);
    console.log("userRole:", userRole);
    
    if (!packages) {
      console.log("No packages to filter - packages is null/undefined");
      return [];
    }

    if (!Array.isArray(packages)) {
      console.log("Packages is not an array:", typeof packages, packages);
      return [];
    }

    if (packages.length === 0) {
      console.log("No packages available to filter - empty array");
      return [];
    }

    console.log("Available packages:", packages.map(p => ({ 
      id: p.id, 
      title: p.title, 
      type: p.type, 
      isActive: p.isActive 
    })));

    if (!filterByType) {
      console.log("Not filtering by type, showing all packages:", packages.length);
      return packages;
    }

    const filtered = packages.filter(pkg => {
      const matches = pkg.type === userRole;
      console.log(`Package "${pkg.title}" (${pkg.type}) matches ${userRole}:`, matches);
      return matches;
    });
    
    console.log("Filtered packages:", filtered.length);
    console.log("Filtered package details:", filtered.map(p => ({ 
      id: p.id, 
      title: p.title, 
      type: p.type 
    })));
    
    return filtered;
  }, [packages, userRole, filterByType]);

  console.log("=== Final filtered packages ===");
  console.log("filteredPackages:", filteredPackages);
  console.log("filteredPackages length:", filteredPackages?.length);

  const handleSelectPackage = (pkg: ISubscriptionPackage) => {
    console.log("Package selected:", pkg.title, pkg.id);
    if (onSelectPackage) {
      onSelectPackage(pkg);
    }
  };

  if (isLoading) {
    console.log("Rendering loading state");
    return (
      <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="relative">
            <CardHeader>
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    console.log("Rendering error state");
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <Zap className="h-12 w-12 text-gray-400 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Unable to Load Packages</h3>
        <p className="text-gray-600 mb-4">
          There was an issue loading subscription packages. Please try refreshing the page.
        </p>
        <p className="text-sm text-red-500 mb-4">
          Error: {error?.message || 'Unknown error'}
        </p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
        >
          Refresh Page
        </Button>
      </div>
    );
  }

  if (!filteredPackages || filteredPackages.length === 0) {
    console.log("Rendering no packages state");
    
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <Zap className="h-12 w-12 text-gray-400 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Packages Available</h3>
        <p className="text-gray-600 mb-4">
          {filterByType 
            ? `No subscription packages found for ${userRole} users.` 
            : 'No subscription packages are currently available.'
          }
        </p>
        <div className="text-xs text-gray-400 bg-gray-100 p-4 rounded mt-4">
          <strong>Debug Info:</strong><br />
          Raw packages: {packages?.length || 0}<br />
          Filtered packages: {filteredPackages?.length || 0}<br />
          Filter by type: {filterByType ? 'Yes' : 'No'}<br />
          User role: {userRole}<br />
          Loading: {isLoading ? 'Yes' : 'No'}<br />
          Error: {isError ? 'Yes' : 'No'}
        </div>
      </div>
    );
  }

  console.log("Rendering packages:", filteredPackages.length);

  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {filteredPackages.map((pkg) => {
        console.log("Rendering package:", pkg.title, pkg.id);
        
        const monthlyPrice = pkg.monthlyPrice || pkg.price;
        const isPopular = pkg.popular;
        
        return (
          <Card 
            key={pkg.id} 
            className={`relative transition-all duration-300 hover:shadow-xl ${
              isPopular 
                ? 'border-2 border-purple-500 shadow-lg scale-105' 
                : 'border border-gray-200 hover:border-purple-300'
            }`}
          >
            {isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 text-sm font-semibold">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            {!pkg.isActive && (
              <div className="absolute -top-3 right-4">
                <Badge variant="secondary" className="text-xs">
                  Inactive
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {pkg.title}
              </CardTitle>
              <div className="mt-2">
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900">
                    ₹{monthlyPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
                {pkg.setupFee && pkg.setupFee > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    + ₹{pkg.setupFee.toLocaleString('en-IN')} setup fee
                  </p>
                )}
              </div>
              <CardDescription className="mt-2 text-gray-600">
                {pkg.shortDescription || 'Subscription package'}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              <div className="space-y-3">
                {Array.isArray(pkg.features) && pkg.features.length > 0 ? (
                  pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">Full access to platform features</span>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="px-6 pb-6">
              <Button 
                onClick={() => handleSelectPackage(pkg)}
                className={`w-full h-12 font-semibold transition-all duration-300 ${
                  isPopular
                    ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
                disabled={!user || !pkg.isActive}
              >
                {!user ? 'Login Required' : !pkg.isActive ? 'Not Available' : 'Choose Plan'}
              </Button>
              {!user && (
                <p className="text-xs text-center text-gray-500 mt-2">
                  Please log in to subscribe
                </p>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default SubscriptionPackages;
