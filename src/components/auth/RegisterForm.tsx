
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import { Mail, Lock, User, Loader2, Phone, Instagram, Facebook, MapPin, Building, Globe, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SocialLoginButtons from "./SocialLoginButtons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormControl, Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface RegisterFormProps {
  registerType: UserRole;
  onBack: () => void;
  onClose: () => void;
}

// Define schema for Influencer registration
const influencerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Valid phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  instagramHandle: z.string().optional(),
  facebookHandle: z.string().optional(),
  niche: z.string().min(1, "Niche is required"),
  followersCount: z.string().min(1, "Followers count is required"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  bio: z.string().optional(),
});

// Define schema for Business registration
const businessSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Valid phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  businessCategory: z.string().min(1, "Business category is required"),
  website: z.string().optional(),
  instagramHandle: z.string().optional(),
  facebookHandle: z.string().optional(),
  street: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().optional(),
  gstNumber: z.string().optional(),
});

const businessCategories = [
  "Retail",
  "Food & Beverage",
  "Healthcare",
  "Technology",
  "Education",
  "Entertainment",
  "Travel",
  "Financial Services",
  "Real Estate",
  "Automotive",
  "Beauty & Wellness",
  "Home Services",
  "Professional Services",
  "Other"
];

const influencerNiches = [
  "Fashion",
  "Beauty",
  "Fitness",
  "Food",
  "Travel",
  "Lifestyle",
  "Gaming",
  "Technology",
  "Entertainment",
  "Education",
  "Business",
  "Health & Wellness",
  "Sports",
  "Parenting",
  "Photography",
  "Art & Design",
  "Music",
  "Other"
];

const followersRanges = [
  "1,000 - 5,000",
  "5,001 - 10,000",
  "10,001 - 50,000",
  "50,001 - 100,000",
  "100,001 - 500,000",
  "500,001 - 1,000,000",
  "1,000,000+"
];

const RegisterForm: React.FC<RegisterFormProps> = ({ registerType, onBack, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [businessLogo, setBusinessLogo] = useState<File | null>(null);
  
  const { toast } = useToast();
  const { signup, loginWithGoogle, loading, user } = useAuth();

  // Initialize form based on registration type
  const influencerForm = useForm<z.infer<typeof influencerSchema>>({
    resolver: zodResolver(influencerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      instagramHandle: "",
      facebookHandle: "",
      niche: "",
      followersCount: "",
      country: "",
      city: "",
      bio: "",
    }
  });

  const businessForm = useForm<z.infer<typeof businessSchema>>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessName: "",
      ownerName: "",
      email: "",
      phone: "",
      password: "",
      businessCategory: "",
      website: "",
      instagramHandle: "",
      facebookHandle: "",
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      gstNumber: "",
    }
  });

  const handleInfluencerSubmit = async (data: z.infer<typeof influencerSchema>) => {
    if (!registerType) {
      toast({
        title: "Registration error",
        description: "Please select a registration type.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Create additional data to send with registration
      const additionalData = {
        phone: data.phone,
        instagramHandle: data.instagramHandle || null,
        facebookHandle: data.facebookHandle || null,
        niche: data.niche,
        followersCount: data.followersCount,
        country: data.country,
        city: data.city,
        bio: data.bio || null,
        verified: false,
        createdAt: new Date().toISOString(),
      };

      await signup(
        data.email,
        data.password,
        data.fullName,
        registerType,
        additionalData
      );
      
      onClose();
    } catch (error) {
      // Error handling is in the context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBusinessSubmit = async (data: z.infer<typeof businessSchema>) => {
    if (!registerType) {
      toast({
        title: "Registration error",
        description: "Please select a registration type.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Create address object
      const address = {
        street: data.street || "",
        city: data.city,
        state: data.state,
        country: data.country,
        zipCode: data.zipCode || "",
      };

      // Create additional data to send with registration
      const additionalData = {
        businessName: data.businessName,
        ownerName: data.ownerName,
        phone: data.phone,
        businessCategory: data.businessCategory,
        website: data.website || null,
        instagramHandle: data.instagramHandle || null,
        facebookHandle: data.facebookHandle || null,
        address,
        gstNumber: data.gstNumber || null,
        verified: false,
        createdAt: new Date().toISOString(),
      };

      await signup(
        data.email,
        data.password,
        data.ownerName, // Using owner name as display name
        registerType,
        additionalData
      );
      
      onClose();
    } catch (error) {
      // Error handling is in the context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (error) {
      // Error handling is in the context
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file upload for profile picture/business logo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFileFunction: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) {
      setFileFunction(e.target.files[0]);
    }
  };

  return (
    <>
      {registerType === "Influencer" && (
        <Form {...influencerForm}>
          <form onSubmit={influencerForm.handleSubmit(handleInfluencerSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name*</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  {...influencerForm.register("fullName")}
                />
              </div>
              {influencerForm.formState.errors.fullName && (
                <p className="text-sm text-red-500">{influencerForm.formState.errors.fullName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email*</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...influencerForm.register("email")}
                />
              </div>
              {influencerForm.formState.errors.email && (
                <p className="text-sm text-red-500">{influencerForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone*</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="pl-10"
                  {...influencerForm.register("phone")}
                />
              </div>
              {influencerForm.formState.errors.phone && (
                <p className="text-sm text-red-500">{influencerForm.formState.errors.phone.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password*</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  {...influencerForm.register("password")}
                />
              </div>
              {influencerForm.formState.errors.password && (
                <p className="text-sm text-red-500">{influencerForm.formState.errors.password.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagramHandle">Instagram Handle</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="instagramHandle"
                    type="text"
                    placeholder="@yourusername"
                    className="pl-10"
                    {...influencerForm.register("instagramHandle")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebookHandle">Facebook Handle</Label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="facebookHandle"
                    type="text"
                    placeholder="@yourusername"
                    className="pl-10"
                    {...influencerForm.register("facebookHandle")}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="niche">Niche/Category*</Label>
              <Select 
                onValueChange={(value) => influencerForm.setValue("niche", value)}
                defaultValue={influencerForm.getValues("niche")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your niche" />
                </SelectTrigger>
                <SelectContent>
                  {influencerNiches.map((niche) => (
                    <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {influencerForm.formState.errors.niche && (
                <p className="text-sm text-red-500">{influencerForm.formState.errors.niche.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="followersCount">Followers Count*</Label>
              <Select 
                onValueChange={(value) => influencerForm.setValue("followersCount", value)}
                defaultValue={influencerForm.getValues("followersCount")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select followers range" />
                </SelectTrigger>
                <SelectContent>
                  {followersRanges.map((range) => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {influencerForm.formState.errors.followersCount && (
                <p className="text-sm text-red-500">{influencerForm.formState.errors.followersCount.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country*</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="country"
                    type="text"
                    placeholder="United States"
                    className="pl-10"
                    {...influencerForm.register("country")}
                  />
                </div>
                {influencerForm.formState.errors.country && (
                  <p className="text-sm text-red-500">{influencerForm.formState.errors.country.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City*</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="city"
                    type="text"
                    placeholder="New York"
                    className="pl-10"
                    {...influencerForm.register("city")}
                  />
                </div>
                {influencerForm.formState.errors.city && (
                  <p className="text-sm text-red-500">{influencerForm.formState.errors.city.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself"
                className="min-h-[100px]"
                {...influencerForm.register("bio")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profilePicture">Profile Picture</Label>
              <Input 
                id="profilePicture" 
                type="file" 
                accept="image/*"
                onChange={(e) => handleFileChange(e, setProfilePicture)} 
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack}
                className="flex-1"
                disabled={isSubmitting || loading}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isSubmitting || loading}
              >
                {(isSubmitting || loading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <SocialLoginButtons
              onGoogleLogin={handleGoogleLogin}
              isDisabled={isSubmitting || loading}
            />
          </form>
        </Form>
      )}

      {registerType === "Business" && (
        <Form {...businessForm}>
          <form onSubmit={businessForm.handleSubmit(handleBusinessSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name*</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Your Business Name"
                  className="pl-10"
                  {...businessForm.register("businessName")}
                />
              </div>
              {businessForm.formState.errors.businessName && (
                <p className="text-sm text-red-500">{businessForm.formState.errors.businessName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name*</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="ownerName"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  {...businessForm.register("ownerName")}
                />
              </div>
              {businessForm.formState.errors.ownerName && (
                <p className="text-sm text-red-500">{businessForm.formState.errors.ownerName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email*</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="business@example.com"
                  className="pl-10"
                  {...businessForm.register("email")}
                />
              </div>
              {businessForm.formState.errors.email && (
                <p className="text-sm text-red-500">{businessForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone*</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="pl-10"
                  {...businessForm.register("phone")}
                />
              </div>
              {businessForm.formState.errors.phone && (
                <p className="text-sm text-red-500">{businessForm.formState.errors.phone.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password*</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  {...businessForm.register("password")}
                />
              </div>
              {businessForm.formState.errors.password && (
                <p className="text-sm text-red-500">{businessForm.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessCategory">Business Category*</Label>
              <Select 
                onValueChange={(value) => businessForm.setValue("businessCategory", value)}
                defaultValue={businessForm.getValues("businessCategory")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business category" />
                </SelectTrigger>
                <SelectContent>
                  {businessCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {businessForm.formState.errors.businessCategory && (
                <p className="text-sm text-red-500">{businessForm.formState.errors.businessCategory.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourbusiness.com"
                  className="pl-10"
                  {...businessForm.register("website")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagramHandle">Instagram Handle</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="instagramHandle"
                    type="text"
                    placeholder="@yourbusiness"
                    className="pl-10"
                    {...businessForm.register("instagramHandle")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebookHandle">Facebook Handle</Label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="facebookHandle"
                    type="text"
                    placeholder="@yourbusiness"
                    className="pl-10"
                    {...businessForm.register("facebookHandle")}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <div className="space-y-3">
                <Input
                  id="street"
                  type="text"
                  placeholder="Street Address"
                  {...businessForm.register("street")}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id="city"
                    type="text"
                    placeholder="City*"
                    {...businessForm.register("city")}
                  />
                  <Input
                    id="state"
                    type="text"
                    placeholder="State/Province*"
                    {...businessForm.register("state")}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id="country"
                    type="text"
                    placeholder="Country*"
                    {...businessForm.register("country")}
                  />
                  <Input
                    id="zipCode"
                    type="text"
                    placeholder="Postal/Zip Code"
                    {...businessForm.register("zipCode")}
                  />
                </div>
              </div>
              {(businessForm.formState.errors.city || businessForm.formState.errors.state || businessForm.formState.errors.country) && (
                <p className="text-sm text-red-500">City, State and Country are required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="gstNumber"
                  type="text"
                  placeholder="GST Number (if applicable)"
                  className="pl-10"
                  {...businessForm.register("gstNumber")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessLogo">Business Logo</Label>
              <Input 
                id="businessLogo" 
                type="file" 
                accept="image/*"
                onChange={(e) => handleFileChange(e, setBusinessLogo)} 
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack}
                className="flex-1"
                disabled={isSubmitting || loading}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isSubmitting || loading}
              >
                {(isSubmitting || loading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <SocialLoginButtons
              onGoogleLogin={handleGoogleLogin}
              isDisabled={isSubmitting || loading}
            />
          </form>
        </Form>
      )}
    </>
  );
};

export default RegisterForm;
