
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Users, Star, TrendingUp, Award, Zap, CheckSquare, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { businessPackages } from '@/data/subscriptionData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { fetchSubscriptionPackagesByType } from '@/lib/mongodb-utils';
import { SubscriptionPackage } from '@/data/subscriptionData';

const BusinessPage = () => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    
    // Fetch packages from MongoDB
    const loadPackages = async () => {
      setIsLoading(true);
      try {
        const packages = await fetchSubscriptionPackagesByType('Business');
        setPackages(packages);
      } catch (error) {
        console.error('Error loading packages:', error);
        toast({
          title: "Failed to load packages",
          description: "Could not fetch subscription packages. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPackages();
  }, [toast]);

  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

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

  const navigate = useNavigate();

  const handleSubscribe = (packageId: string) => {
    navigate(`/subscription/details/${packageId}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-blue-500/10 to-primary/10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>
          
          <div className="container px-4 mx-auto relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Grow Your Business with Influencer Marketing
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Connect with our network of influencers to amplify your brand message and drive meaningful business growth.
              </p>
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 animate-pulse">
                Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Key Benefits for Businesses</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform provides everything you need to thrive in today's competitive market through influencer partnerships.
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

        <section className="py-20 bg-gray-50">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Choose Your Business Package</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select the plan that best fits your goals and take your business to the next level.
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Loading subscription packages...</p>
              </div>
            ) : packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {packages.map((pkg) => (
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
                        {pkg.features && pkg.features.length > 0 ? (
                          pkg.features.map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <Check className="mr-2 h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-muted-foreground">No features listed</li>
                        )}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-blue-500 hover:bg-blue-600" 
                        variant={pkg.popular ? 'default' : 'outline'}
                        onClick={() => handleSubscribe(pkg.id)}
                      >
                        Subscribe Now
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-600">No subscription packages are currently available. Please check back later.</p>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 bg-blue-500 text-white">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Start Your Business Growth?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-white/80">
              Join thousands of successful businesses who are expanding their reach and growing their revenue with our platform.
            </p>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white text-blue-500 hover:bg-white/90 border-white"
              onClick={() => navigate("/subscription")}
            >
              Join Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessPage;
