
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Award, CheckSquare, MapPin, Star, TrendingUp, Users, Zap, AlertCircle } from 'lucide-react';
import SubscriptionPackages from '@/components/subscription/SubscriptionPackages';
import Loading from '@/components/ui/loading';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import SubscriptionDialog from '@/components/subscription/SubscriptionDialog';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { toast } from 'sonner';

const InfluencerPage = () => {
  const navigate = useNavigate();
  const { packages, isLoading, isError, error } = useSubscriptionPackages();
  const [selectedPackage, setSelectedPackage] = useState<ISubscriptionPackage | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  
  const benefits = [
    {
      icon: Users,
      title: "Create a Free Profile",
      description: "Showcase your social links and content categories to businesses looking for influencers like you."
    },
    {
      icon: CheckSquare,
      title: "Choose 6 Video Categories",
      description: "Specialize in the content areas you excel at and find matching businesses."
    },
    {
      icon: MapPin,
      title: "Get Listed Locally",
      description: "Connect with businesses in your area who are looking for local influencers like you."
    },
    {
      icon: Award,
      title: "Verified Badge",
      description: "Stand out with our verified badge that shows businesses you're a trusted creator."
    },
    {
      icon: Zap,
      title: "Premium Features",
      description: "Access advanced features to grow your influence and connect with more brands."
    },
    {
      icon: TrendingUp,
      title: "Increase Your Reach",
      description: "Choose plans that expand your visibility from 200 KM to over 1050 KM radius."
    },
  ];

  const scrollToPackages = () => {
    const packagesSection = document.getElementById('subscription-packages');
    if (packagesSection) {
      packagesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPackage = (pkg: ISubscriptionPackage) => {
    console.log("Package selected on Influencer page:", pkg.title);
    setSelectedPackage(pkg);
    setShowDialog(true);
    toast.success(`Selected package: ${pkg.title}`);
  };

  useEffect(() => {
    console.log("=== InfluencerPage Debug ===");
    console.log("Packages loading:", isLoading);
    console.log("Packages error:", isError);
    console.log("Packages data:", packages);
    console.log("Dialog visible:", showDialog);
  }, [packages, isLoading, isError, showDialog]);

  return (
    <div className="min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-indigo-500/10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>
          
          <div className="container px-4 mx-auto relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-purple">
                🎥 Earn as Influencer. Be Seen. Be Paid. Be a Star.
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Join for FREE, showcase your social power, and unlock earning opportunities from brands near you.
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500 text-white shadow-md hover:shadow-lg transition-all duration-300"
                onClick={scrollToPackages}
              >
                Create My Influencer Profile <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-gradient-purple">Key Benefits for Influencers</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform provides everything you need to succeed as an influencer in today's competitive market.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardHeader className="pb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mb-3">
                      <benefit.icon className="h-6 w-6 text-purple-600" />
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

        {/* Subscription Packages Section */}
        <section id="subscription-packages" className="py-20 bg-gray-50">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-gradient-purple">Choose Your Influencer Package</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select the plan that best fits your goals and take your influencer career to the next level.
              </p>
            </div>

            <div className="relative subscription-packages-container">
              <SubscriptionPackages 
                userRole="Influencer"
                filterByType={true}
                onSelectPackage={handleSelectPackage}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Start Growing Your Influence Today!</h2>
            <p className="text-lg mb-4 max-w-2xl mx-auto text-white/90">
              Join thousands of successful influencers who are growing their audience and income with our platform.
            </p>
            <p className="text-md mb-8 max-w-2xl mx-auto text-white/80">
              Refer another influencer and earn 20% of their plan instantly!
            </p>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white text-purple-600 hover:bg-white/90 border-white hover:shadow-lg transition-all duration-300"
              onClick={scrollToPackages}
            >
              Join Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>
      
      <SubscriptionDialog 
        isOpen={showDialog}
        setIsOpen={setShowDialog}
        selectedPackage={selectedPackage}
      />
    </div>
  );
};

export default InfluencerPage;
