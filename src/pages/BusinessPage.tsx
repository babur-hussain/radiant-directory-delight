import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { useBusinessPageData } from '@/hooks/useBusinessPageData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FreelancersSection from '@/components/business/FreelancersSection';
import FAQsSection from '@/components/business/FAQsSection';
import StatisticsSection from '@/components/business/StatisticsSection';
import SubscriptionPackages from '@/components/subscription/SubscriptionPackages';

const BusinessPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('features');
  
  // Create dummy data for components that require it
  const businessData = {
    statistics: [
      { value: '5000+', label: 'Businesses Helped' },
      { value: '95%', label: 'Satisfaction Rate' },
      { value: '30%', label: 'Average Growth' }
    ],
    features: [
      { title: 'Business Profile', description: 'Enhance your online presence' },
      { title: 'Analytics', description: 'Track your performance' },
      { title: 'Marketing Tools', description: 'Grow your customer base' }
    ],
    faqs: [
      { question: 'How does it work?', answer: 'Our platform connects businesses with tools and services they need.' },
      { question: 'What is the pricing?', answer: 'We offer various packages starting from ₹999/month.' },
      { question: 'How can I get started?', answer: 'Sign up for an account and choose a subscription package.' }
    ]
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Empower Your Business</h1>
        <p className="text-gray-600 mb-8">
          Unlock the tools and resources you need to grow your business and reach new heights.
        </p>
        <Button onClick={() => navigate('/subscription')}>Get Started</Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-10">
        <TabsList className="grid grid-cols-4 w-full max-w-4xl mx-auto">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        
        <div className="mt-8">
          <TabsContent value="features">
            <StatisticsSection statistics={businessData.statistics} />
          </TabsContent>
          
          <TabsContent value="freelancers">
            <FreelancersSection />
          </TabsContent>
          
          <TabsContent value="pricing">
            <SubscriptionPackages userRole="Business" />
          </TabsContent>
          
          <TabsContent value="faq">
            <FAQsSection faqs={businessData.faqs} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default BusinessPage;
