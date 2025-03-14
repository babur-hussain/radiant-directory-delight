
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { UserRole } from "@/contexts/AuthContext";
import { LogIn, UserPlus } from "lucide-react";

// Import refactored components
import LoginForm from "./LoginForm";
import RegisterTypeSelector from "./RegisterTypeSelector";
import RegisterForm from "./RegisterForm";

type AuthModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onOpenChange }) => {
  const [authTab, setAuthTab] = useState<string>("login");
  const [registerType, setRegisterType] = useState<UserRole>(null);

  // Reset registration type when switching tabs
  const handleTabChange = (value: string) => {
    setAuthTab(value);
    if (value === "register") {
      setRegisterType(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {authTab === "login" ? "Login to Your Account" : 
             registerType ? `Register as ${registerType}` : "Choose Registration Type"}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            {authTab === "login" 
              ? "Enter your credentials to access your account" 
              : "Create a new account to get started"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={authTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm onClose={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="register">
            {!registerType ? (
              <RegisterTypeSelector onSelectType={setRegisterType} />
            ) : (
              <RegisterForm 
                registerType={registerType} 
                onBack={() => setRegisterType(null)} 
                onClose={() => onOpenChange(false)} 
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
