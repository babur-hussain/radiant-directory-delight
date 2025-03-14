
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, TrendingUp, BarChart3, Globe, Target, Megaphone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { businessPackages } from '@/data/subscriptionData';
import Header from '@/components/Header';
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {businessPackages.map((pkg) => (
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
              ))}
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
