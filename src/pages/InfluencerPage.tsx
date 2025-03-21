
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import StatisticsSection from '@/components/influencer/StatisticsSection';
import FeaturesSection from '@/components/influencer/FeaturesSection';
import HowItWorksSection from '@/components/influencer/HowItWorksSection';
import FAQsSection from '@/components/influencer/FAQsSection';
import TestimonialsSection from '@/components/influencer/TestimonialsSection';
import SubscriptionPackages from '@/components/subscription/SubscriptionPackages';
import { Database, LineChart, BarChart, ArrowRight, Megaphone, Users } from 'lucide-react';

const InfluencerPage = () => {
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Grow Your Influence</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Tools and support to help you expand your reach, engage your audience, and monetize your content.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild className="bg-primary text-white hover:bg-primary/90 px-6 py-2 rounded-md">
              <a href="#packages">View Packages</a>
            </Button>
            {user ? (
              <Button asChild className="bg-transparent border border-primary text-primary hover:bg-primary/10 px-6 py-2 rounded-md">
                <a href="/dashboard">Go to Dashboard</a>
              </Button>
            ) : (
              <Button asChild className="bg-transparent border border-primary text-primary hover:bg-primary/10 px-6 py-2 rounded-md">
                <a href="/auth?type=signup">Get Started</a>
              </Button>
            )}
          </div>
        </header>

        <section className="mb-16">
          <StatisticsSection 
            statistics={[]} 
          />
        </section>

        <section className="mb-16">
          <FeaturesSection 
            features={[]} 
          />
        </section>

        <section className="mb-16">
          <HowItWorksSection 
            steps={[]} 
          />
        </section>

        <section className="mb-16">
          <FAQsSection 
            faqs={[]} 
          />
        </section>

        <section className="mb-16">
          <TestimonialsSection 
            testimonials={[]} 
          />
        </section>

        <section id="packages" className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Choose Your Package</h2>
          <SubscriptionPackages />
        </section>
      </div>
    </Layout>
  );
};

export default InfluencerPage;
