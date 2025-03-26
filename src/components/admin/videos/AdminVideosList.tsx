
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Loader2, 
  Instagram, 
  Youtube, 
  Upload 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import AdminVideoForm from './AdminVideoForm';
import { Badge } from '@/components/ui/badge';
import { VideoSource } from '@/components/videos/VideoSlider';

type Video = {
  id: string;
  title: string;
  description: string;
  video_type: 'instagram' | 'youtube' | 'upload';
  video_url: string;
  thumbnail_url?: string;
  created_at: string;
  status: 'approved' | 'pending' | 'rejected';
};

const fetchVideos = async (): Promise<Video[]> => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const AdminVideosList: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [videoToEdit, setVideoToEdit] = useState<Video | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoSource | null>(null);
  
  const { data: videos, isLoading } = useQuery({
    queryKey: ['admin-videos'],
    queryFn: fetchVideos,
  });
  
  const deleteVideoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast({
        title: "Video deleted",
        description: "The video has been successfully deleted.",
      });
      setVideoToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting video:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the video. Please try again.",
      });
    },
  });
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'youtube': return <Youtube className="h-4 w-4" />;
      case 'upload': return <Upload className="h-4 w-4" />;
      default: return null;
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const handlePreview = (video: Video) => {
    setPreviewVideo({
      id: video.id,
      type: video.video_type,
      url: video.video_url,
      thumbnail: video.thumbnail_url,
      title: video.title
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading videos...</span>
      </div>
    );
  }
  
  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos && videos.length > 0 ? (
              videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">{video.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getTypeIcon(video.video_type)}
                      <span className="capitalize">{video.video_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(video.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={video.status === 'approved' ? 'default' : 'outline'}>
                      {video.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreview(video)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setVideoToEdit(video)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setVideoToDelete(video.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No videos found. Add your first video.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!videoToDelete} onOpenChange={(open) => !open && setVideoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the video.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => videoToDelete && deleteVideoMutation.mutate(videoToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteVideoMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Video Form */}
      {videoToEdit && (
        <AdminVideoForm 
          open={!!videoToEdit} 
          onOpenChange={(open) => !open && setVideoToEdit(null)}
          editVideo={videoToEdit}
        />
      )}
      
      {/* Video Preview Modal */}
      <AlertDialog open={!!previewVideo} onOpenChange={(open) => !open && setPreviewVideo(null)}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{previewVideo?.title}</AlertDialogTitle>
          </AlertDialogHeader>
          
          {previewVideo && (
            <div className="aspect-[9/16] w-full max-w-md mx-auto bg-black">
              {previewVideo.type === 'upload' ? (
                <video
                  src={previewVideo.url}
                  controls
                  poster={previewVideo.thumbnail}
                  className="w-full h-full object-contain"
                />
              ) : previewVideo.type === 'youtube' ? (
                <iframe
                  src={`https://www.youtube.com/embed/${previewVideo.url.includes('youtu.be') 
                    ? previewVideo.url.split('/').pop() 
                    : previewVideo.url.split('v=')[1]?.split('&')[0]}`}
                  className="w-full h-full"
                  title={previewVideo.title}
                  allowFullScreen
                />
              ) : (
                <iframe
                  src={`https://www.instagram.com/p/${previewVideo.url.split('/').pop()}/embed`}
                  className="w-full h-full"
                  title={previewVideo.title}
                  allowFullScreen
                />
              )}
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
