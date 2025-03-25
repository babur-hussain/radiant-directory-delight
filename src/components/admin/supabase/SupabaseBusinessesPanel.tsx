import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { PopoverClose } from "@radix-ui/react-popover"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialogPortal,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  FormPopover,
  FormPopoverContent,
  FormPopoverTrigger,
} from "@/components/ui/form-popover"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AspectRatio,
} from "@/components/ui/aspect-ratio"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Progress
} from "@/components/ui/progress"
import {
  Skeleton
} from "@/components/ui/skeleton"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ResizableSeparator,
} from "@/components/ui/resizable"
import {
  CommandMenu
} from "@/components/ui/command-menu"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import {
  HoverCardPortal
} from "@/components/ui/hover-card"
import {
  CommandDialog,
} from "@/components/ui/command"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import {
  ResizableHandleLine,
} from "@/components/ui/resizable"
import {
  SelectScrollUp,
  SelectScrollDown
} from "@/components/ui/select"
import {
  SheetOverlay
} from "@/components/ui/sheet"
import {
  NavigationMenuIndicator
} from "@/components/ui/navigation-menu"
import {
  ResizablePanelResizeHandle
} from "@/components/ui/resizable"
import {
  CommandListNavigation
} from "@/components/ui/command-list-navigation"
import {
  CommandGroupCheck
} from "@/components/ui/command-group-check"
import {
  CommandItemCheck
} from "@/components/ui/command-item-check"
import {
  CommandListSearchEmpty
} from "@/components/ui/command-list-search-empty"
import {
  CommandListSearchLoading
} from "@/components/ui/command-list-search-loading"
import {
  CommandListSearchNoResults
} from "@/components/ui/command-list-search-no-results"
import {
  CommandListSearchSeparator
} from "@/components/ui/command-list-search-separator"
import {
  CommandListSearchSkeleton
} from "@/components/ui/command-list-search-skeleton"
import {
  CommandListSkeleton
} from "@/components/ui/command-list-skeleton"
import {
  CommandSeparatorNavigation
} from "@/components/ui/command-separator-navigation"
import {
  CommandShortcutNavigation
} from "@/components/ui/command-shortcut-navigation"
import {
  CommandShortcutSearch
} from "@/components/ui/command-shortcut-search"
import {
  CommandShortcutSkeleton
} from "@/components/ui/command-shortcut-skeleton"
import {
  CommandSkeleton
} from "@/components/ui/command-skeleton"
import {
  ContextMenuRadioGroupIndicator
} from "@/components/ui/context-menu"
import {
  DropdownMenuRadioGroupIndicator
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenuContentInset
} from "@/components/ui/navigation-menu"
import {
  NavigationMenuContentPosition
} from "@/components/ui/navigation-menu"
import {
  NavigationMenuLinkArrow
} from "@/components/ui/navigation-menu"
import {
  NavigationMenuLinkCallout
} from "@/components/ui/navigation-menu"
import {
  NavigationMenuLinkDescription
} from "@/components/ui/navigation-menu"
import {
  NavigationMenuLinkHeading
} from "@/components/ui/navigation-menu"
import {
  NavigationMenuLinkIcon
} from "@/components/ui/navigation-menu"
import {
  NavigationMenuLinkTitle
} from "@/components/ui/navigation-menu"
import {
  NavigationMenuSeparator
} from "@/components/ui/navigation-menu"
import {
  NavigationMenuTriggerItem
} from "@/components/ui/navigation-menu"
import {
  NavigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import {
  NavigationMenuViewportPosition
} from "@/components/ui/navigation-menu"
import {
  ResizablePanelGroupRoot
} from "@/components/ui/resizable"
import {
  ResizablePanelRoot
} from "@/components/ui/resizable"
import {
  ResizableSeparatorRoot
} from "@/components/ui/resizable"
import {
  SheetContentInset
} from "@/components/ui/sheet"
import {
  SheetContentPosition
} from "@/components/ui/sheet"
import {
  SheetOverlayInset
} from "@/components/ui/sheet"
import {
  SheetOverlayPosition
} from "@/components/ui/sheet"
import {
  TooltipArrow
} from "@/components/ui/tooltip"
import {
  TooltipPortal
} from "@/components/ui/tooltip"
import {
  TooltipProviderDelay
} from "@/components/ui/tooltip"
import {
  TooltipProviderSide
} from "@/components/ui/tooltip"
import {
  TooltipProviderSideOffset
} from "@/components/ui/tooltip"
import {
  TooltipRoot
} from "@/components/ui/tooltip"
import {
  TooltipTriggerStyle
} from "@/components/ui/tooltip"
import {
  TooltipViewport
} from "@/components/ui/tooltip"
import { supabase } from "@/integrations/supabase/client"
import { Business } from "@/types/business"

interface SupabaseBusinessesPanelProps {
  onClose?: () => void
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
})

export function SupabaseBusinessesPanel({
  onClose,
}: SupabaseBusinessesPanelProps) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [showBusinessForm, setShowBusinessForm] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

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
  })

  const { data: session } = supabase.auth.getSession()

  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    setIsSuccess(false)

    try {
      const { data, error, count } = await supabase
        .from("businesses")
        .select("*", { count: "exact" })
        .ilike("name", `%${searchTerm}%`)
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

      if (error) {
        console.error("Error fetching businesses:", error)
        setIsError(true)
        toast({
          title: "Error",
          description: "Failed to fetch businesses",
          variant: "destructive",
        })
        return
      }

      if (data) {
        setBusinesses(data as Business[])
        setTotalItems(count || 0)
        setIsSuccess(true)
      }
    } catch (error) {
      console.error("Error fetching businesses:", error)
      setIsError(true)
      toast({
        title: "Error",
        description: "Failed to fetch businesses",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, currentPage, itemsPerPage])

  useEffect(() => {
    fetchBusinesses()
  }, [fetchBusinesses])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    setIsError(false)
    setIsSuccess(false)

    try {
      const tags = typeof values.tags === 'string' 
        ? values.tags.split(',').map(tag => tag.trim()) 
        : Array.isArray(values.tags) ? values.tags : [];

      const { error } = await supabase.from("businesses").insert([
        {
          ...values,
          rating: Number(values.rating),
          reviews: Number(values.reviews),
          featured: values.featured || false,
          tags: tags,
          latitude: Number(values.latitude),
          longitude: Number(values.longitude),
        },
      ])

      if (error) {
        console.error("Error creating business:", error)
        setIsError(true)
        toast({
          title: "Error",
          description: "Failed to create business",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Business created successfully",
      })
      setIsSuccess(true)
      setShowBusinessForm(false)
      form.reset()
      fetchBusinesses()
    } catch (error) {
      console.error("Error creating business:", error)
      setIsError(true)
      toast({
        title: "Error",
        description: "Failed to create business",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onUpdate = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    setIsError(false)
    setIsSuccess(false)

    if (!selectedBusiness) {
      console.error("No business selected")
      setIsError(true)
      toast({
        title: "Error",
        description: "No business selected",
        variant: "destructive",
      })
      return
    }

    try {
      const tags = typeof values.tags === 'string' 
        ? values.tags.split(',').map(tag => tag.trim()) 
        : Array.isArray(values.tags) ? values.tags : [];

      const { error } = await supabase
        .from("businesses")
        .update({
          ...values,
          rating: Number(values.rating),
          reviews: Number(values.reviews),
          featured: values.featured || false,
          tags: tags,
          latitude: Number(values.latitude),
          longitude: Number(values.longitude),
        })
        .eq("id", selectedBusiness.id)

      if (error) {
        console.error("Error updating business:", error)
        setIsError(true)
        toast({
          title: "Error",
          description: "Failed to update business",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Business updated successfully",
      })
      setIsSuccess(true)
      setShowBusinessForm(false)
      form.reset()
      fetchBusinesses()
    } catch (error) {
      console.error("Error updating business:", error)
      setIsError(true)
      toast({
        title: "Error",
        description: "Failed to update business",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onDelete = async () => {
    setIsSubmitting(true)
    setIsError(false)
    setIsSuccess(false)

    if (!selectedBusiness) {
      console.error("No business selected")
      setIsError(true)
      toast({
        title: "Error",
        description: "No business selected",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase
        .from("businesses")
        .delete()
        .eq("id", selectedBusiness.id)

      if (error) {
        console.error("Error deleting business:", error)
        setIsError(true)
        toast({
          title: "Error",
          description: "Failed to delete business",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Business deleted successfully",
      })
      setIsSuccess(true)
      setShowDeleteAlert(false)
      form.reset()
      fetchBusinesses()
    } catch (error) {
      console.error("Error deleting business:", error)
      setIsError(true)
      toast({
        title: "Error",
        description: "Failed to delete business",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1)
  }

  const handleEditBusiness = (business: Business) => {
    setSelectedBusiness(business)
    setShowBusinessForm(true)
    form.setValue("name", business.name)
    form.setValue("category", business.category || "")
    form.setValue("description", business.description || "")
    form.setValue("address", business.address || "")
    form.setValue("phone", business.phone || "")
    form.setValue("email", business.email || "")
    form.setValue("website", business.website || "")
    form.setValue("image", business.image || "")
    form.setValue("hours", business.hours || "")
    form.setValue("rating", business.rating || 0)
    form.setValue("reviews", business.reviews || 0)
    form.setValue("featured", business.featured || false)
    form.setValue("tags", business.tags ? business.tags.join(", ") : "")
    form.setValue("latitude", business.latitude || 0)
    form.setValue("longitude", business.longitude || 0)
  }

  const handleCreateBusiness = () => {
    setSelectedBusiness(null)
    setShowBusinessForm(true)
    form.reset()
  }

  const handleDeleteBusiness = (business: Business) => {
    setSelectedBusiness(business)
    setShowDeleteAlert(true)
  }

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
            />
            <Button onClick={handleCreateBusiness}>Add Business</Button>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Progress value={50} />
            </div>
          ) : isError ? (
            <div className="text-red-500">Failed to load businesses.</div>
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
                  {businesses.map((business) => (
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
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>
                      <div className="flex items-center justify-between">
                        <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Items per page" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                        <Pagination>
                          <PaginationContent>
                            <PaginationPrevious
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            />
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                                className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
                              >
                                1
                              </PaginationLink>
                            </PaginationItem>
                            {currentPage > 3 && (
                              <PaginationItem>
                                <PaginationLink className="cursor-default">...</PaginationLink>
                              </PaginationItem>
                            )}
                            {currentPage > 2 && (
                              <PaginationItem>
                                <PaginationLink onClick={() => handlePageChange(currentPage - 1)}>
                                  {currentPage - 1}
                                </PaginationLink>
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => handlePageChange(currentPage)}
                                className="font-semibold"
                              >
                                {currentPage}
                              </PaginationLink>
                            </PaginationItem>
                            {currentPage < Math.ceil(totalItems / itemsPerPage) - 1 && (
                              <PaginationItem>
                                <PaginationLink onClick={() => handlePageChange(currentPage + 1)}>
                                  {currentPage + 1}
                                </PaginationLink>
                              </PaginationItem>
                            )}
                            {currentPage < Math.ceil(totalItems / itemsPerPage) - 2 && (
                              <PaginationItem>
                                <PaginationLink className="cursor-default">...</PaginationLink>
                              </PaginationItem>
                            )}
                            {Math.ceil(totalItems / itemsPerPage) > 1 && (
                              <PaginationItem>
                                <PaginationLink
                                  onClick={() =>
                                    handlePageChange(Math.ceil(totalItems / itemsPerPage))
                                  }
                                  disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                                  className={currentPage === Math.ceil(totalItems / itemsPerPage) ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                  {Math.ceil(totalItems / itemsPerPage)}
                                </PaginationLink>
                              </PaginationItem>
                            )}
                            <PaginationNext
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
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
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input placeholder="Hours" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Rating" {...field} />
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
                      <Input type="number" placeholder="Reviews" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      <Input placeholder="Tags" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Latitude" {...field} />
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
                      <Input type="number" placeholder="Longitude" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              business from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
