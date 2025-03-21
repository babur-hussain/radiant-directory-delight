
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import SubscriptionPackages from '@/components/subscription/SubscriptionPackages';
import { Check, Instagram, Users, TrendingUp } from 'lucide-react';

const InfluencerPage = () => {
  const { user } = useAuth();
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Become an Influencer Partner</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join our network of influencers and create authentic content that connects brands with your audience.
          </p>
          <div className="mt-8">
            <Button size="lg" className="px-8 py-6 text-lg">Apply Now</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Create</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Create authentic content that resonates with your audience and showcases local businesses.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Connect</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Connect with local businesses and brands that align with your personal values and style.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Earn</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Earn competitive compensation for your content creation and audience engagement skills.</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted py-16 px-4 rounded-lg mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Why Partner With Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Instagram className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Authentic Partnerships</h3>
                  <p className="text-muted-foreground">We connect you with businesses that match your unique style and audience interests.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Community Focus</h3>
                  <p className="text-muted-foreground">Help promote local businesses and strengthen your community connections.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Growth Opportunities</h3>
                  <p className="text-muted-foreground">Access to exclusive events, professional development, and networking.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Consistent Income</h3>
                  <p className="text-muted-foreground">Reliable payment structure with clear expectations and deliverables.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Influencer Programs</h2>
          <SubscriptionPackages userRole="Influencer" />
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Influencer Journey?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join our network of successful influencers who are making an impact in their communities.
          </p>
          <Button size="lg" className="px-8 py-6 text-lg">Apply Now</Button>
        </div>
      </div>
    </Layout>
  );
};

export default InfluencerPage;
