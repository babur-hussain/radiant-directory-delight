
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
  const [initialRender, setInitialRender] = useState(false);

  // Smooth scroll to top on page load and initialize data
  useEffect(() => {
    console.log("Index page mounting - attempting to load data");
    // Mark initial render completed
    setInitialRender(true);
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    
    // Set a timeout to ensure the component renders even if initialization hangs
    const loadingTimeout = setTimeout(() => {
      console.log("Data loading timeout reached, showing content anyway");
      setIsLoading(false);
    }, 1000); // 1 second timeout - reduced for faster display
    
    // Initialize business data on page load
    const loadData = async () => {
      try {
        console.log("Initializing data from csv-utils");
        await initializeData();
        console.log("Data initialized successfully");
        // Ensure we show the page even if there's no data
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing data:", error);
        setError("Failed to initialize data, but continuing with static content");
        setIsLoading(false);
        
        // Show toast notification of error but don't block rendering
        toast({
          title: "Connection Issue",
          description: "Using local data - some features may be limited",
          variant: "destructive",
        });
      } finally {
        clearTimeout(loadingTimeout);
      }
    };
    
    loadData();
    
    // Add a failsafe to show content
    if (!document.body.innerHTML || document.body.innerHTML.length < 100) {
      console.log("Empty body detected, forcing content render");
      setIsLoading(false);
    }

    return () => clearTimeout(loadingTimeout);
  }, [toast]);

  // Add emergency fallback content
  if (!initialRender && document.body.children.length <= 1) {
    console.log("Emergency fallback content rendered");
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Welcome to Grow Bharat Vyapaar</h1>
        <p className="mt-4">Loading content...</p>
        <Loading size="md" />
      </div>
    );
  }

  // Show a loading indicator while data is being initialized, but with a shorter wait
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/90 p-6">
        <Loading size="xl" message="Loading content..." />
        <p className="mt-4 text-muted-foreground">Please wait while we set up the page for you</p>
      </div>
    );
  }

  // Show any error that occurred during initialization, but still render content
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
