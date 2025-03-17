
import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { 
  Sheet,
  SheetContent,
  SheetTrigger 
} from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className="admin-layout flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar - fixed position so it doesn't collapse */}
      <div className="hidden md:block md:w-64 flex-shrink-0">
        <div className="fixed h-screen w-64 overflow-y-auto border-r bg-white dark:bg-gray-800 pt-16">
          <AdminSidebar />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen w-full">
        {/* Mobile header with sheet sidebar */}
        <header className="md:hidden sticky top-16 left-0 right-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
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
                  <AdminSidebar onItemClick={() => setIsMobileMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            
            {/* Empty div to balance the flex layout */}
            <div className="w-9"></div>
          </div>
        </header>
        
        <main className="p-4 md:p-6 w-full flex-grow overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
