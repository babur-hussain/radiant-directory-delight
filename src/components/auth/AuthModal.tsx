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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type AuthModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onOpenChange }) => {
  const [authTab, setAuthTab] = useState<string>("login");
  const [registerType, setRegisterType] = useState<UserRole>(null);
  const { signup, login, loginWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleTabChange = (value: string) => {
    setAuthTab(value);
    if (value === "register") {
      setRegisterType(null);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setAuthTab("login");
        setRegisterType(null);
      }, 200);
    }
    onOpenChange(open);
  };

  const handleLogin = async (email: string, password: string, employeeCode?: string): Promise<void> => {
    try {
      const isDefaultAdmin = email.toLowerCase() === 'baburhussain660@gmail.com';
      
      await login(email, password, employeeCode);
      
      if (isDefaultAdmin) {
        toast({
          title: "Admin login successful",
          description: "Welcome to the admin dashboard",
        });
      }
      
      onOpenChange(false);
      return Promise.resolve();
    } catch (error) {
      console.error("Error in handleLogin:", error);
      
      if (error instanceof Error && error.message.includes("Email not confirmed")) {
        return Promise.reject(error);
      }
      
      return Promise.reject(error);
    }
  };

  const handleSignup = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    additionalData?: any
  ): Promise<void> => {
    try {
      const isDefaultAdmin = email.toLowerCase() === 'baburhussain660@gmail.com';
      
      await signup(email, password, name, isDefaultAdmin ? 'Admin' : role, additionalData);
      
      let message = `Your account has been created as a ${isDefaultAdmin ? 'Admin' : role}.`;
      
      message += " Please check your email for a verification link.";
      
      toast({
        title: "Registration successful",
        description: message,
      });
      
      if (isDefaultAdmin) {
        toast({
          title: "Admin Account",
          description: "This account has been set as an admin account",
        });
      }
      
      setAuthTab("login");
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error in handleSignup:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  const getDialogTitle = () => {
    if (authTab === "login") {
      return "Login to Your Account";
    } else if (!registerType) {
      return "Choose Registration Type";
    } else {
      return `Register as ${registerType}`;
    }
  };

  const getDialogDescription = () => {
    if (authTab === "login") {
      return "Enter your credentials to access your account";
    } else if (!registerType) {
      return "Select the type of account you want to create";
    } else {
      const descriptions = {
        User: "Create a personal account to explore our platform",
        Business: "Register your business to connect with influencers",
        Influencer: "Join as an influencer to collaborate with businesses",
        Staff: "Join as a staff member to help manage the platform"
      };
      return descriptions[registerType] || "Create a new account to get started";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 sticky top-0 bg-background z-10">
          <DialogTitle className="text-xl font-bold text-center">
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            {getDialogDescription()}
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
                <LoginForm 
                  onLogin={handleLogin} 
                  onClose={() => onOpenChange(false)} 
                />
              </TabsContent>

              <TabsContent value="register" className="m-0 mt-2">
                {!registerType ? (
                  <RegisterTypeSelector onSelectType={setRegisterType} selectedType={registerType} />
                ) : (
                  <RegisterForm 
                    registerType={registerType} 
                    onBack={() => setRegisterType(null)} 
                    onClose={() => onOpenChange(false)} 
                    onSignup={handleSignup}
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
