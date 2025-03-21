
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole } from '@/types/auth';
import { useAuth } from '@/features/auth/useAuth';
import SubscriptionPackages from '@/components/subscription/SubscriptionPackages';
import StatisticsSection from '@/components/influencer/StatisticsSection';
import FeaturesSection from '@/components/influencer/FeaturesSection';
import HowItWorksSection from '@/components/influencer/HowItWorksSection';
import FAQsSection from '@/components/influencer/FAQsSection';
import TestimonialsSection from '@/components/influencer/TestimonialsSection';
import { Button } from '@/components/ui/button';
import { Image } from 'lucide-react';

const InfluencerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('features');
  const { user } = useAuth();
  
  useEffect(() => {
    // Any initializations here
  }, []);

  const statistics = [
    { value: '25K+', label: 'Active Influencers' },
    { value: '150+', label: 'Brands Connected' },
    { value: '₹500K+', label: 'Average Earnings' },
    { value: '90%', label: 'Satisfaction Rate' }
  ];

  const features = [
    {
      title: 'Brand Connections',
      description: 'Connect with top brands seeking influencers in your niche.',
      icon: () => <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
    },
    {
      title: 'Campaign Management',
      description: 'Easily manage and track all your brand campaigns in one place.',
      icon: () => <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
    },
    {
      title: 'Earnings Dashboard',
      description: 'Track your earnings and get insights to maximize your revenue.',
      icon: () => <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
    },
    {
      title: 'Content Performance',
      description: 'Analyze what content performs best and optimize your strategy.',
      icon: () => <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
    },
    {
      title: 'Audience Insights',
      description: 'Understand your audience demographics and engagement patterns.',
      icon: () => <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
    },
    {
      title: 'Growth Tools',
      description: 'Access tools and resources to grow your following and engagement.',
      icon: () => <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Create Your Profile',
      description: 'Sign up and build your influencer profile showcasing your niche and audience.'
    },
    {
      step: 2,
      title: 'Connect Your Accounts',
      description: 'Link your social media accounts to analyze performance and audience insights.'
    },
    {
      step: 3,
      title: 'Browse Brand Opportunities',
      description: 'Explore brand campaigns looking for influencers in your niche.'
    },
    {
      step: 4,
      title: 'Create Great Content',
      description: 'Collaborate with brands and create content that resonates with your audience.'
    },
    {
      step: 5,
      title: 'Get Paid',
      description: 'Receive payment directly to your account once campaigns are completed.'
    }
  ];

  const faqs = [
    {
      question: 'How do I join as an influencer?',
      answer: 'You can sign up using our registration form, select the "Influencer" option, and fill in your profile details including your niche and social media links.'
    },
    {
      question: 'What are the requirements to join?',
      answer: 'We accept influencers with at least 1,000 followers on any major social media platform and consistent engagement rates. Quality of content is also important.'
    },
    {
      question: 'How do payments work?',
      answer: 'We offer secure payments via bank transfer or PayPal once your campaign deliverables are approved. Payment periods vary by campaign but are typically within 30 days.'
    },
    {
      question: 'Can I choose which brands to work with?',
      answer: 'Yes, you have complete freedom to choose which campaign opportunities you want to apply for based on your preferences and niche.'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="py-10 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Grow Your Influence & Earn More
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join our platform to connect with premium brands, grow your audience, and monetize your influence more effectively.
            </p>
            <div className="space-x-4">
              <Button size="lg" onClick={() => setActiveTab('packages')}>
                View Packages
              </Button>
              <Button size="lg" variant="outline">
                How It Works
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
              <TabsTrigger value="howItWorks">How It Works</TabsTrigger>
              <TabsTrigger value="faqs">FAQs</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="features">
            <FeaturesSection features={features} />
          </TabsContent>

          <TabsContent value="packages">
            <SubscriptionPackages userRole="Influencer" />
          </TabsContent>

          <TabsContent value="howItWorks">
            <HowItWorksSection steps={howItWorks} />
          </TabsContent>

          <TabsContent value="faqs">
            <FAQsSection faqs={faqs} />
          </TabsContent>
        </Tabs>
      </section>

      <TestimonialsSection />
    </div>
  );
};

export default InfluencerPage;
