
import { useEffect } from 'react';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import CategorySection from '@/components/CategorySection';
import FeaturedBusinesses from '@/components/FeaturedBusinesses';
import TestimonialSection from '@/components/TestimonialSection';
import CallToAction from '@/components/CallToAction';
import CtaSection from '@/components/CtaSection';
import { initializeData } from '@/lib/csv-utils';

const Index = () => {
  // Smooth scroll to top on page load and initialize data
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    
    // Initialize business data on page load
    const loadData = async () => {
      try {
        await initializeData();
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };
    
    loadData();
  }, []);

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
