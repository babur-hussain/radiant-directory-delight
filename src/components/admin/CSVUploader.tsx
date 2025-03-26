
import React, { useState, useRef } from 'react';
import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Business, parseBusinessesCSV } from '@/lib/csv-utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a CSV file' })
    .refine(file => file.name.endsWith('.csv'), { message: 'Only CSV files are allowed' })
    .refine(file => file.size < 5 * 1024 * 1024, { message: 'File size should be less than 5MB' })
});

interface CSVUploaderProps {
  onUploadStart: () => void;
  onUploadComplete: (success: boolean, message: string, count?: number) => void;
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({ onUploadStart, onUploadComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
    mode: "onChange",
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      form.setValue('file', e.dataTransfer.files[0], { shouldValidate: true });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsProcessing(true);
      setUploadProgress(10);
      onUploadStart();
      
      // Process CSV data
      try {
        setUploadProgress(30);
        
        // Parse the CSV file
        const businesses = await parseBusinessesCSV(values.file);
        
        setUploadProgress(60);
        
        if (businesses.length === 0) {
          toast({
            title: "No valid data",
            description: "The CSV file does not contain any valid business entries",
            variant: "destructive"
          });
          
          onUploadComplete(false, "No valid data found in the CSV file");
          return;
        }
        
        // Upload to Supabase
        const businessData = businesses.map(business => ({
          name: business.name,
          category: business.category,
          description: business.description,
          address: business.address,
          phone: business.phone,
          email: business.email,
          website: business.website,
          image: business.image,
          hours: business.hours,
          rating: business.rating,
          reviews: business.reviews,
          featured: business.featured,
          tags: business.tags,
          latitude: business.latitude,
          longitude: business.longitude,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        const { error } = await supabase
          .from('businesses')
          .insert(businessData);
          
        if (error) throw error;
        
        setUploadProgress(100);
        
        toast({
          title: "Upload Successful",
          description: `${businesses.length} businesses processed successfully`,
        });
        
        onUploadComplete(true, `Successfully processed ${businesses.length} businesses`, businesses.length);
      } catch (error) {
        console.error("Failed to process CSV data:", error);
        toast({
          title: "Processing Error",
          description: "Failed to process CSV data: " + (error instanceof Error ? error.message : String(error)),
          variant: "destructive"
        });
        onUploadComplete(false, "Failed to process CSV data: " + (error instanceof Error ? error.message : String(error)));
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      onUploadComplete(false, "An unexpected error occurred");
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="file"
            render={({ field: { onChange, value, ...fieldProps }, formState }) => (
              <FormItem>
                <FormLabel>Upload CSV File</FormLabel>
                <FormControl>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
                      dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <FileUp className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm font-medium">
                        Drag & drop your CSV file here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports: CSV files up to 5MB
                      </p>
                      {value && (
                        <p className="text-sm font-medium mt-2 text-primary">
                          Selected: {value.name} ({(value.size / 1024).toFixed(2)} KB)
                        </p>
                      )}
                      <Input
                        ref={fileInputRef}
                        id="file-upload"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                        {...fieldProps}
                      />
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  The CSV should include these columns: <strong>Business Name</strong>, <strong>Category</strong>, <strong>Address</strong>, <strong>Mobile Number</strong>, and <strong>Review</strong> (for ratings).
                  Optional columns: Description, Email, Website, Reviews (count), Tags (comma-separated), and Image (URL).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {isProcessing && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={!form.formState.isValid || isProcessing}
              className="relative"
            >
              {isProcessing ? 'Processing...' : 'Upload and Process'}
              {isProcessing && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CSVUploader;
