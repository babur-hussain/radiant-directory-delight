
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PartnersSection } from '@/components/PartnersSection';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About <span className="text-brand-orange">Us</span></h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Learn more about our mission, vision, and the team behind our platform.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-600">
                We aim to bridge the gap between businesses and influencers, creating meaningful connections that drive growth and value for both parties. Our platform provides the tools, insights, and opportunities needed to thrive in the digital marketing landscape.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-gray-600">
                We envision a future where every business, regardless of size, can harness the power of influencer marketing, and where influencers can build sustainable careers by connecting with brands that align with their values and audience.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Our Partners</h2>
          <PartnersSection />
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
