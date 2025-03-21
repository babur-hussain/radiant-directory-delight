
import React from 'react';
import HeroSection from '@/components/HeroSection';
import CategorySection from '@/components/CategorySection';
import FeaturedBusinesses from '@/components/FeaturedBusinesses';
import TestimonialSection from '@/components/TestimonialSection';
import CallToAction from '@/components/CallToAction';
import CtaSection from '@/components/CtaSection';

const Index = () => {
  return (
    <div className="index-page">
      <HeroSection />
      <div className="py-8">
        <h2 className="text-2xl font-bold text-center mb-4">Welcome to Grow Bharat Vyapaar</h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto">
          Discover and connect with Indian businesses from various sectors. Our platform helps 
          businesses grow and reach new customers.
        </p>
      </div>
      <CtaSection />
      <CategorySection />
      <FeaturedBusinesses />
      <TestimonialSection />
      <CallToAction />
    </div>
  );
};

export default Index;
