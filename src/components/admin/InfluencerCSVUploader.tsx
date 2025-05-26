
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { processInfluencerCsvData } from '@/lib/csv/influencerProcessor';

interface InfluencerCSVUploaderProps {
  onUploadStart: () => void;
  onUploadComplete: (success: boolean, message: string, count?: number) => void;
}

const InfluencerCSVUploader: React.FC<InfluencerCSVUploaderProps> = ({ 
  onUploadStart, 
  onUploadComplete 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      onUploadComplete(false, "Please select a CSV file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      onUploadComplete(false, "File size must be less than 10MB");
      return;
    }

    try {
      onUploadStart();
      setUploadProgress("Reading file...");
      
      const text = await file.text();
      
      setUploadProgress("Processing influencer data...");
      const result = await processInfluencerCsvData(text);
      
      if (result.success) {
        onUploadComplete(true, result.message, result.influencers.length);
      } else {
        onUploadComplete(false, result.message);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      onUploadComplete(false, `Error processing file: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setUploadProgress(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-gray-100 rounded-full">
            <Upload className="h-8 w-8 text-gray-600" />
          </div>
          
          <div>
            <p className="text-lg font-medium">Upload Influencer CSV File</p>
            <p className="text-gray-500 mt-1">
              Drag and drop your CSV file here, or click to browse
            </p>
          </div>
          
          <Button 
            onClick={openFileDialog}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Choose File
          </Button>
        </div>
      </div>

      {uploadProgress && (
        <div className="flex items-center justify-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>{uploadProgress}</span>
        </div>
      )}

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-700" />
        <AlertDescription className="text-blue-700">
          <div className="font-medium mb-1">CSV Format Requirements:</div>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Name</strong> is the only required field</li>
            <li>Separate multiple tags with commas (fashion, lifestyle, beauty)</li>
            <li>Separate multiple brands with commas (Nike, Adidas, Puma)</li>
            <li>Use true/false for Featured field</li>
            <li>Priority should be a number (higher = more priority)</li>
          </ul>
        </AlertDescription>
      </Alert>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};

export default InfluencerCSVUploader;
