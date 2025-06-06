
import React, { useState, useRef } from 'react';
import { FileUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { processCsvData } from '@/lib/csv-utils';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Schema validation for file upload
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
  const [csvError, setCsvError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState(false);

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
      setCsvError(null);
      setPermissionError(false);
      setUploadProgress(10);
      onUploadStart();
      
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        if (event.target?.result) {
          const csvContent = event.target.result as string;
          
          setUploadProgress(30);
          
          try {
            setUploadProgress(50);
            const { success, businesses, message } = await processCsvData(csvContent);
            setUploadProgress(100);
            
            // Check if we had permission errors
            if (message.includes('permission') || message.includes('security policy')) {
              setPermissionError(true);
              setCsvError("You don't have permission to add businesses. Please check your account permissions.");
              toast({
                title: "Permission Error",
                description: "You don't have permission to add businesses to the database.",
                variant: "destructive"
              });
              onUploadComplete(false, "Permission error: Cannot add businesses to the database");
              return;
            }
            
            if (success && businesses.length > 0) {
              toast({
                title: "Upload Successful",
                description: `${businesses.length} businesses processed successfully`,
              });
              onUploadComplete(true, message, businesses.length);
            } else if (success && businesses.length === 0) {
              toast({
                title: "Upload Completed",
                description: "No businesses were imported. Check if your CSV format is correct.",
                variant: "destructive"
              });
              setCsvError("No businesses were imported. Make sure your CSV has the required 'Business Name' column.");
              onUploadComplete(false, "No businesses were imported");
            } else {
              toast({
                title: "Upload Issues",
                description: message,
                variant: "destructive"
              });
              setCsvError(message);
              onUploadComplete(false, message);
            }
          } catch (error) {
            console.error("Failed to process CSV data:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            
            // Check for permission errors
            if (errorMessage.includes('permission') || errorMessage.includes('security policy')) {
              setPermissionError(true);
              setCsvError("You don't have permission to add businesses. Please check your account permissions.");
              toast({
                title: "Permission Error",
                description: "You don't have permission to add businesses to the database.",
                variant: "destructive"
              });
            } else {
              toast({
                title: "Processing Error",
                description: "Failed to process CSV data: " + errorMessage,
                variant: "destructive"
              });
              setCsvError("Failed to process CSV data: " + errorMessage);
            }
            
            onUploadComplete(false, "Failed to process CSV data: " + errorMessage);
          }
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "File Error",
          description: "Error reading the file",
          variant: "destructive"
        });
        setCsvError("Error reading the file");
        onUploadComplete(false, "Error reading the file");
      };
      
      reader.readAsText(values.file);
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred: " + errorMessage,
        variant: "destructive"
      });
      setCsvError("An unexpected error occurred: " + errorMessage);
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
      {permissionError && (
        <Alert variant="destructive" className="mb-4">
          <Shield className="h-4 w-4" />
          <AlertTitle>Permission Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to add businesses to the database. This usually means your account doesn't have the necessary privileges. Please contact an administrator for help.
          </AlertDescription>
        </Alert>
      )}
    
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
                  <strong>Required format:</strong> Your CSV must have at least a <strong>Business Name</strong> column. 
                  Optional columns: Category, Address, Mobile Number, Review, Description, Email, Website, Tags.
                </FormDescription>
                <FormMessage />
                
                {csvError && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    <strong>Error:</strong> {csvError}
                  </div>
                )}
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
