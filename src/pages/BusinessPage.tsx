
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessPageData } from '@/hooks/useBusinessPageData';
import StatisticsSection from '@/components/business/StatisticsSection';
import FreelancersSection from '@/components/business/FreelancersSection';
import FAQsSection from '@/components/business/FAQsSection';
import SubscriptionPackages from '@/components/subscription/SubscriptionPackages';

const BusinessPage = () => {
  const { businesses, loading } = useBusinessPageData();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Real data would come from an API or context
  // Empty containers to represent no dummy data

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Grow Your Business</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Comprehensive tools and services to help your business thrive in the digital landscape.
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
          <StatisticsSection statistics={[]} />
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Business Solutions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Digital Marketing</h3>
              <p className="text-muted-foreground">Reach your target audience with strategic digital marketing campaigns.</p>
            </div>
            
            <div className="border p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Web Development</h3>
              <p className="text-muted-foreground">Custom websites and web applications tailored to your business needs.</p>
            </div>
            
            <div className="border p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Analytics</h3>
              <p className="text-muted-foreground">Comprehensive data insights to help you make informed business decisions.</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <FreelancersSection freelancers={[]} />
        </section>

        <section className="mb-16">
          <FAQsSection faqs={[]} />
        </section>

        <section id="packages" className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Choose Your Package</h2>
          <SubscriptionPackages />
        </section>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : businesses && businesses.length > 0 ? (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Featured Businesses</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {businesses.slice(0, 3).map((business) => (
                <div key={business.id} className="border rounded-lg overflow-hidden">
                  {business.image && (
                    <div className="h-48 overflow-hidden">
                      <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2">{business.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{business.category}</p>
                    <p className="mb-4">{business.description}</p>
                    <Button asChild className="w-full">
                      <a href={`/business/${business.id}`}>View Details</a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="mb-16">
            <div className="text-center py-8">
              <p className="text-muted-foreground">No featured businesses available at this time.</p>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default BusinessPage;
