
import React from 'react';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import CategorySection from '@/components/CategorySection';
import FeaturedBusinesses from '@/components/FeaturedBusinesses';
import TestimonialSection from '@/components/TestimonialSection';
import CallToAction from '@/components/CallToAction';
import CtaSection from '@/components/CtaSection';

const Index = () => {
  console.log("Rendering Index page");
  
  return (
    <div className="index-page">
      <HeroSection />
      <CtaSection />
      <CategorySection />
      <FeaturedBusinesses />
      <TestimonialSection />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;
