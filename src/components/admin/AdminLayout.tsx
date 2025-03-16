
import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { 
  Drawer,
  DrawerContent,
  DrawerTrigger 
} from "@/components/ui/drawer";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  // Add state to control drawer visibility
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  return (
    <div className="admin-layout flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar - fixed position so it doesn't collapse */}
      <div className="hidden md:block md:w-64 flex-shrink-0">
        <div className="fixed h-screen w-64 overflow-y-auto">
          <AdminSidebar />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile header - sticky positioning ensures it's always visible */}
        <header className="admin-header md:hidden sticky top-0 left-0 right-0 z-50 bg-white shadow-sm">
          <div className="p-4 border-b bg-card flex items-center">
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline" size="icon" className="mr-4">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="py-4">
                  <AdminSidebar onItemClick={() => setIsDrawerOpen(false)} />
                </div>
              </DrawerContent>
            </Drawer>
            
            <h1 className="text-xl font-semibold">Admin Panel</h1>
          </div>
        </header>
        
        {/* Desktop header - show on desktop only, sticky positioning with higher z-index */}
        <header className="admin-header hidden md:block sticky top-0 left-0 right-0 z-50 bg-white shadow-sm">
          <div className="p-4 border-b bg-card">
            <h1 className="text-xl font-semibold">Admin Panel</h1>
          </div>
        </header>
        
        <main className="p-4 md:p-6 max-w-7xl mx-auto w-full flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
