
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Upload, 
  Store, 
  Users, 
  ListChecks, 
  Database, 
  Settings, 
  Layout, 
  Layers, 
  History, 
  BarChartBig, 
  Hash,
  VideoIcon
} from "lucide-react";

interface AdminSidebarProps {
  onItemClick?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onItemClick }) => {
  const navLinkClasses = "flex items-center px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-md transition-colors";
  const activeNavLinkClasses = "bg-primary text-white hover:bg-primary hover:text-white";
  
  const handleClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <div className="py-6 px-4">
      <h2 className="text-lg font-semibold mb-6 px-3">Admin Dashboard</h2>
      
      <div className="space-y-1">
        <NavLink 
          to="/admin" 
          onClick={handleClick}
          className={({ isActive }) => 
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
          end
        >
          <Home className="h-4 w-4 mr-2" />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/admin/businesses" 
          onClick={handleClick}
          className={({ isActive }) => 
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <Store className="h-4 w-4 mr-2" />
          <span>Businesses</span>
        </NavLink>
        
        <NavLink 
          to="/admin/upload" 
          onClick={handleClick}
          className={({ isActive }) => 
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <Upload className="h-4 w-4 mr-2" />
          <span>CSV Upload</span>
        </NavLink>
        
        <NavLink 
          to="/admin/videos" 
          onClick={handleClick}
          className={({ isActive }) => 
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <VideoIcon className="h-4 w-4 mr-2" />
          <span>Videos</span>
        </NavLink>
        
        <NavLink 
          to="/admin/users" 
          onClick={handleClick}
          className={({ isActive }) => 
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <Users className="h-4 w-4 mr-2" />
          <span>Users</span>
        </NavLink>
        
        <NavLink 
          to="/admin/subscriptions" 
          onClick={handleClick}
          className={({ isActive }) => 
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <ListChecks className="h-4 w-4 mr-2" />
          <span>Subscriptions</span>
        </NavLink>
        
        <NavLink 
          to="/admin/analytics" 
          onClick={handleClick}
          className={({ isActive }) => 
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <BarChartBig className="h-4 w-4 mr-2" />
          <span>Analytics</span>
        </NavLink>
        
        <div className="pt-4 pb-2">
          <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Dashboard Management
          </div>
        </div>
        
        <NavLink 
          to="/admin/dashboard-manager" 
          onClick={handleClick}
          className={({ isActive }) => 
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <Layout className="h-4 w-4 mr-2" />
          <span>Dashboard Manager</span>
        </NavLink>
        
        <NavLink 
          to="/admin/dashboard-sections" 
          onClick={handleClick}
          className={({ isActive }) => 
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <Layers className="h-4 w-4 mr-2" />
          <span>Dashboard Sections</span>
        </NavLink>
        
        <NavLink 
          to="/admin/dashboard-services" 
          onClick={handleClick}
          className={({ isActive }) => 
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <Hash className="h-4 w-4 mr-2" />
          <span>Dashboard Services</span>
        </NavLink>
        
        <div className="pt-4 pb-2">
          <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            System
          </div>
        </div>
        
        <NavLink 
          to="/admin/database" 
          onClick={handleClick}
          className={({ isActive }) => 
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <Database className="h-4 w-4 mr-2" />
          <span>Database</span>
        </NavLink>
        
        <NavLink 
          to="/admin/migration" 
          onClick={handleClick}
          className={({ isActive }) => 
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <History className="h-4 w-4 mr-2" />
          <span>Migration</span>
        </NavLink>
        
        <NavLink 
          to="/admin/settings" 
          onClick={handleClick}
          className={({ isActive }) => 
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <Settings className="h-4 w-4 mr-2" />
          <span>Settings</span>
        </NavLink>
        
        <NavLink 
          to="/admin/seed" 
          onClick={handleClick}
          className={({ isActive }) => 
            cn(navLinkClasses, isActive && activeNavLinkClasses)
          }
        >
          <Hash className="h-4 w-4 mr-2" />
          <span>Seed Data</span>
        </NavLink>
      </div>
    </div>
  );
};

export default AdminSidebar;
