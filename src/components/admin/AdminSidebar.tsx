
import React from "react";
import { NavLink } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Building2,
  Upload,
  Users,
  BarChart3,
  Settings
} from "lucide-react";

interface AdminSidebarProps {
  onItemClick?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onItemClick }) => {
  const location = useLocation();
  
  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: location.pathname === "/admin"
    },
    {
      title: "Business Listings", 
      href: "/admin/businesses",
      icon: Building2,
      active: location.pathname === "/admin/businesses"
    },
    {
      title: "Influencer Listings", 
      href: "/admin/influencers",
      icon: Users,
      active: location.pathname === "/admin/influencers"
    },
    {
      title: "CSV Upload",
      href: "/admin/upload", 
      icon: Upload,
      active: location.pathname === "/admin/upload"
    },
    {
      title: "User Management",
      href: "/admin/users",
      icon: Users,
      active: location.pathname === "/admin/users"
    },
    {
      title: "Analytics",
      href: "/admin/analytics", 
      icon: BarChart3,
      active: location.pathname === "/admin/analytics"
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
      active: location.pathname === "/admin/settings"
    }
  ];

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <div className="py-4 text-gray-700 dark:text-gray-400">
      <p className="px-6 text-sm font-bold uppercase">Admin Panel</p>
      <nav className="mt-6 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.href}
            onClick={handleItemClick}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-6 py-3 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                isActive
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                  : ""
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
