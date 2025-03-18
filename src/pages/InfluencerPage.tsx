
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Users, Star, TrendingUp, Award, Zap, CheckSquare, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { influencerPackages } from '@/data/subscriptionData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const InfluencerPage = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

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

  const navigate = useNavigate();

  const handleSubscribe = (packageId: string) => {
    navigate(`/subscription/details/${packageId}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary/10 to-blue-400/10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>
          
          <div className="container px-4 mx-auto relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Maximize Your Earning Potential as an Influencer
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Join our platform and turn your passion into profit by connecting with brands that value your unique voice and audience.
              </p>
              <Button size="lg" className="animate-pulse">
                Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Key Benefits for Influencers</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform provides everything you need to succeed as an influencer in today's competitive market.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
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
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Choose Your Influencer Package</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select the plan that best fits your goals and take your influencer career to the next level.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {influencerPackages.map((pkg) => (
                <Card 
                  key={pkg.id} 
                  className={`flex flex-col transition-all duration-300 ${
                    pkg.popular ? 'border-primary shadow-lg relative' : 
                    selectedPackage === pkg.id ? 'border-primary/50 shadow-md' : ''
                  }`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  {pkg.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
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
                          <Check className="mr-2 h-4 w-4 text-primary mt-1 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={pkg.popular ? 'default' : 'outline'}
                      onClick={() => handleSubscribe(pkg.id)}
                    >
                      Subscribe Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-white">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Start Your Influencer Journey?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-white/80">
              Join thousands of successful influencers who are growing their audience and income with our platform.
            </p>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white text-primary hover:bg-white/90 border-white"
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

export default InfluencerPage;
