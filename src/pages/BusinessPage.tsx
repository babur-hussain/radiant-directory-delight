
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import SubscriptionPackages from '@/components/subscription/SubscriptionPackages';
import FAQ from '@/components/business/FAQsSection';

const BusinessPage = () => {
  const { user } = useAuth();
  
  // Create empty placeholder data
  const statistics = [];
  const features = [];
  const faqs = [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Business Solutions</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Grow your business with our customized digital marketing solutions designed specifically for local businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Complete Digital Presence</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Establish your business online with a complete digital strategy tailored to your specific needs.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Local SEO Excellence</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Get found by local customers with optimized local SEO strategies that put your business on the map.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Social Media Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Engage with your community through professional social media management and content creation.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Business Plans</h2>
          <SubscriptionPackages userRole="Business" />
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <FAQ faqs={faqs} />
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">Ready to Grow Your Business?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join hundreds of local businesses who have transformed their digital presence with our solutions.
          </p>
          <Button size="lg" className="px-8 py-6 text-lg">Get Started Today</Button>
        </div>
      </div>
    </Layout>
  );
};

export default BusinessPage;
