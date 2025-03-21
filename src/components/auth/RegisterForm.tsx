
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
import { ArrowLeft, MailCheck, Loader2, IdCard, MapPin, Briefcase, User, Instagram, Facebook, Phone, Globe, Building, Hash, BarChart, Languages, MapPinned, BadgeCheck } from "lucide-react";
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
const userSchema = z.object({
  ...baseSchema,
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().optional(),
  interests: z.string().optional(),
  preferredLanguage: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const influencerSchema = z.object({
  ...baseSchema,
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  instagramHandle: z.string().min(2, "Instagram handle is required"),
  facebookProfile: z.string().optional(),
  category: z.string().min(2, "Please select a category"),
  followersCount: z.string().min(1, "Please enter your followers count"),
  engagementRate: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const businessSchema = z.object({
  ...baseSchema,
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessCategory: z.string().min(2, "Please select a business category"),
  websiteURL: z.string().optional(),
  socialMediaLinks: z.string().optional(),
  businessAddress: z.string().min(5, "Business address is required"),
  GSTIN: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const staffSchema = z.object({
  ...baseSchema,
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.string().min(2, "Staff role is required"),
  assignedBusinessID: z.string().min(2, "Assigned business is required"),
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

type FormData = z.infer<typeof influencerSchema> | z.infer<typeof businessSchema> | z.infer<typeof userSchema> | z.infer<typeof staffSchema>;

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
  const influencerCategories = [
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
    "Admin", "Manager", "Sales", "Support", "Marketing", "Content", "Other"
  ];

  // Define languages
  const languages = [
    "English", "Hindi", "Spanish", "French", "German", "Chinese", "Japanese", "Other"
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
        };
      case "Business":
        return {
          ...baseValues,
          businessName: "",
          businessCategory: "",
          websiteURL: "",
          socialMediaLinks: "",
          businessAddress: "",
          GSTIN: "",
        };
      case "Staff":
        return {
          ...baseValues,
          fullName: "",
          role: "",
          assignedBusinessID: "",
        };
      default:
        return {
          ...baseValues,
          fullName: "",
          location: "",
          interests: "",
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
        phoneNumber: data.phoneNumber || null,
      };
      
      let displayName = "";
      
      if (userType === "Influencer") {
        const influencerData = data as z.infer<typeof influencerSchema>;
        displayName = influencerData.fullName;
        
        additionalData = {
          ...additionalData,
          name: influencerData.fullName,
          instagramHandle: influencerData.instagramHandle,
          facebookProfile: influencerData.facebookProfile || null,
          category: influencerData.category,
          followersCount: influencerData.followersCount,
          engagementRate: influencerData.engagementRate || null,
          createdAt: new Date().toISOString(),
          verified: false,
        };
      } else if (userType === "Business") {
        const businessData = data as z.infer<typeof businessSchema>;
        displayName = businessData.businessName;
        
        additionalData = {
          ...additionalData,
          businessName: businessData.businessName,
          businessCategory: businessData.businessCategory,
          websiteURL: businessData.websiteURL || null,
          socialMediaLinks: businessData.socialMediaLinks || null,
          businessAddress: businessData.businessAddress,
          GSTIN: businessData.GSTIN || null,
          createdAt: new Date().toISOString(),
          verified: false,
        };
      } else if (userType === "Staff") {
        const staffData = data as z.infer<typeof staffSchema>;
        displayName = staffData.fullName;
        
        additionalData = {
          ...additionalData,
          name: staffData.fullName,
          staffRole: staffData.role,
          assignedBusinessID: staffData.assignedBusinessID,
          createdAt: new Date().toISOString(),
          verified: false,
        };
      } else {
        const userData = data as z.infer<typeof userSchema>;
        displayName = userData.fullName;
        
        additionalData = {
          ...additionalData,
          name: userData.fullName,
          location: userData.location || null,
          interests: userData.interests || null,
          preferredLanguage: userData.preferredLanguage || null,
          createdAt: new Date().toISOString(),
        };
      }
      
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
            <div className="bg-purple-50 p-4 rounded-lg mb-6 border border-purple-100">
              <h3 className="font-semibold text-purple-700 flex items-center text-lg mb-2">
                <Users className="h-5 w-5 mr-2" /> Influencer Information
              </h3>
              <p className="text-sm text-purple-600">
                Please provide your information as an influencer to help businesses find and connect with you.
              </p>
            </div>

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
                    <FormLabel>Content Category*</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select your content category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {influencerCategories.map((category) => (
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
                    <FormLabel>Engagement Rate (%)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="e.g. 3.5" {...field} />
                        <BarChart className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
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
                        <Input placeholder="e.g. username or URL" {...field} />
                        <Facebook className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        );
      case "Business":
        return (
          <>
            <div className="bg-emerald-50 p-4 rounded-lg mb-6 border border-emerald-100">
              <h3 className="font-semibold text-emerald-700 flex items-center text-lg mb-2">
                <Building2 className="h-5 w-5 mr-2" /> Business Information
              </h3>
              <p className="text-sm text-emerald-600">
                Please provide your business information to help influencers understand your brand.
              </p>
            </div>

            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name*</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Enter your business name" {...field} />
                      <Briefcase className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
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
                        <Input placeholder="Enter your business phone" {...field} />
                        <Phone className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="websiteURL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
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

              <FormField
                control={form.control}
                name="socialMediaLinks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Media</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="e.g. Instagram: @business, FB: /business" {...field} />
                        <Instagram className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
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
                name="GSTIN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GSTIN</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Enter your GSTIN if applicable" {...field} />
                        <Hash className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="businessAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Address*</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea 
                        placeholder="Enter your complete business address" 
                        className="resize-none min-h-[80px]"
                        {...field} 
                      />
                      <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case "Staff":
        return (
          <>
            <div className="bg-amber-50 p-4 rounded-lg mb-6 border border-amber-100">
              <h3 className="font-semibold text-amber-700 flex items-center text-lg mb-2">
                <UserCheck className="h-5 w-5 mr-2" /> Staff Information
              </h3>
              <p className="text-sm text-amber-600">
                Please provide your information to register as a staff member.
              </p>
            </div>

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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Role*</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff role" />
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
              name="assignedBusinessID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Business*</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Enter your assigned business ID" {...field} />
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
            <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
              <h3 className="font-semibold text-blue-700 flex items-center text-lg mb-2">
                <User className="h-5 w-5 mr-2" /> User Information
              </h3>
              <p className="text-sm text-blue-600">
                Please provide your information to create your account.
              </p>
            </div>

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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="City, State" {...field} />
                        <MapPinned className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
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
                          <SelectValue placeholder="Select language" />
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

            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interests</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter your interests, separated by commas" 
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
              variant="outline" 
              className="mb-6" 
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to account types
            </Button>
          )}
          
          <div className="mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {renderRoleSpecificFields()}

                <div className="bg-gray-50 p-4 rounded-lg mb-2 mt-4 border">
                  <h3 className="font-semibold text-gray-700 flex items-center mb-2">
                    <BadgeCheck className="h-5 w-5 mr-2 text-primary" /> Account Credentials
                  </h3>
                </div>

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
                  className="w-full mt-4"
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
