
import React, { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, Settings, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserMenu = () => {
  const { currentUser, user, initialized, logout } = useAuth();
  const navigate = useNavigate();
  
  // Combined user data from either source
  const userData = currentUser || user;
  
  // Log for debugging
  useEffect(() => {
    console.log("UserMenu rendering with user:", { 
      currentUserId: currentUser?.id,
      userId: user?.id, 
      initialized 
    });
  }, [currentUser, user, initialized]);
  
  // Get first letter of name for avatar fallback
  const getInitials = () => {
    if (userData?.displayName) {
      return userData.displayName.charAt(0).toUpperCase();
    }
    if (userData?.name) {
      return userData.name.charAt(0).toUpperCase();
    }
    if (userData?.email) {
      return userData.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Handle profile option click
  const handleProfileClick = () => {
    navigate("/profile");
  };

  // Handle subscription details click
  const handleSubscriptionClick = () => {
    navigate("/subscription/details");
  };

  // Add logout handler to properly call the logout function and redirect
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to home page after logout
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Don't render until auth is initialized and we have a user
  if (!initialized || !userData) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            {userData?.photoURL ? (
              <AvatarImage src={userData.photoURL} alt={userData?.displayName || userData?.name || "User"} />
            ) : (
              <AvatarFallback>{getInitials()}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{userData?.displayName || userData?.name}</span>
            <span className="text-xs text-muted-foreground truncate">{userData?.email}</span>
            {userData?.role && (
              <span className="text-xs font-medium mt-1 bg-primary/10 text-primary rounded-full px-2 py-0.5 inline-block w-fit">
                {userData.role}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileClick}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSubscriptionClick}>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Subscription</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleProfileClick}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
