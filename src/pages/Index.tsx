
import { useEffect } from 'react';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import CategorySection from '@/components/CategorySection';
import FeaturedBusinesses from '@/components/FeaturedBusinesses';
import TestimonialSection from '@/components/TestimonialSection';
import CallToAction from '@/components/CallToAction';
import CtaSection from '@/components/CtaSection';

const Index = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    console.log("Index page mounted");
    window.scrollTo(0, 0);
    
    return () => {
      console.log("Index page unmounting");
    };
  }, []);

  console.log("Rendering Index page content");
  return (
    <>
      <HeroSection />
      <CtaSection />
      <CategorySection />
      <FeaturedBusinesses />
      <TestimonialSection />
      <CallToAction />
      <Footer />
    </>
  );
};

export default Index;
