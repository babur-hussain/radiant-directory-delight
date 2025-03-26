
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Business } from "@/types/business";

interface SupabaseBusinessesPanelProps {
  onClose?: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Business name must be at least 2 characters.",
  }),
  category: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  image: z.string().url().optional(),
  hours: z.string().optional(),
  rating: z.number().optional(),
  reviews: z.number().optional(),
  featured: z.boolean().optional(),
  tags: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export function SupabaseBusinessesPanel({
  onClose,
}: SupabaseBusinessesPanelProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      image: "",
      hours: "",
      rating: 0,
      reviews: 0,
      featured: false,
      tags: "",
      latitude: 0,
      longitude: 0,
    },
  });

  const { toast } = useToast();

  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setIsSuccess(false);

    try {
      const { data, error, count } = await supabase
        .from("businesses")
        .select("*", { count: "exact" })
        .ilike("name", `%${searchTerm}%`)
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) {
        console.error("Error fetching businesses:", error);
        setIsError(true);
        toast({
          title: "Error",
          description: "Failed to fetch businesses",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setBusinesses(data as Business[]);
        setTotalItems(count || 0);
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
      setIsError(true);
      toast({
        title: "Error",
        description: "Failed to fetch businesses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, currentPage, itemsPerPage, toast]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setIsError(false);
    setIsSuccess(false);

    try {
      const tags = typeof values.tags === 'string' 
        ? values.tags.split(',').map(tag => tag.trim()) 
        : [];

      const businessData = {
        name: values.name,
        category: values.category,
        description: values.description,
        address: values.address,
        phone: values.phone,
        email: values.email,
        website: values.website,
        image: values.image,
        hours: values.hours,
        rating: Number(values.rating),
        reviews: Number(values.reviews),
        featured: values.featured || false,
        tags: tags,
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
      };

      const { error } = await supabase.from("businesses").insert(businessData);

      if (error) {
        console.error("Error creating business:", error);
        setIsError(true);
        toast({
          title: "Error",
          description: "Failed to create business",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Business created successfully",
      });
      setIsSuccess(true);
      setShowBusinessForm(false);
      form.reset();
      fetchBusinesses();
    } catch (error) {
      console.error("Error creating business:", error);
      setIsError(true);
      toast({
        title: "Error",
        description: "Failed to create business",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpdate = async (values: z.infer<typeof formSchema>) => {
    if (!selectedBusiness) return;
    
    setIsSubmitting(true);
    setIsError(false);
    setIsSuccess(false);

    try {
      const tags = typeof values.tags === 'string' 
        ? values.tags.split(',').map(tag => tag.trim()) 
        : [];

      const businessData = {
        name: values.name,
        category: values.category,
        description: values.description,
        address: values.address,
        phone: values.phone,
        email: values.email,
        website: values.website,
        image: values.image,
        hours: values.hours,
        rating: Number(values.rating),
        reviews: Number(values.reviews),
        featured: values.featured || false,
        tags: tags,
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
      };

      const { error } = await supabase
        .from("businesses")
        .update(businessData)
        .eq("id", selectedBusiness.id);

      if (error) {
        console.error("Error updating business:", error);
        setIsError(true);
        toast({
          title: "Error",
          description: "Failed to update business",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Business updated successfully",
      });
      setIsSuccess(true);
      setShowBusinessForm(false);
      form.reset();
      fetchBusinesses();
    } catch (error) {
      console.error("Error updating business:", error);
      setIsError(true);
      toast({
        title: "Error",
        description: "Failed to update business",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!selectedBusiness) return;
    
    setIsSubmitting(true);
    setIsError(false);
    setIsSuccess(false);

    try {
      const { error } = await supabase
        .from("businesses")
        .delete()
        .eq("id", selectedBusiness.id);

      if (error) {
        console.error("Error deleting business:", error);
        setIsError(true);
        toast({
          title: "Error",
          description: "Failed to delete business",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Business deleted successfully",
      });
      setIsSuccess(true);
      setShowDeleteAlert(false);
      form.reset();
      fetchBusinesses();
    } catch (error) {
      console.error("Error deleting business:", error);
      setIsError(true);
      toast({
        title: "Error",
        description: "Failed to delete business",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleEditBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setShowBusinessForm(true);
    form.setValue("name", business.name || "");
    form.setValue("category", business.category || "");
    form.setValue("description", business.description || "");
    form.setValue("address", business.address || "");
    form.setValue("phone", business.phone || "");
    form.setValue("email", business.email || "");
    form.setValue("website", business.website || "");
    form.setValue("image", business.image || "");
    form.setValue("hours", typeof business.hours === 'object' ? JSON.stringify(business.hours) : (business.hours || ""));
    form.setValue("rating", business.rating || 0);
    form.setValue("reviews", business.reviews || 0);
    form.setValue("featured", business.featured || false);
    form.setValue("tags", Array.isArray(business.tags) ? business.tags.join(", ") : (business.tags || ""));
    form.setValue("latitude", business.latitude || 0);
    form.setValue("longitude", business.longitude || 0);
  };

  const handleCreateBusiness = () => {
    setSelectedBusiness(null);
    setShowBusinessForm(true);
    form.reset();
  };

  const handleDeleteBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setShowDeleteAlert(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Businesses</CardTitle>
        <CardDescription>
          Manage businesses in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full max-w-sm"
            />
            <Button onClick={handleCreateBusiness}>Add Business</Button>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Progress value={50} className="w-full" />
            </div>
          ) : isError ? (
            <div className="text-red-500 p-8 text-center">Failed to load businesses.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businesses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No businesses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    businesses.map((business) => (
                      <TableRow key={business.id}>
                        <TableCell className="font-medium">{business.name}</TableCell>
                        <TableCell>{business.category}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditBusiness(business)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteBusiness(business)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-muted-foreground">
                            Rows per page
                          </p>
                          <Select
                            value={String(itemsPerPage)}
                            onValueChange={handleItemsPerPageChange}
                          >
                            <SelectTrigger className="h-8 w-[70px]">
                              <SelectValue placeholder={itemsPerPage} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Pagination>
                          <PaginationContent>
                            <PaginationPrevious
                              onClick={() => handlePageChange(currentPage - 1)}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => handlePageChange(1)}
                                isActive={currentPage === 1}
                              >
                                1
                              </PaginationLink>
                            </PaginationItem>
                            {currentPage > 3 && (
                              <PaginationItem>
                                <span className="flex h-9 w-9 items-center justify-center">...</span>
                              </PaginationItem>
                            )}
                            {currentPage > 2 && (
                              <PaginationItem>
                                <PaginationLink onClick={() => handlePageChange(currentPage - 1)}>
                                  {currentPage - 1}
                                </PaginationLink>
                              </PaginationItem>
                            )}
                            {currentPage !== 1 && currentPage !== Math.ceil(totalItems / itemsPerPage) && (
                              <PaginationItem>
                                <PaginationLink isActive>{currentPage}</PaginationLink>
                              </PaginationItem>
                            )}
                            {currentPage < Math.ceil(totalItems / itemsPerPage) - 1 && (
                              <PaginationItem>
                                <PaginationLink onClick={() => handlePageChange(currentPage + 1)}>
                                  {currentPage + 1}
                                </PaginationLink>
                              </PaginationItem>
                            )}
                            {currentPage < Math.ceil(totalItems / itemsPerPage) - 2 && (
                              <PaginationItem>
                                <span className="flex h-9 w-9 items-center justify-center">...</span>
                              </PaginationItem>
                            )}
                            {Math.ceil(totalItems / itemsPerPage) > 1 && (
                              <PaginationItem>
                                <PaginationLink
                                  onClick={() => handlePageChange(Math.ceil(totalItems / itemsPerPage))}
                                  isActive={currentPage === Math.ceil(totalItems / itemsPerPage)}
                                >
                                  {Math.ceil(totalItems / itemsPerPage)}
                                </PaginationLink>
                              </PaginationItem>
                            )}
                            <PaginationNext
                              onClick={() => handlePageChange(currentPage + 1)}
                              className={currentPage === Math.ceil(totalItems / itemsPerPage) ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </div>
      </CardContent>

      {/* Business Form Dialog */}
      <Dialog open={showBusinessForm} onOpenChange={setShowBusinessForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedBusiness ? "Edit Business" : "Create Business"}
            </DialogTitle>
            <DialogDescription>
              {selectedBusiness
                ? "Update business details."
                : "Create a new business."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(selectedBusiness ? onUpdate : onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Business Name" {...field} />
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
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Category" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* More form fields - email, phone, website, etc. */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone" {...field} />
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
                        <Input placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="Website" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Image URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Rating" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reviews"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reviews</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Reviews" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Featured</FormLabel>
                      <FormDescription>
                        Whether the business is featured.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="Tags (comma separated)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Latitude" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Longitude" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Submitting..."
                    : selectedBusiness
                      ? "Update Business"
                      : "Create Business"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              business from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default SupabaseBusinessesPanel;
