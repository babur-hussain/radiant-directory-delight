
import React from 'react';
import { ServicesSection } from '@/components/services/ServicesSection';

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our <span className="text-brand-orange">Services</span></h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive solutions to help businesses and influencers achieve their marketing goals.
          </p>
        </div>
        
        <ServicesSection />
      </div>
    </div>
  );
};

export default ServicesPage;
