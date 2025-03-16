
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { 
  Sheet,
  SheetContent,
  SheetTrigger 
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className="dashboard-layout flex min-h-screen w-full bg-gray-50 dark:bg-gray-900 pt-16"> {/* Added w-full */}
      <div className="hidden md:block md:w-64 flex-shrink-0">
        <div className="fixed h-screen w-64 overflow-y-auto border-r bg-white dark:bg-gray-800 pt-16">
          <DashboardSidebar userRole={user?.role} />
        </div>
      </div>
      
      <div className="flex-1 md:ml-64 flex flex-col w-full"> {/* Added w-full */}
        <header className="dashboard-header md:hidden sticky top-16 left-0 right-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-4 border-b flex items-center justify-between">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 z-[99999]">
                <div className="h-full overflow-y-auto pt-16">
                  <DashboardSidebar userRole={user?.role} />
                </div>
              </SheetContent>
            </Sheet>
            
            <h1 className="text-xl font-semibold">Dashboard</h1>
            
            <div className="w-9"></div>
          </div>
        </header>
        
        <header className="dashboard-header hidden md:block sticky top-16 left-0 right-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
          <DashboardHeader />
        </header>
        
        <main className="p-4 md:p-6 w-full flex-grow"> {/* Changed max-w-7xl to w-full */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
