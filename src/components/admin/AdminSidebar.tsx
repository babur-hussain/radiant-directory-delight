
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Database, 
  Upload, 
  Package, 
  FileSpreadsheet, 
  Settings, 
  Users, 
  BarChart3,
  ArrowLeftRight,
  Rocket,
  ListChecks,
  Activity,
} from "lucide-react";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    {
      title: "Dashboard Overview",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Business Listings",
      href: "/admin/businesses",
      icon: <FileSpreadsheet className="h-5 w-5" />,
    },
    {
      title: "User Management",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Subscriptions",
      href: "/admin/subscriptions",
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: "Dashboard Sections",
      href: "/admin/dashboard-sections",
      icon: <ListChecks className="h-5 w-5" />,
    },
    {
      title: "Data Migration",
      href: "/admin/migration",
      icon: <ArrowLeftRight className="h-5 w-5" />,
    },
    {
      title: "Database",
      href: "/admin/database",
      icon: <Database className="h-5 w-5" />,
    },
    {
      title: "CSV Upload",
      href: "/admin/upload",
      icon: <Upload className="h-5 w-5" />,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Seed Data",
      href: "/admin/seed",
      icon: <Rocket className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    }
  ];
  
  return (
    <div className="hidden border-r bg-card md:flex md:w-64 md:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">A</div>
          <span className="text-lg font-semibold">Admin Panel</span>
        </div>
      </div>
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="flex flex-col gap-2">
          {navItems.map((item, index) => {
            // Determine if this is the active route (considering nested routes)
            const isActive = location.pathname === item.href || 
                            (item.href !== "/admin/dashboard" && location.pathname.startsWith(item.href));
            
            return (
              <Button
                key={index}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2",
                  isActive && "bg-secondary"
                )}
                onClick={() => navigate(item.href)}
              >
                {item.icon}
                {item.title}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="border-t p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2" 
          onClick={() => navigate("/admin/diagnostics")}
        >
          <Activity className="h-5 w-5" />
          System Diagnostics
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
