
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Attempted to access non-existent route:",
      location.pathname,
      "Full URL:",
      window.location.href
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <h1 className="text-9xl font-bold text-primary/20">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-2">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="text-gray-500 mb-8">
          <strong>Current path:</strong> {location.pathname}
        </p>
        <div className="space-y-4">
          <Button asChild className="rounded-full transition-smooth w-full">
            <Link to="/">Return to Home</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full transition-smooth w-full">
            <Link to="/admin/dashboard">Go to Admin Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
