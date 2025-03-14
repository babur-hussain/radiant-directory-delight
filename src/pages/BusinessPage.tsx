
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, TrendingUp, BarChart3, Globe, Target, Megaphone, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchSubscriptionPackagesByType } from '@/lib/firebase-utils';
import { businessPackages } from '@/data/subscriptionData';
import { SubscriptionPackage } from '@/data/subscriptionData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';

const BusinessPage = () => {
  // Smooth scroll to top on page load
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the business packages from Firebase
  useEffect(() => {
    const loadPackages = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching business subscription packages for landing page");
        const fetchedPackages = await fetchSubscriptionPackagesByType("Business");
        console.log(`Fetched ${fetchedPackages.length} Business packages from Firebase`);
        
        // If no packages found, use default packages
        if (fetchedPackages.length === 0) {
          console.log("No business packages found, using default packages");
          setPackages(businessPackages);
          toast({
            title: "Using Default Packages",
            description: "No custom packages found. Showing default packages.",
          });
        } else {
          setPackages(fetchedPackages);
        }
      } catch (err) {
        console.error("Error fetching business packages:", err);
        setError("Failed to load packages. Using default packages instead.");
        
        // Use default packages as fallback
        setPackages(businessPackages);
        
        // Display a toast notification
        toast({
          title: "Error Loading Packages",
          description: "Failed to load custom packages. Using default packages instead.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPackages();
  }, []);

  const benefits = [
    {
      icon: Users,
      title: "Expand Your Audience",
      description: "Reach new potential customers through the authentic voice of influencers who resonate with your target market."
    },
    {
      icon: Megaphone,
      title: "Authentic Marketing",
      description: "Create genuine connections with audiences through trusted influencers who believe in your products."
    },
    {
      icon: TrendingUp,
      title: "Increase Conversions",
      description: "Drive more sales and conversions through targeted influencer campaigns that speak directly to interested audiences."
    },
    {
      icon: Globe,
      title: "Boost Brand Awareness",
      description: "Increase your brand visibility and recognition through strategic influencer partnerships."
    },
    {
      icon: Target,
      title: "Targeted Campaigns",
      description: "Connect with influencers whose audience aligns perfectly with your ideal customer profile."
    },
    {
      icon: BarChart3,
      title: "Measurable Results",
      description: "Track campaign performance with detailed analytics to maximize your return on investment."
    },
  ];

  // Package skeleton loader component
  const PackageSkeleton = () => (
    <Card className="flex flex-col transition-all duration-300">
      <CardHeader className="pb-1">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2 mb-4">
          {[1, 2, 3, 4].map((_, i) => (
            <li key={i} className="flex items-start">
              <Skeleton className="mr-2 h-4 w-4 mt-1 flex-shrink-0" />
              <Skeleton className="h-4 w-full" />
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-blue-500/10 to-primary/10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>
          
          <div className="container px-4 mx-auto relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Expand Your Reach & Grow Your Business
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Connect with our network of influencers to amplify your brand message and drive meaningful business growth.
              </p>
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 animate-pulse">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">How Businesses Benefit</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform enables businesses of all sizes to harness the power of influencer marketing effectively.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section className="py-20 bg-gray-50">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Business Subscription Plans</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose the right plan for your business needs and start connecting with influencers today.
              </p>
            </div>

            {error && (
              <Alert variant="warning" className="mb-8 max-w-3xl mx-auto">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="text-amber-600">Package Loading Issue</AlertTitle>
                <AlertDescription>
                  {error} <Link to="/admin/subscriptions" className="underline font-medium">Manage Packages</Link>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {isLoading ? (
                // Show skeletons while loading
                Array(4).fill(0).map((_, index) => (
                  <PackageSkeleton key={index} />
                ))
              ) : packages.length > 0 ? (
                // Show actual packages
                packages.map((pkg) => (
                  <Card 
                    key={pkg.id} 
                    className={`flex flex-col transition-all duration-300 ${
                      pkg.popular ? 'border-blue-500 shadow-lg relative' : 
                      selectedPackage === pkg.id ? 'border-blue-500/50 shadow-md' : ''
                    }`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    {pkg.popular && (
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                        MOST POPULAR
                      </div>
                    )}
                    <CardHeader className="pb-1">
                      <CardTitle className="text-xl">{pkg.title}</CardTitle>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold">₹{pkg.price}</span>
                        <span className="text-muted-foreground mb-1">/year</span>
                      </div>
                      <CardDescription>{pkg.shortDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <ul className="space-y-2 mb-4">
                        {pkg.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <CheckCircle className="mr-2 h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link to="/subscription" className="w-full">
                        <Button 
                          className="w-full bg-blue-500 hover:bg-blue-600" 
                          variant={pkg.popular ? 'default' : 'outline'}
                        >
                          Subscribe Now
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                // Show error state if no packages
                <div className="col-span-4 text-center p-8 bg-gray-100 rounded-lg">
                  <p className="text-gray-600">No subscription packages available at the moment.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-500 text-white">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Grow Your Business?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-white/80">
              Join hundreds of businesses that are already leveraging our platform to reach new audiences and drive growth.
            </p>
            <Link to="/subscription">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white text-blue-500 hover:bg-white/90 border-white"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessPage;
