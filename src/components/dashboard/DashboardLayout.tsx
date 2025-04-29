
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
import { getRoleAsString } from "@/types/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface DashboardSidebarProps {
  userRole?: string;
  onItemClick?: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userRole = user?.role ? getRoleAsString(user.role) : "";
  
  return (
    <div className="dashboard-layout flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      <div className="hidden md:block md:w-64 flex-shrink-0">
        <div className="fixed h-screen w-64 overflow-y-auto border-r bg-white dark:bg-gray-800 pt-16">
          <DashboardSidebar userRole={userRole} />
        </div>
      </div>
      
      <div className="flex-1 md:ml-64 flex flex-col w-full">
        <header className="dashboard-header md:hidden sticky top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-4 border-b flex items-center justify-between">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 pt-16 z-[99999]">
                <div className="h-full overflow-y-auto">
                  <DashboardSidebar 
                    userRole={userRole}
                    onItemClick={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
            
            <h1 className="text-xl font-semibold">Dashboard</h1>
            
            <div className="w-9"></div>
          </div>
        </header>
        
        <header className="dashboard-header hidden md:block sticky top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
          <DashboardHeader />
        </header>
        
        <main className="p-4 md:p-6 w-full flex-grow overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
