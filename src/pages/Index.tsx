
import { useEffect } from 'react';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import CategorySection from '@/components/CategorySection';
import FeaturedBusinesses from '@/components/FeaturedBusinesses';
import TestimonialSection from '@/components/TestimonialSection';
import CallToAction from '@/components/CallToAction';
import CtaSection from '@/components/CtaSection';
import { initializeData } from '@/lib/csv-utils';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();

  // Initialize data in the background without blocking rendering
  useEffect(() => {
    console.log("Index page mounting");
    
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'auto', // Changed to auto for faster scrolling
    });
    
    // Initialize business data in the background with a timeout
    const initializeTimeout = setTimeout(() => {
      const loadData = async () => {
        try {
          console.log("Initializing data from csv-utils");
          await initializeData();
          console.log("Data initialized successfully");
        } catch (error) {
          console.error("Error initializing data:", error);
          
          // Show toast notification of error but don't block rendering
          toast({
            title: "Using Local Data",
            description: "Working with offline content",
            variant: "default",
          });
        }
      };
      
      loadData().catch(console.error);
    }, 1000); // Delay data initialization to prioritize UI rendering
    
    return () => clearTimeout(initializeTimeout);
  }, [toast]);

  // Always render content immediately, no loading state
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
