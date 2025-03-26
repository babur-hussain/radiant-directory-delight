
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Instagram, Youtube, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const videoFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  videoType: z.enum(['instagram', 'youtube', 'upload'], { 
    required_error: 'Please select a video type' 
  }),
  videoUrl: z.string().min(1, { message: 'Please enter a valid URL or upload a file' }),
  businessName: z.string().optional(),
  contactNumber: z.string().optional(),
});

type VideoFormValues = z.infer<typeof videoFormSchema>;

interface VideoSubmissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VideoSubmissionForm: React.FC<VideoSubmissionFormProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      title: '',
      description: '',
      videoType: 'instagram',
      videoUrl: '',
      businessName: '',
      contactNumber: '',
    },
  });

  const videoType = form.watch('videoType');

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `videos/${fileName}`;
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      clearInterval(interval);
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);
      
      form.setValue('videoUrl', publicUrl);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was a problem uploading your video. Please try again."
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onSubmit = async (data: VideoFormValues) => {
    try {
      // Save submission to Supabase
      const { error } = await supabase.from('video_submissions').insert({
        name: data.name,
        email: data.email,
        title: data.title,
        description: data.description,
        video_type: data.videoType,
        video_url: data.videoUrl,
        business_name: data.businessName || null,
        contact_number: data.contactNumber || null,
        user_id: user?.id || null,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your video story has been submitted successfully.",
      });
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "There was a problem submitting your video story. Please try again."
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Submit Your Video Story</DialogTitle>
          <DialogDescription>
            Share your inspiring business journey with our community.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
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
                      <Input placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your business name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your contact number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a title for your video" {...field} />
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
                    <Textarea 
                      placeholder="Describe your business journey or success story" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="videoType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Source</FormLabel>
                  <FormControl>
                    <RadioGroup
                      className="flex items-center space-x-4"
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="instagram" id="instagram" />
                        <Label htmlFor="instagram" className="flex items-center gap-1">
                          <Instagram className="h-4 w-4" /> Instagram
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="youtube" id="youtube" />
                        <Label htmlFor="youtube" className="flex items-center gap-1">
                          <Youtube className="h-4 w-4" /> YouTube
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="upload" id="upload" />
                        <Label htmlFor="upload" className="flex items-center gap-1">
                          <Upload className="h-4 w-4" /> Upload
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {videoType === 'instagram' ? 'Instagram Post URL' : 
                    videoType === 'youtube' ? 'YouTube Video URL' : 'Upload Video'}
                  </FormLabel>
                  <FormControl>
                    {videoType === 'upload' ? (
                      <div className="space-y-2">
                        <Input
                          id="file-upload"
                          type="file"
                          accept="video/*"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(e.target.files[0]);
                            }
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            {...field}
                            readOnly
                            placeholder="No file chosen"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                          >
                            Browse
                          </Button>
                        </div>
                        {isUploading && (
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-primary h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                            <p className="text-xs text-gray-500 mt-1">
                              Uploading: {uploadProgress}%
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Input {...field} placeholder={`Enter your ${videoType} URL`} />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-2 flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>Submit Story</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default VideoSubmissionForm;
