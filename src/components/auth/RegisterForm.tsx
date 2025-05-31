
import React, { useState, useEffect } from "react";
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
import { getReferralIdFromURL, validateReferralId } from "@/utils/referral/referralUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, AlertCircle, Sparkles, UserPlus, Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Building } from "lucide-react";

// Define the form validation schema with stronger validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name must be less than 50 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: "Password must contain at least one uppercase letter, one lowercase letter, and one number." }),
  confirmPassword: z.string().min(8, { message: "Please confirm your password." }),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  businessName: z.string().optional(),
  businessCategory: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  referralCode: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

const RegisterForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("User");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState<string>("");
  const [signupError, setSignupError] = useState<string | null>(null);
  const [isValidReferral, setIsValidReferral] = useState<boolean | null>(null);
  const [referralChecking, setReferralChecking] = useState<boolean>(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      city: "",
      country: "",
      businessName: "",
      businessCategory: "",
      website: "",
      referralCode: ""
    },
    mode: "onChange",
  });
  
  // Get referral code from URL if present
  useEffect(() => {
    const urlReferralCode = getReferralIdFromURL();
    if (urlReferralCode) {
      setReferralCode(urlReferralCode);
      form.setValue("referralCode", urlReferralCode);
      validateReferralCode(urlReferralCode);
    }
  }, [form]);
  
  const onSelectType = (type: UserRole) => {
    if (type === "User" || type === "Business" || type === "Influencer") {
      setSelectedRole(type);
    }
  };

  const validateReferralCode = async (code: string) => {
    if (!code) {
      setIsValidReferral(null);
      return;
    }
    
    setReferralChecking(true);
    try {
      const isValid = await validateReferralId(code);
      setIsValidReferral(isValid);
    } catch (error) {
      console.error('Error validating referral code:', error);
      setIsValidReferral(false);
    } finally {
      setReferralChecking(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setSignupError(null);
    
    try {
      console.log('Starting registration process for:', data.email);
      
      const refCode = data.referralCode || referralCode;
      
      // Prepare additional data based on user role
      const additionalData: any = {};
      
      // Add common fields
      if (data.phone) additionalData.phone = data.phone;
      if (data.city) additionalData.city = data.city;
      if (data.country) additionalData.country = data.country;
      
      // Add role-specific fields
      if (selectedRole === "Business") {
        if (data.businessName) additionalData.businessName = data.businessName;
        if (data.businessCategory) additionalData.businessCategory = data.businessCategory;
        if (data.website) additionalData.website = data.website;
      }
      
      // Add referral code if present
      if (refCode) {
        additionalData.referralId = refCode;
      }
      
      console.log('Registration data prepared:', { 
        email: data.email, 
        role: selectedRole, 
        hasReferral: !!refCode 
      });
      
      // Register the user with auth service
      const result = await signup(data.email, data.password, data.name, selectedRole, additionalData);
      
      if (!result || (result as any).error) {
        const errorMsg = (result as any)?.error?.message || "Registration failed. Please try again.";
        console.error("Registration failed:", errorMsg);
        setSignupError(errorMsg);
        
        toast({
          title: "Registration failed",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }
      
      if (result.id) {
        console.log('Registration successful:', result.id);
        
        // Track referral if a referral code was provided
        if (refCode) {
          try {
            await trackReferral(refCode, result.id, selectedRole);
            console.log('Referral tracked successfully');
          } catch (error) {
            console.error("Error tracking referral:", error);
            // Don't fail the registration if referral tracking fails
          }
        }
        
        toast({
          title: "Welcome aboard! 🎉",
          description: "Your account has been created successfully. Please check your email to verify your account.",
        });
        
        // Clear form
        form.reset();
        
        // Redirect after successful registration
        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.message) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('user already registered')) {
          errorMessage = "An account with this email already exists. Please sign in instead.";
        } else if (errorMsg.includes('invalid email')) {
          errorMessage = "Please enter a valid email address.";
        } else if (errorMsg.includes('weak password')) {
          errorMessage = "Password is too weak. Please choose a stronger password.";
        } else if (errorMsg.includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setSignupError(errorMessage);
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle referral code changes
  const handleReferralCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setReferralCode(code);
    form.setValue("referralCode", code);
    
    if (code) {
      validateReferralCode(code);
    } else {
      setIsValidReferral(null);
    }
  };

  return (
    <div className="space-y-6">
      <RegisterTypeSelector 
        onSelectType={onSelectType}
        selectedType={selectedRole}
      />
      
      {signupError && (
        <Alert variant="destructive" className="text-sm rounded-xl border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{signupError}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Full Name *</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input 
                      placeholder="Enter your full name" 
                      autoComplete="name"
                      {...field} 
                      className="pl-12 h-12 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 hover:border-gray-300"
                    />
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
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
                <FormLabel className="text-gray-700 font-medium">Email Address *</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input 
                      type="email" 
                      placeholder="Enter your email" 
                      autoComplete="email"
                      {...field} 
                      className="pl-12 h-12 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 hover:border-gray-300"
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Password *</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input 
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password" 
                        autoComplete="new-password"
                        {...field} 
                        className="pl-12 pr-12 h-12 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 hover:border-gray-300"
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-purple-500 transition-colors focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Confirm Password *</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input 
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password" 
                        autoComplete="new-password"
                        {...field} 
                        className="pl-12 pr-12 h-12 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 hover:border-gray-300"
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-purple-500 transition-colors focus:outline-none"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input 
                        type="tel" 
                        placeholder="Phone number" 
                        autoComplete="tel"
                        {...field} 
                        className="pl-12 h-12 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 hover:border-gray-300"
                      />
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">City</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input 
                        placeholder="Your city" 
                        autoComplete="address-level2"
                        {...field} 
                        className="pl-12 h-12 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 hover:border-gray-300"
                      />
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Country</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input 
                      placeholder="Your country" 
                      autoComplete="country-name"
                      {...field} 
                      className="pl-12 h-12 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 hover:border-gray-300"
                    />
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {selectedRole === "Business" && (
            <>
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Business Name</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input 
                          placeholder="Your business name" 
                          autoComplete="organization"
                          {...field} 
                          className="pl-12 h-12 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 hover:border-gray-300"
                        />
                        <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Business Category</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Restaurant, Retail, etc." 
                          {...field} 
                          className="h-12 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 hover:border-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Website</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://www.example.com" 
                          autoComplete="url"
                          {...field} 
                          className="h-12 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 hover:border-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}
          
          <FormField
            control={form.control}
            name="referralCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1 text-gray-700 font-medium">
                  Referral Code 
                  <span className="text-xs text-gray-500">(Optional)</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter referral code"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleReferralCodeChange(e);
                      }}
                      className={`h-12 border-2 rounded-xl bg-white/80 backdrop-blur-sm pr-12 transition-all duration-200 hover:border-gray-300 ${
                        isValidReferral === true
                          ? "border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                          : isValidReferral === false
                          ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          : "border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                      }`}
                    />
                    {isValidReferral === true && (
                      <Check className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                    )}
                    {isValidReferral === false && (
                      <AlertCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
                    )}
                  </div>
                </FormControl>
                {referralCode && isValidReferral !== null && !referralChecking && (
                  <Alert className={`mt-2 p-3 rounded-xl border-2 ${isValidReferral ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    <AlertDescription className={`text-sm font-medium ${isValidReferral ? "text-green-700" : "text-red-700"}`}>
                      {isValidReferral 
                        ? "✅ Valid referral code! You'll get special benefits." 
                        : "❌ Invalid referral code. Please check and try again."}
                    </AlertDescription>
                  </Alert>
                )}
                {referralChecking && (
                  <div className="text-sm text-purple-600 mt-2 font-medium">🔍 Validating referral code...</div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 mt-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
            disabled={isLoading || !form.formState.isValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating your account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-5 w-5" />
                Create Account
                <Sparkles className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
