
import React, { useState, useRef } from 'react';
import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { processCsvData } from '@/lib/csv-utils';
import { toast } from '@/hooks/use-toast';

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
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
    onUploadStart();
    
    try {
      // Read the file
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        if (event.target?.result) {
          const csvContent = event.target.result as string;
          
          try {
            const { success, businesses, message } = await processCsvData(csvContent);
            
            if (success) {
              toast({
                title: "Upload Successful",
                description: `${businesses.length} businesses processed successfully`,
              });
              onUploadComplete(true, `Successfully added ${businesses.length} businesses to MongoDB`, businesses.length);
            } else {
              onUploadComplete(false, message);
            }
          } catch (error) {
            console.error("Failed to process CSV data:", error);
            onUploadComplete(false, "Failed to process CSV data: " + (error instanceof Error ? error.message : String(error)));
          }
        }
      };
      
      reader.onerror = () => {
        onUploadComplete(false, "Error reading the file");
      };
      
      reader.readAsText(values.file);
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      onUploadComplete(false, "An unexpected error occurred");
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

          <div className="flex justify-end">
            <Button type="submit" disabled={!form.formState.isValid}>
              Upload and Process
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CSVUploader;
