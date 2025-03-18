
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/auth";
import { 
  LayoutDashboard, 
  BarChart3, 
  Star, 
  Search, 
  MapPin, 
  TrendingUp, 
  FileText, 
  Award, 
  VideoIcon, 
  PenTool, 
  Users, 
  Settings, 
  ExternalLink 
} from "lucide-react";

interface DashboardSidebarProps {
  userRole: UserRole;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Define navigation items based on user role
  const getNavItems = () => {
    if (userRole === "Influencer") {
      return [
        {
          title: "Dashboard",
          href: "/influencer-dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          title: "Reels Progress",
          href: "/influencer-dashboard/reels",
          icon: <VideoIcon className="h-5 w-5" />,
        },
        {
          title: "Creatives",
          href: "/influencer-dashboard/creatives",
          icon: <PenTool className="h-5 w-5" />,
        },
        {
          title: "Ratings & Reviews",
          href: "/influencer-dashboard/ratings",
          icon: <Star className="h-5 w-5" />,
        },
        {
          title: "SEO Optimization",
          href: "/influencer-dashboard/seo",
          icon: <Search className="h-5 w-5" />,
        },
        {
          title: "Google Listing",
          href: "/influencer-dashboard/google-listing",
          icon: <MapPin className="h-5 w-5" />,
        },
        {
          title: "Performance Metrics",
          href: "/influencer-dashboard/performance",
          icon: <BarChart3 className="h-5 w-5" />,
        },
        {
          title: "Leads Generated",
          href: "/influencer-dashboard/leads",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          title: "Rank & Earnings",
          href: "/influencer-dashboard/earnings",
          icon: <Award className="h-5 w-5" />,
        },
      ];
    } else if (userRole === "Business") {
      return [
        {
          title: "Dashboard",
          href: "/business-dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          title: "Marketing Campaigns",
          href: "/business-dashboard/campaigns",
          icon: <BarChart3 className="h-5 w-5" />,
        },
        {
          title: "Reels & Video Ads",
          href: "/business-dashboard/reels",
          icon: <VideoIcon className="h-5 w-5" />,
        },
        {
          title: "Creative Designs",
          href: "/business-dashboard/creatives",
          icon: <PenTool className="h-5 w-5" />,
        },
        {
          title: "Ratings & Reviews",
          href: "/business-dashboard/ratings",
          icon: <Star className="h-5 w-5" />,
        },
        {
          title: "SEO Optimization",
          href: "/business-dashboard/seo",
          icon: <Search className="h-5 w-5" />,
        },
        {
          title: "Google Listing",
          href: "/business-dashboard/google-listing",
          icon: <MapPin className="h-5 w-5" />,
        },
        {
          title: "Growth Analytics",
          href: "/business-dashboard/growth",
          icon: <TrendingUp className="h-5 w-5" />,
        },
        {
          title: "Leads & Inquiries",
          href: "/business-dashboard/leads",
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: "Reach & Visibility",
          href: "/business-dashboard/reach",
          icon: <ExternalLink className="h-5 w-5" />,
        },
      ];
    }
    
    // Default items if role is not determined
    return [
      {
        title: "Dashboard",
        href: "/",
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
      {
        title: "Settings",
        href: "/settings",
        icon: <Settings className="h-5 w-5" />,
      },
    ];
  };
  
  const navItems = getNavItems();
  
  return (
    <div className="hidden border-r bg-card md:flex md:w-64 md:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">D</div>
          <span className="text-lg font-semibold">Dashboard</span>
        </div>
      </div>
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="flex flex-col gap-2">
          {navItems.map((item, index) => (
            <Button
              key={index}
              variant={location.pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2",
                location.pathname === item.href && "bg-secondary"
              )}
              onClick={() => navigate(item.href)}
            >
              {item.icon}
              {item.title}
            </Button>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2" 
          onClick={() => navigate("/subscription")}
        >
          <Award className="h-5 w-5" />
          Upgrade Plan
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
