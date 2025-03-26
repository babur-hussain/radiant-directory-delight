
import React, { useState, useRef } from 'react';
import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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

  const parseCSV = (csvText: string) => {
    try {
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Map CSV headers to database columns
      const columnMap: Record<string, string> = {
        'Business Name': 'name',
        'Category': 'category', 
        'Address': 'address',
        'Mobile Number': 'phone',
        'Review': 'rating',
        'Description': 'description',
        'Email': 'email',
        'Website': 'website',
        'Tags': 'tags',
        'Featured': 'featured',
        'Image': 'image'
      };
      
      // Process data rows
      const businesses = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Skip empty lines
        
        const values = lines[i].split(',').map(val => val.trim().replace(/"/g, ''));
        if (values.length < headers.length) continue; // Skip incomplete rows
        
        const business: Record<string, any> = {};
        let businessName = '';
        
        // Map CSV values to database columns
        headers.forEach((header, index) => {
          const dbColumn = columnMap[header] || header.toLowerCase().replace(/\s+/g, '_');
          const value = values[index];
          
          if (header === 'Business Name') {
            businessName = value;
            business.name = value;
          } else if (header === 'Tags') {
            business.tags = value.split(';').map((tag: string) => tag.trim());
          } else if (header === 'Review' || header === 'Rating') {
            business.rating = parseFloat(value) || 0;
          } else if (header === 'Featured') {
            business.featured = value.toLowerCase() === 'true' || value === '1';
          } else if (dbColumn in columnMap) {
            business[dbColumn] = value;
          }
        });
        
        // Skip if no business name (only required field)
        if (businessName) {
          // Add timestamp fields with proper format
          business.created_at = new Date().toISOString();
          business.updated_at = new Date().toISOString();
          
          // Add defaults for missing fields
          business.reviews = business.reviews || 0; 
          business.rating = business.rating || 0;
          business.category = business.category || 'Uncategorized';
          business.featured = business.featured || false;
          
          businesses.push(business);
        }
      }
      
      return businesses;
    } catch (error) {
      console.error('Error parsing CSV:', error);
      throw new Error('Failed to parse CSV file');
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsProcessing(true);
      setUploadProgress(10);
      onUploadStart();
      
      // Read the file
      const text = await values.file.text();
      setUploadProgress(30);
      
      // Parse CSV data
      const businesses = parseCSV(text);
      
      if (businesses.length === 0) {
        toast({
          title: "No valid data",
          description: "The CSV file does not contain any valid business entries",
          variant: "destructive"
        });
        
        onUploadComplete(false, "No valid data found in the CSV file");
        return;
      }
      
      setUploadProgress(60);
      console.log(`Parsed ${businesses.length} businesses from CSV`);
      
      // Process businesses in chunks to avoid large payloads
      const chunkSize = 50;
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < businesses.length; i += chunkSize) {
        const chunk = businesses.slice(i, i + chunkSize);
        
        try {
          const { data, error } = await supabase
            .from('businesses')
            .insert(chunk)
            .select();
          
          if (error) {
            console.error('Chunk error:', error);
            errorCount += chunk.length;
          } else {
            successCount += (data?.length || 0);
          }
        } catch (err) {
          console.error('Error uploading chunk:', err);
          errorCount += chunk.length;
        }
        
        // Update progress
        const progressValue = 60 + Math.round((i / businesses.length) * 40);
        setUploadProgress(Math.min(progressValue, 99));
      }
      
      setUploadProgress(100);
      
      toast({
        title: "Upload Completed",
        description: `${successCount} businesses processed successfully, ${errorCount} failed`,
        variant: errorCount > 0 ? "default" : "default"
      });
      
      onUploadComplete(true, `Successfully processed ${successCount} businesses`, successCount);
    } catch (error) {
      console.error("Failed to process CSV data:", error);
      toast({
        title: "Processing Error",
        description: "Failed to process CSV data: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive"
      });
      onUploadComplete(false, "Failed to process CSV data: " + (error instanceof Error ? error.message : String(error)));
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
