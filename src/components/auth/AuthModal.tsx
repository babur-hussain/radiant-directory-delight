
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { UserRole } from "@/types/auth";
import { LogIn, UserPlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  // Handle close with cleanup
  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset state when closing modal
      setTimeout(() => {
        setAuthTab("login");
        setRegisterType(null);
      }, 200); // Delay to allow animation to complete
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 sticky top-0 bg-background z-10">
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
          <TabsList className="grid w-full grid-cols-2 px-6 sticky top-[80px] bg-background z-10">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Register
            </TabsTrigger>
          </TabsList>

          <div className="px-6 pb-6 pt-2 h-[calc(90vh-180px)]">
            <ScrollArea className="h-full pr-4">
              <TabsContent value="login" className="m-0 mt-2">
                <LoginForm onClose={() => onOpenChange(false)} />
              </TabsContent>

              <TabsContent value="register" className="m-0 mt-2">
                {!registerType ? (
                  <RegisterTypeSelector onSelectType={setRegisterType} />
                ) : (
                  <RegisterForm 
                    onSignup={() => {}}  
                    onBack={() => setRegisterType(null)} 
                    onClose={() => onOpenChange(false)} 
                  />
                )}
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
