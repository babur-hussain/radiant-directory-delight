
import React from "react";
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
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar - fixed position so it doesn't collapse */}
      <div className="hidden md:block md:w-64 flex-shrink-0">
        <div className="fixed h-screen w-64">
          <AdminSidebar />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 md:ml-64">
        {/* Mobile menu drawer */}
        <div className="md:hidden p-4 border-b bg-card flex items-center">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="icon" className="mr-4">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="py-4">
                <AdminSidebar />
              </div>
            </DrawerContent>
          </Drawer>
          
          <h1 className="text-xl font-semibold">Admin Panel</h1>
        </div>
        
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
