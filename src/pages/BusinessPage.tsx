
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Award, CheckSquare, Star, TrendingUp, Users, Zap } from 'lucide-react';
import SubscriptionPackages from '@/components/subscription/SubscriptionPackages';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import SubscriptionDialog from '@/components/subscription/SubscriptionDialog';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { toast } from 'sonner';
import SubscriptionPackagesLoading from '@/components/subscription/SubscriptionPackagesLoading';

const BusinessPage = () => {
  const navigate = useNavigate();
  const { packages, isLoading, isError } = useSubscriptionPackages();
  const [selectedPackage, setSelectedPackage] = useState<ISubscriptionPackage | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [renderLoading, setRenderLoading] = useState(false);
  
  // Only set loading after a delay to prevent flashing
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setRenderLoading(true), 500);
      return () => clearTimeout(timer);
    } else {
      setRenderLoading(false);
    }
  }, [isLoading]);

  // Filter packages to show only Business type
  const businessPackages = packages.filter(pkg => pkg.type === 'Business');
  
  useEffect(() => {
    console.log("BusinessPage Debug:");
    console.log("All packages:", packages);
    console.log("Business packages:", businessPackages);
    console.log("Is loading:", isLoading);
    console.log("Is error:", isError);
  }, [packages, businessPackages, isLoading, isError]);
  
  const benefits = [
    {
      icon: Users,
      title: "Expand Your Audience",
      description: "Connect with our network of influencers to reach new potential customers and grow your business."
    },
    {
      icon: Star,
      title: "Premium Influencer Partnerships",
      description: "Get exclusive access to our top influencers who can promote your products and services."
    },
    {
      icon: TrendingUp,
      title: "Boost Your Online Presence",
      description: "Transform your digital footprint with expert marketing strategies and influencer collaborations."
    },
    {
      icon: Award,
      title: "Verified Business Badge",
      description: "Stand out with our verified badge that shows customers you're a trusted business partner."
    },
    {
      icon: Zap,
      title: "Analytics Dashboard",
      description: "Track your campaign performance, engagement, and ROI with our intuitive analytics tools."
    },
    {
      icon: CheckSquare,
      title: "Personalized Marketing Plans",
      description: "Receive tailored marketing strategies that match your business goals and budget."
    },
  ];

  const scrollToPackages = () => {
    const packagesSection = document.getElementById('subscription-packages');
    if (packagesSection) {
      packagesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPackage = (pkg: ISubscriptionPackage) => {
    console.log("Package selected on Business page:", pkg.title);
    setSelectedPackage(pkg);
    setShowDialog(true);
    toast.info(`Selected package: ${pkg.title}`);
  };

  return (
    <div className="min-h-screen">
      <main className="flex-grow">
        {/* Hero section */}
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>
          
          <div className="container px-4 mx-auto relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-blue">
                Grow as Business with Influencer Marketing
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Connect with our network of influencers to amplify your brand message and drive meaningful business growth.
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-teal-500 hover:via-cyan-500 hover:to-blue-500 text-white shadow-md hover:shadow-lg transition-all duration-300"
                onClick={scrollToPackages}
                type="button"
              >
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits section */}
        <section className="py-20 bg-white">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-gradient-blue">Key Benefits for Businesses</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform provides everything you need to thrive in today's competitive market through influencer partnerships.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardHeader className="pb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-teal-500/20 flex items-center justify-center mb-3">
                      <benefit.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Subscription packages section */}
        <section id="subscription-packages" className="py-20 bg-gray-50">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-gradient-blue">Choose Your Business Package</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select the plan that best fits your goals and take your business to the next level.
              </p>
            </div>

            {renderLoading && isLoading ? (
              <div className="relative z-10">
                <SubscriptionPackagesLoading />
              </div>
            ) : isError ? (
              <div className="text-center py-10">
                <p className="text-red-500 mb-4">There was an error loading the subscription packages.</p>
                <Button onClick={() => window.location.reload()} type="button">Try Again</Button>
              </div>
            ) : (
              <div className="relative z-10">
                <SubscriptionPackages 
                  userRole="Business" 
                  filterByType={true}
                  onSelectPackage={handleSelectPackage}
                />
              </div>
            )}
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Start Your Business Growth?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-white/90">
              Join thousands of successful businesses who are expanding their reach and growing their revenue with our platform.
            </p>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white text-blue-600 hover:bg-white/90 border-white hover:shadow-lg transition-all duration-300"
              onClick={scrollToPackages}
              type="button"
            >
              Join Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>
      
      {selectedPackage && (
        <SubscriptionDialog 
          isOpen={showDialog}
          setIsOpen={setShowDialog}
          selectedPackage={selectedPackage}
        />
      )}
    </div>
  );
};

export default BusinessPage;
