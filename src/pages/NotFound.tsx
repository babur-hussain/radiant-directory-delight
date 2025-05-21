
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const NotFound = () => {
  // Try to use location, but with a fallback if we're outside Router context
  let pathname = "/unknown";
  let locationAvailable = true;
  
  try {
    const location = useLocation();
    pathname = location.pathname;
  } catch (error) {
    locationAvailable = false;
    console.warn("NotFound component rendered outside Router context");
  }

  useEffect(() => {
    if (locationAvailable) {
      console.error(
        "404 Error: User attempted to access non-existent route:",
        pathname
      );
    }
  }, [pathname, locationAvailable]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <h1 className="text-9xl font-bold text-primary/20">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="rounded-full transition-colors">
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
