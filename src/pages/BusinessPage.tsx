
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole } from '@/types/auth';
import { useAuth } from '@/features/auth/useAuth';
import { useBusinessPageData } from '@/hooks/useBusinessPageData';
import SubscriptionPackages from '@/components/subscription/SubscriptionPackages';
import FreelancersSection from '@/components/business/FreelancersSection';
import FAQsSection from '@/components/business/FAQsSection';
import StatisticsSection from '@/components/business/StatisticsSection';
import { Button } from '@/components/ui/button';
import { Image } from 'lucide-react';

const BusinessPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('features');
  const { user } = useAuth();
  const { 
    statistics,
    features,
    faqs,
    loading,
    error
  } = useBusinessPageData();

  if (loading) {
    return (
      <div className="container mx-auto py-20 text-center">
        <p>Loading business page content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-20 text-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="py-10 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Grow Your Business with Effective Tools
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Unlock the potential of your business with our comprehensive range of tools and services designed to help you thrive in today's competitive market.
            </p>
            <div className="space-x-4">
              <Button size="lg" onClick={() => setActiveTab('packages')}>
                View Packages
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
              <Image className="w-16 h-16 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      <StatisticsSection statistics={statistics} />

      <section className="py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
              <TabsTrigger value="faqs">FAQs</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="features" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="packages">
            <SubscriptionPackages userRole="Business" />
          </TabsContent>

          <TabsContent value="freelancers">
            <FreelancersSection />
          </TabsContent>

          <TabsContent value="faqs">
            <FAQsSection faqs={faqs} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default BusinessPage;
