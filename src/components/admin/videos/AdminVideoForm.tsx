
import React, { useRef } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Instagram, Youtube, Upload, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const videoFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  videoType: z.enum(['instagram', 'youtube', 'upload'], { 
    required_error: 'Please select a video type' 
  }),
  videoUrl: z.string().min(1, { message: 'Please enter a valid URL or upload a file' }),
  thumbnailUrl: z.string().optional(),
  status: z.enum(['approved', 'pending'], { 
    required_error: 'Please select a status' 
  }),
});

type VideoFormValues = z.infer<typeof videoFormSchema>;

interface AdminVideoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editVideo?: any; // The video to edit
}

const AdminVideoForm: React.FC<AdminVideoFormProps> = ({ 
  open, 
  onOpenChange,
  editVideo
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: editVideo?.title || '',
      description: editVideo?.description || '',
      videoType: editVideo?.video_type || 'youtube',
      videoUrl: editVideo?.video_url || '',
      thumbnailUrl: editVideo?.thumbnail_url || '',
      status: editVideo?.status || 'approved',
    },
  });
  
  const videoType = form.watch('videoType');
  
  const saveVideoMutation = useMutation({
    mutationFn: async (values: VideoFormValues) => {
      if (editVideo) {
        // Update existing video
        const { error } = await supabase
          .from('videos')
          .update({
            title: values.title,
            description: values.description,
            video_type: values.videoType,
            video_url: values.videoUrl,
            thumbnail_url: values.thumbnailUrl || null,
            status: values.status,
          })
          .eq('id', editVideo.id);
        
        if (error) throw error;
        return { ...values, id: editVideo.id };
      } else {
        // Create new video
        const { data, error } = await supabase
          .from('videos')
          .insert({
            title: values.title,
            description: values.description,
            video_type: values.videoType,
            video_url: values.videoUrl,
            thumbnail_url: values.thumbnailUrl || null,
            status: values.status,
            user_id: user?.id || null,
          })
          .select();
        
        if (error) throw error;
        return data[0];
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      
      toast({
        title: editVideo ? "Video updated" : "Video created",
        description: editVideo 
          ? "The video has been successfully updated." 
          : "The video has been successfully created.",
      });
      
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error saving video:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${editVideo ? 'update' : 'create'} the video. Please try again.`,
      });
    },
  });
  
  const handleFileUpload = async (file: File, isVideo: boolean) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = isVideo ? `videos/${fileName}` : `thumbnails/${fileName}`;
      
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
      
      if (isVideo) {
        form.setValue('videoUrl', publicUrl);
      } else {
        form.setValue('thumbnailUrl', publicUrl);
      }
      
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
        description: `There was a problem uploading your ${isVideo ? 'video' : 'thumbnail'}. Please try again.`
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editVideo ? "Edit Video" : "Add New Video"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(values => saveVideoMutation.mutate(values))} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a title for the video" {...field} />
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
                      placeholder="Describe the video content" 
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
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="instagram" id="instagram-admin" />
                        <Label htmlFor="instagram-admin" className="flex items-center gap-1">
                          <Instagram className="h-4 w-4" /> Instagram
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="youtube" id="youtube-admin" />
                        <Label htmlFor="youtube-admin" className="flex items-center gap-1">
                          <Youtube className="h-4 w-4" /> YouTube
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="upload" id="upload-admin" />
                        <Label htmlFor="upload-admin" className="flex items-center gap-1">
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
                          id="file-upload-admin"
                          type="file"
                          accept="video/*"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(e.target.files[0], true);
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
                      <Input {...field} placeholder={`Enter the ${videoType} URL`} />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {videoType === 'upload' && (
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail Image (Optional)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input
                          id="thumbnail-upload"
                          type="file"
                          accept="image/*"
                          ref={thumbnailInputRef}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(e.target.files[0], false);
                            }
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            {...field}
                            readOnly
                            placeholder="No thumbnail chosen"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => thumbnailInputRef.current?.click()}
                            disabled={isUploading}
                          >
                            Browse
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="approved">Approved (Published)</SelectItem>
                      <SelectItem value="pending">Pending (Draft)</SelectItem>
                    </SelectContent>
                  </Select>
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
              <Button 
                type="submit" 
                disabled={isUploading || saveVideoMutation.isPending}
              >
                {saveVideoMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editVideo ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {editVideo ? "Update" : "Save"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminVideoForm;
