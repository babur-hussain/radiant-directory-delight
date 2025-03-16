
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
    
    // Set a timeout to ensure the component renders even if initialization hangs
    const loadingTimeout = setTimeout(() => {
      console.log("Data loading timeout reached, showing content anyway");
      setIsLoading(false);
    }, 2000); // 2 second timeout
    
    // Initialize business data on page load
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
      } finally {
        clearTimeout(loadingTimeout);
        setIsLoading(false);
      }
    };
    
    loadData();

    return () => clearTimeout(loadingTimeout);
  }, [toast]);

  // Show a loading indicator while data is being initialized
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/90 p-6">
        <Loading size="xl" message="Loading content..." />
        <p className="mt-4 text-muted-foreground">Please wait while we set up the page for you</p>
      </div>
    );
  }

  // Show any error that occurred during initialization
  if (error) {
    console.log("Rendering with error:", error);
  }

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
