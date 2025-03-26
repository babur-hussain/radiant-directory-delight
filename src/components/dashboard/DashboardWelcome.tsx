
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/types/auth";

interface DashboardWelcomeProps {
  role: UserRole;
}

const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({ role }) => {
  const { user } = useAuth();
  const userName = user?.name || "there";
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  const getQuote = () => {
    const quotes = [
      "Every day is a new opportunity to grow your business.",
      "Success is not the key to happiness. Happiness is the key to success.",
      "The secret to getting ahead is getting started.",
      "Your brand is what people say about you when you're not in the room.",
      "Don't watch the clock; do what it does. Keep going.",
    ];
    
    return quotes[Math.floor(Math.random() * quotes.length)];
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {getGreeting()}, {userName}!
        </CardTitle>
        <CardDescription>
          {role === "Influencer" 
            ? "Track your performance and services as an influencer" 
            : "Monitor your business growth and marketing campaigns"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="italic text-muted-foreground">{getQuote()}</p>
      </CardContent>
    </Card>
  );
};

export default DashboardWelcome;
