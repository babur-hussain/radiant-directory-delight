
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RegisterTypeSelector from "./RegisterTypeSelector";
import { UserRole } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  MailCheck, 
  Loader2, 
  IdCard, 
  MapPin, 
  Briefcase, 
  User, 
  Instagram, 
  Facebook, 
  Phone, 
  Globe, 
  Building, 
  Languages, 
  Heart, 
  Percent, 
  Users
} from "lucide-react";
import SocialLoginButtons from "./SocialLoginButtons";

// Create a base schema with common fields
const baseSchema = {
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be at most 50 characters"),
  confirmPassword: z.string(),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  employeeCode: z.string().optional(),
};

// Role-specific schemas
const influencerSchema = z.object({
  ...baseSchema,
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  instagramHandle: z.string().min(2, "Instagram handle is required"),
  facebookProfile: z.string().optional(),
  category: z.string().min(2, "Please select a category"),
  followersCount: z.string().min(1, "Please enter your followers count"),
  engagementRate: z.string().optional(),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  bio: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const businessSchema = z.object({
  ...baseSchema,
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessCategory: z.string().min(2, "Please select a business category"),
  websiteURL: z.string().optional(),
  socialMediaLinks: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
  }).optional(),
  street: z.string().min(2, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  zipCode: z.string().optional(),
  gstin: z.string().optional(),
  ownerName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const staffSchema = z.object({
  ...baseSchema,
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  staffRole: z.string().min(2, "Staff role is required"),
  assignedBusinessId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const userSchema = z.object({
  ...baseSchema,
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  interests: z.string().optional(),
  location: z.string().optional(),
  preferredLanguage: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Function to select the appropriate schema based on user role
const getSchemaForRole = (role: UserRole) => {
  switch (role) {
    case "Influencer":
      return influencerSchema;
    case "Business":
      return businessSchema;
    case "Staff":
      return staffSchema;
    default:
      return userSchema;
  }
};

type FormData = z.infer<typeof influencerSchema> | z.infer<typeof businessSchema> | z.infer<typeof staffSchema> | z.infer<typeof userSchema>;

interface RegisterFormProps {
  onSignup: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    additionalData?: any
  ) => Promise<void>;
  onClose: () => void;
  registerType?: UserRole;
  onBack?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onSignup, 
  onClose,
  registerType = null,
  onBack
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userType, setUserType] = useState<UserRole>(registerType || "User");
  const { toast } = useToast();

  // Define available categories for influencers
  const niches = [
    "Fashion", "Beauty", "Fitness", "Travel", "Food", "Technology", 
    "Photography", "Art", "Lifestyle", "Gaming", "Education", "Business", "Other"
  ];

  // Define business categories
  const businessCategories = [
    "Restaurant", "Retail", "Technology", "Health", "Beauty", "Fitness", 
    "Education", "Professional Services", "Entertainment", "Real Estate", "Other"
  ];

  // Define staff roles
  const staffRoles = [
    "Admin", "Manager", "Sales", "Support", "Content Creator", "Marketing", "Other"
  ];

  // Define languages
  const languages = [
    "English", "Hindi", "Spanish", "French", "German", "Chinese", "Japanese", "Other"
  ];

  // Define countries
  const countries = [
    "India", "United States", "United Kingdom", "Canada", "Australia", 
    "Germany", "France", "Japan", "China", "Brazil", "Other"
  ];

  // Update local state when registerType prop changes
  useEffect(() => {
    if (registerType) {
      setUserType(registerType);
      resetForm();
    }
  }, [registerType]);

  // Initialize the form with the appropriate schema
  const form = useForm<FormData>({
    resolver: zodResolver(getSchemaForRole(userType)),
    defaultValues: getDefaultValuesForRole(userType),
    mode: "onChange" // Changed from default to allow immediate validation
  });

  // Function to reset the form when the role changes
  const resetForm = () => {
    form.reset(getDefaultValuesForRole(userType));
  };

  // Function to get default values based on the selected role
  function getDefaultValuesForRole(role: UserRole) {
    const baseValues = {
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      employeeCode: "",
    };

    switch (role) {
      case "Influencer":
        return {
          ...baseValues,
          fullName: "",
          instagramHandle: "",
          facebookProfile: "",
          category: "",
          followersCount: "",
          engagementRate: "",
          bio: "",
          city: "",
          country: "",
        };
      case "Business":
        return {
          ...baseValues,
          businessName: "",
          businessCategory: "",
          websiteURL: "",
          socialMediaLinks: {
            instagram: "",
            facebook: "",
          },
          street: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
          gstin: "",
          ownerName: "",
        };
      case "Staff":
        return {
          ...baseValues,
          fullName: "",
          staffRole: "",
          assignedBusinessId: "",
        };
      default:
        return {
          ...baseValues,
          fullName: "",
          interests: "",
          location: "",
          preferredLanguage: "",
        };
    }
  }

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Create additionalData object based on role
      let additionalData: any = {
        employeeCode: data.employeeCode || null,
        phone: data.phoneNumber || null,
      };
      
      let displayName = "";
      
      if (userType === "Influencer") {
        const influencerData = data as z.infer<typeof influencerSchema>;
        displayName = influencerData.fullName;
        
        additionalData = {
          ...additionalData,
          name: influencerData.fullName,
          instagramHandle: influencerData.instagramHandle || null,
          facebookHandle: influencerData.facebookProfile || null,
          niche: influencerData.category,
          followersCount: influencerData.followersCount,
          engagementRate: influencerData.engagementRate || null,
          bio: influencerData.bio || null,
          city: influencerData.city,
          country: influencerData.country,
          createdAt: new Date().toISOString(),
          verified: false,
          
          // Split name into firstName and lastName
          firstName: influencerData.fullName.split(' ')[0],
          lastName: influencerData.fullName.includes(' ') ? 
            influencerData.fullName.split(' ').slice(1).join(' ') : '',
          // Username can be derived from email or name
          username: influencerData.email.split('@')[0] || influencerData.fullName.replace(/\s+/g, '_').toLowerCase()
        };
      } else if (userType === "Business") {
        const businessData = data as z.infer<typeof businessSchema>;
        displayName = businessData.businessName;
        
        additionalData = {
          ...additionalData,
          businessName: businessData.businessName,
          businessCategory: businessData.businessCategory,
          website: businessData.websiteURL || null,
          instagramHandle: businessData.socialMediaLinks?.instagram || null,
          facebookHandle: businessData.socialMediaLinks?.facebook || null,
          city: businessData.city,
          country: businessData.country,
          gstNumber: businessData.gstin || null,
          ownerName: businessData.ownerName || null,
          address: {
            street: businessData.street || null,
            city: businessData.city,
            state: businessData.state || null,
            country: businessData.country,
            zipCode: businessData.zipCode || null
          },
          createdAt: new Date().toISOString(),
          verified: false,
          
          // Set owner name as the display name parts if available
          firstName: businessData.ownerName ? businessData.ownerName.split(' ')[0] : null,
          lastName: businessData.ownerName && businessData.ownerName.includes(' ') ? 
            businessData.ownerName.split(' ').slice(1).join(' ') : null,
          // Username can be derived from business name
          username: businessData.businessName.replace(/\s+/g, '_').toLowerCase() || 
            businessData.email.split('@')[0]
        };
      } else if (userType === "Staff") {
        const staffData = data as z.infer<typeof staffSchema>;
        displayName = staffData.fullName;
        
        additionalData = {
          ...additionalData,
          name: staffData.fullName,
          staffRole: staffData.staffRole,
          assignedBusinessId: staffData.assignedBusinessId || null,
          createdAt: new Date().toISOString(),
          
          // Split name into firstName and lastName
          firstName: staffData.fullName.split(' ')[0],
          lastName: staffData.fullName.includes(' ') ? 
            staffData.fullName.split(' ').slice(1).join(' ') : '',
          // Username can be derived from email or name
          username: staffData.email.split('@')[0] || 
            staffData.fullName.replace(/\s+/g, '_').toLowerCase()
        };
      } else {
        const userData = data as z.infer<typeof userSchema>;
        displayName = userData.fullName;
        
        additionalData = {
          ...additionalData,
          name: userData.fullName,
          interests: userData.interests || null,
          location: userData.location || null,
          preferredLanguage: userData.preferredLanguage || null,
          createdAt: new Date().toISOString(),
          
          // Split name into firstName and lastName
          firstName: userData.fullName.split(' ')[0],
          lastName: userData.fullName.includes(' ') ? 
            userData.fullName.split(' ').slice(1).join(' ') : '',
          // Username can be derived from email or name
          username: userData.email.split('@')[0] || 
            userData.fullName.replace(/\s+/g, '_').toLowerCase()
        };
      }
      
      console.log("Registration form data:", {
        email: data.email,
        name: displayName,
        role: userType,
        additionalData
      });
      
      await onSignup(data.email, data.password, displayName, userType, additionalData);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully",
      });
      onClose();
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render appropriate fields based on the selected user role
  const renderRoleSpecificFields = () => {
    switch (userType) {
      case "Influencer":
        return (
          <>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name*</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Enter your full name" {...field} />
                      <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number*</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Enter your phone number" {...field} />
                        <Phone className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niche/Category*</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your niche" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {niches.map((niche) => (
                          <SelectItem key={niche} value={niche}>
                            {niche}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="followersCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Followers Count*</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="e.g. 10000" {...field} />
                        <Users className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="engagementRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engagement Rate</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="e.g. 3.5" {...field} />
                        <Percent className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
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
                name="instagramHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Handle*</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="e.g. @username" {...field} />
                        <Instagram className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="facebookProfile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Profile</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="e.g. username" {...field} />
                        <Facebook className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
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
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country*</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City*</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Enter your city" {...field} />
                        <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about yourself and your content" 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case "Business":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name*</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Enter business name" {...field} />
                        <Building className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number*</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Enter business phone" {...field} />
                        <Phone className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
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
                name="businessCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Category*</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="websiteURL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="e.g. https://yourbusiness.com" {...field} />
                        <Globe className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
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
                name="socialMediaLinks.instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Handle</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="e.g. @yourbusiness" {...field} />
                        <Instagram className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialMediaLinks.facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Handle</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="e.g. yourbusiness" {...field} />
                        <Facebook className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="gstin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GSTIN</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Enter GST number if applicable" {...field} />
                      <IdCard className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h3 className="text-md font-medium mt-4 mb-2">Business Address</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter street address" {...field} />
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
                    <FormLabel>City*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter state" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country*</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP/Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter ZIP code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        );
      case "Staff":
        return (
          <>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name*</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Enter your full name" {...field} />
                      <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number*</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Enter your phone number" {...field} />
                        <Phone className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="staffRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Role*</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staffRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assignedBusinessId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Business ID*</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Enter assigned business ID" {...field} />
                      <Building className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      default:
        return (
          <>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name*</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Enter your full name" {...field} />
                      <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number*</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Enter your phone number" {...field} />
                        <Phone className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Language</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="City, State" {...field} />
                        <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interests</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="E.g. Music, Sports, Travel" {...field} />
                        <Heart className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        );
    }
  };

  return (
    <div>
      {!registerType ? (
        <RegisterTypeSelector
          selectedType={userType}
          onSelectType={(type) => {
            setUserType(type);
            resetForm();
          }}
        />
      ) : (
        <>
          {onBack && (
            <Button 
              variant="ghost" 
              className="mb-4" 
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to type selection
            </Button>
          )}
          
          <div className="mt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {renderRoleSpecificFields()}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email*</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                          />
                          <MailCheck className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
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
                        <FormLabel>Password*</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
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
                        <FormLabel>Confirm Password*</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="employeeCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <IdCard className="h-4 w-4" />
                        Employee Code (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your employee code if applicable"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <MailCheck className="mr-2 h-4 w-4" />
                      Register as {userType}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          <div className="relative my-6">
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
            onGoogleLogin={() => {}}
            isDisabled={isSubmitting}
          />
        </>
      )}
    </div>
  );
};

export default RegisterForm;
