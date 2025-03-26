
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PenLine, Trash2, Video, ExternalLink } from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import AdminVideoForm from './AdminVideoForm';
import { Video as VideoType, VideoStatus } from '@/types/video';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export const AdminVideosList: React.FC = () => {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVideos(data as VideoType[]);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: 'Error',
        description: 'Failed to load videos. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleEdit = (video: VideoType) => {
    setSelectedVideo(video);
    setIsEditFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setVideos(videos.filter(video => video.id !== id));
      toast({
        title: 'Video deleted',
        description: 'The video has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: 'Error',
        description: 'There was an error deleting the video. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: VideoStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getVideoTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube':
        return <Badge variant="outline" className="flex items-center gap-1"><Video className="h-3 w-3" /> YouTube</Badge>;
      case 'instagram':
        return <Badge variant="outline" className="flex items-center gap-1"><Video className="h-3 w-3" /> Instagram</Badge>;
      case 'upload':
        return <Badge variant="outline" className="flex items-center gap-1"><Video className="h-3 w-3" /> Uploaded</Badge>;
      default:
        return <Badge variant="outline"><Video className="h-3 w-3" /> Unknown</Badge>;
    }
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading videos...</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>A list of all videos in the system.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No videos found. Add a new video to get started.
                  </TableCell>
                </TableRow>
              ) : (
                videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{video.title}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                          {video.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getVideoTypeIcon(video.video_type)}</TableCell>
                    <TableCell>{getStatusBadge(video.status)}</TableCell>
                    <TableCell>{new Date(video.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(video.video_url, '_blank')}
                          title="View video"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(video)}
                          title="Edit video"
                        >
                          <PenLine className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              title="Delete video"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                video from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(video.id)}
                                className={cn(
                                  "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                                  isDeleting && "opacity-50 cursor-not-allowed"
                                )}
                                disabled={isDeleting}
                              >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      <AdminVideoForm
        open={isEditFormOpen}
        onOpenChange={setIsEditFormOpen}
        video={selectedVideo || undefined}
        onSuccess={fetchVideos}
      />
    </div>
  );
};
