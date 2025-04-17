
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Award, CheckSquare, Star, TrendingUp, Users, Zap } from 'lucide-react';
import SubscriptionPackages from '@/components/subscription/SubscriptionPackages';
import Loading from '@/components/ui/loading';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import Layout from '@/components/layout/Layout';
import SubscriptionDialog from '@/components/subscription/SubscriptionDialog';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { toast } from 'sonner';

const InfluencerPage = () => {
  const navigate = useNavigate();
  const { packages, isLoading, isError } = useSubscriptionPackages();
  const [selectedPackage, setSelectedPackage] = useState<ISubscriptionPackage | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  
  const benefits = [
    {
      icon: Users,
      title: "Expand Your Audience",
      description: "Connect with businesses looking for influencers in your niche and grow your follower base."
    },
    {
      icon: Star,
      title: "Premium Brand Partnerships",
      description: "Get exclusive access to collaboration opportunities with top brands and businesses."
    },
    {
      icon: TrendingUp,
      title: "Monetize Your Content",
      description: "Transform your social media presence into a sustainable income stream through partnerships."
    },
    {
      icon: Award,
      title: "Verified Influencer Badge",
      description: "Stand out with our verified badge that shows businesses you're a trusted partner."
    },
    {
      icon: Zap,
      title: "Analytics Dashboard",
      description: "Track your performance, engagement, and earnings with our intuitive analytics tools."
    },
    {
      icon: CheckSquare,
      title: "Personalized Opportunities",
      description: "Receive tailored collaboration offers that match your audience and content style."
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
    toast.info(`Selected package: ${pkg.title}`);
  };

  // Log when dialog visibility changes
  useEffect(() => {
    console.log("Dialog visible:", showDialog);
  }, [showDialog]);

  return (
    <Layout hideHeader={false} hideFooter={false}>
      <div className="min-h-screen">
        <main className="flex-grow">
          <section className="relative py-20 md:py-28 bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-indigo-500/10 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>
            
            <div className="container px-4 mx-auto relative z-10">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-purple">
                  Maximize Your Earning Potential as an Influencer
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Join our platform and turn your passion into profit by connecting with brands that value your unique voice and audience.
                </p>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={scrollToPackages}
                >
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>

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

          <section id="subscription-packages" className="py-20 bg-gray-50">
            <div className="container px-4 mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4 text-gradient-purple">Choose Your Influencer Package</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Select the plan that best fits your goals and take your influencer career to the next level.
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loading size="lg" message="Loading subscription packages..." />
                </div>
              ) : isError ? (
                <div className="text-center py-10">
                  <p className="text-red-500 mb-4">There was an error loading the subscription packages.</p>
                  <Button onClick={() => window.location.reload()}>Try Again</Button>
                </div>
              ) : (
                <div className="relative subscription-packages-container">
                  <SubscriptionPackages 
                    userRole="Influencer"
                    onSelectPackage={handleSelectPackage}
                  />
                </div>
              )}
            </div>
          </section>

          <section className="py-16 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white">
            <div className="container px-4 mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Start Your Influencer Journey?</h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto text-white/90">
                Join thousands of successful influencers who are growing their audience and income with our platform.
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
      </div>
      
      <SubscriptionDialog 
        isOpen={showDialog}
        setIsOpen={setShowDialog}
        selectedPackage={selectedPackage}
      />
    </Layout>
  );
};

export default InfluencerPage;
