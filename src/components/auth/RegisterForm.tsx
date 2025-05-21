
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import RegisterTypeSelector from "./RegisterTypeSelector";
import { UserRole } from "@/types/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { trackReferral } from "@/services/referralService";

// Define the form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type FormData = z.infer<typeof formSchema>;

const RegisterForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("User");
  const { register: authRegister } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref") || "";
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  
  const onSelectType = (type: UserRole) => {
    // Ensure type is one of the allowed user roles
    if (type === "User" || type === "Business" || type === "Influencer") {
      setSelectedRole(type);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      // Register the user with auth service
      const result = await authRegister(data.email, data.password, data.name);
      
      if (!result || result.error) {
        // Handle registration error
        toast({
          title: "Registration failed",
          description: result?.error?.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
        console.error("Registration error:", result?.error);
      } else if (result.user) {
        // Track referral if a referral code was provided
        if (referralCode) {
          try {
            await trackReferral(referralCode, result.user.uid, selectedRole);
          } catch (error) {
            console.error("Error tracking referral:", error);
            // Don't fail the registration if referral tracking fails
          }
        }
        
        toast({
          title: "Registration successful",
          description: "Your account has been created.",
        });
        
        // Redirect after successful registration
        navigate("/profile");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: (error as Error).message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <RegisterTypeSelector 
        onSelectType={onSelectType}
        selectedType={selectedRole}
      />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Create a password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
