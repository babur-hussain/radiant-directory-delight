
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Video, VideoType } from '@/types/video';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  video_type: z.enum(['instagram', 'youtube', 'upload']),
  video_url: z.string().url({ message: 'Please enter a valid URL' }),
  thumbnail_url: z.string().url({ message: 'Please enter a valid thumbnail URL' }).optional().or(z.literal('')),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
});

type FormValues = z.infer<typeof formSchema>;

interface AdminVideoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video?: Video;
  onSuccess?: () => void;
}

const AdminVideoForm: React.FC<AdminVideoFormProps> = ({
  open,
  onOpenChange,
  video,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      video_type: 'youtube' as VideoType,
      video_url: '',
      thumbnail_url: '',
      status: 'pending',
    }
  });

  useEffect(() => {
    if (video) {
      form.reset({
        title: video.title,
        description: video.description,
        video_type: video.video_type,
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url || '',
        status: video.status,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        video_type: 'youtube',
        video_url: '',
        thumbnail_url: '',
        status: 'pending',
      });
    }
  }, [video, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (video) {
        // Update existing video
        const { error } = await supabase
          .from('videos')
          .update({
            title: values.title,
            description: values.description,
            video_type: values.video_type,
            video_url: values.video_url,
            thumbnail_url: values.thumbnail_url || null,
            status: values.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', video.id);

        if (error) throw error;
        toast({
          title: 'Video updated',
          description: 'The video has been successfully updated.',
        });
      } else {
        // Create new video
        const { error } = await supabase
          .from('videos')
          .insert([
            {
              title: values.title,
              description: values.description,
              video_type: values.video_type,
              video_url: values.video_url,
              thumbnail_url: values.thumbnail_url || null,
              status: values.status,
            }
          ]);

        if (error) throw error;
        toast({
          title: 'Video added',
          description: 'The video has been successfully added.',
        });
      }

      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving video:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the video. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{video ? 'Edit Video' : 'Add New Video'}</DialogTitle>
          <DialogDescription>
            {video ? 'Update the video details below.' : 'Enter the details for the new video.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter video title" {...field} />
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
                    <Textarea placeholder="Enter video description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="video_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Type</FormLabel>
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
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="upload">Upload</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter video URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thumbnail_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter thumbnail URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : video ? 'Update Video' : 'Add Video'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminVideoForm;
