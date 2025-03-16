
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
import Loading from '@/components/ui/loading';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false); // Start with false to show content immediately
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize data in the background without blocking rendering
  useEffect(() => {
    console.log("Index page mounting - loading data in the background");
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    
    // Initialize business data in the background
    const loadData = async () => {
      try {
        console.log("Initializing data from csv-utils");
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
      }
    };
    
    // Load data in the background without blocking rendering
    loadData();
    
    // Force content to show even if there's an error
    const forceTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(forceTimeout);
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
