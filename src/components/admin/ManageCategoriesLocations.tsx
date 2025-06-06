
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Pencil, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define types for categories and locations
type CategoryType = {
  id: string;
  name: string;
};

type LocationType = {
  id: string;
  name: string;
};

// Get categories and locations from localStorage or use defaults
const getInitialCategories = (): CategoryType[] => {
  const storedCategories = localStorage.getItem("businessCategories");
  if (storedCategories) {
    return JSON.parse(storedCategories);
  }
  return [];
};

const getInitialLocations = (): LocationType[] => {
  const storedLocations = localStorage.getItem("businessLocations");
  if (storedLocations) {
    return JSON.parse(storedLocations);
  }
  return [];
};

// Save categories and locations to localStorage
const saveCategories = (categories: CategoryType[]) => {
  localStorage.setItem("businessCategories", JSON.stringify(categories));
  // Dispatch an event to notify that categories have changed
  window.dispatchEvent(new Event("categoriesChanged"));
};

const saveLocations = (locations: LocationType[]) => {
  localStorage.setItem("businessLocations", JSON.stringify(locations));
  // Dispatch an event to notify that locations have changed
  window.dispatchEvent(new Event("locationsChanged"));
};

// Form schema for adding/editing
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  type: z.enum(["category", "location"]),
});

const ManageCategoriesLocations = () => {
  const [categories, setCategories] = useState<CategoryType[]>(getInitialCategories());
  const [locations, setLocations] = useState<LocationType[]>(getInitialLocations());
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newLocationName, setNewLocationName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "category",
    },
  });

  // Add new category
  const handleAddCategory = () => {
    if (newCategoryName.trim() === "") return;
    
    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase())) {
      toast({
        title: "Category already exists",
        description: "This category already exists in the list.",
        variant: "destructive",
      });
      return;
    }
    
    const newCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
    };
    
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    setNewCategoryName("");
    
    toast({
      title: "Category added",
      description: `${newCategoryName} has been added to categories.`,
    });
  };

  // Add new location
  const handleAddLocation = () => {
    if (newLocationName.trim() === "") return;
    
    // Check if location already exists
    if (locations.some(loc => loc.name.toLowerCase() === newLocationName.toLowerCase())) {
      toast({
        title: "Location already exists",
        description: "This location already exists in the list.",
        variant: "destructive",
      });
      return;
    }
    
    const newLocation = {
      id: Date.now().toString(),
      name: newLocationName,
    };
    
    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    saveLocations(updatedLocations);
    setNewLocationName("");
    
    toast({
      title: "Location added",
      description: `${newLocationName} has been added to locations.`,
    });
  };

  // Update category
  const handleUpdateCategory = (id: string, newName: string) => {
    if (newName.trim() === "") return;
    
    // Check if the new name already exists for another category
    if (categories.some(cat => cat.name.toLowerCase() === newName.toLowerCase() && cat.id !== id)) {
      toast({
        title: "Category already exists",
        description: "This category name is already used by another category.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedCategories = categories.map(cat => 
      cat.id === id ? { ...cat, name: newName } : cat
    );
    
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    setEditingCategory(null);
    
    toast({
      title: "Category updated",
      description: `Category has been updated to ${newName}.`,
    });
  };

  // Update location
  const handleUpdateLocation = (id: string, newName: string) => {
    if (newName.trim() === "") return;
    
    // Check if the new name already exists for another location
    if (locations.some(loc => loc.name.toLowerCase() === newName.toLowerCase() && loc.id !== id)) {
      toast({
        title: "Location already exists",
        description: "This location name is already used by another location.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedLocations = locations.map(loc => 
      loc.id === id ? { ...loc, name: newName } : loc
    );
    
    setLocations(updatedLocations);
    saveLocations(updatedLocations);
    setEditingLocation(null);
    
    toast({
      title: "Location updated",
      description: `Location has been updated to ${newName}.`,
    });
  };

  // Delete category
  const handleDeleteCategory = (id: string) => {
    const updatedCategories = categories.filter(cat => cat.id !== id);
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    
    toast({
      title: "Category deleted",
      description: "The category has been removed.",
    });
  };

  // Delete location
  const handleDeleteLocation = (id: string) => {
    const updatedLocations = locations.filter(loc => loc.id !== id);
    setLocations(updatedLocations);
    saveLocations(updatedLocations);
    
    toast({
      title: "Location deleted",
      description: "The location has been removed.",
    });
  };

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (values.type === "category") {
      setNewCategoryName(values.name);
      handleAddCategory();
    } else {
      setNewLocationName(values.name);
      handleAddLocation();
    }
    
    form.reset();
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Categories & Locations</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category or Location</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="category">Category</SelectItem>
                          <SelectItem value="location">Location</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Add</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          <div className="flex space-x-2 mb-4">
            <Input
              type="text"
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <Button onClick={handleAddCategory}>Add</Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                      No categories found. Add your first category above.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        {editingCategory === category.id ? (
                          <Input
                            type="text"
                            defaultValue={category.name}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateCategory(category.id, (e.target as HTMLInputElement).value);
                              } else if (e.key === "Escape") {
                                setEditingCategory(null);
                              }
                            }}
                          />
                        ) : (
                          category.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingCategory === category.id ? (
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                const input = e.currentTarget.parentElement?.parentElement?.previousElementSibling?.querySelector('input');
                                handleUpdateCategory(category.id, input?.value || "");
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setEditingCategory(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setEditingCategory(category.id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Locations Table */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Locations</h3>
          <div className="flex space-x-2 mb-4">
            <Input
              type="text"
              placeholder="New location name"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
            />
            <Button onClick={handleAddLocation}>Add</Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                      No locations found. Add your first location above.
                    </TableCell>
                  </TableRow>
                ) : (
                  locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell>
                        {editingLocation === location.id ? (
                          <Input
                            type="text"
                            defaultValue={location.name}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateLocation(location.id, (e.target as HTMLInputElement).value);
                              } else if (e.key === "Escape") {
                                setEditingLocation(null);
                              }
                            }}
                          />
                        ) : (
                          location.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingLocation === location.id ? (
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                const input = e.currentTarget.parentElement?.parentElement?.previousElementSibling?.querySelector('input');
                                handleUpdateLocation(location.id, input?.value || "");
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setEditingLocation(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setEditingLocation(location.id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteLocation(location.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategoriesLocations;
