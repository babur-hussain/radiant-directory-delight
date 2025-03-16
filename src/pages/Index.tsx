
import { useEffect, useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Smooth scroll to top on page load and initialize data
  useEffect(() => {
    console.log("Index page mounting - attempting to load data");
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    
    // Initialize business data on page load
    const loadData = async () => {
      try {
        setIsLoading(true);
        await initializeData();
        console.log("Data initialized successfully");
      } catch (error) {
        console.error("Error initializing data:", error);
        setError("Failed to initialize data, but continuing with static content");
        
        // Show toast notification of error but don't block rendering
        toast({
          title: "Connection Issue",
          description: "Using local data - some features may be limited",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  // Always render content, even if there's an error with data initialization
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
