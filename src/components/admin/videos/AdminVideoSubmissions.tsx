
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
  Check, 
  X, 
  Loader2, 
  Instagram, 
  Youtube, 
  Upload 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { VideoSource } from '@/components/videos/VideoSlider';

type VideoSubmission = {
  id: string;
  name: string;
  email: string;
  title: string;
  description: string;
  video_type: 'instagram' | 'youtube' | 'upload';
  video_url: string;
  business_name?: string;
  contact_number?: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  user_id?: string;
};

const fetchSubmissions = async (): Promise<VideoSubmission[]> => {
  const { data, error } = await supabase
    .from('video_submissions')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const AdminVideoSubmissions: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submissionToApprove, setSubmissionToApprove] = useState<VideoSubmission | null>(null);
  const [submissionToReject, setSubmissionToReject] = useState<VideoSubmission | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoSource | null>(null);
  
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['video-submissions'],
    queryFn: fetchSubmissions,
  });
  
  const updateSubmissionStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('video_submissions')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      // If approved, also create an entry in the videos table
      if (status === 'approved' && submissionToApprove) {
        const { error: insertError } = await supabase
          .from('videos')
          .insert({
            title: submissionToApprove.title,
            description: submissionToApprove.description,
            video_type: submissionToApprove.video_type,
            video_url: submissionToApprove.video_url,
            status: 'approved',
            user_id: submissionToApprove.user_id || null
          });
        
        if (insertError) throw insertError;
      }
      
      return { id, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['video-submissions'] });
      if (data.status === 'approved') {
        queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
        queryClient.invalidateQueries({ queryKey: ['videos'] });
        toast({
          title: "Submission approved",
          description: "The video has been approved and published.",
        });
        setSubmissionToApprove(null);
      } else {
        toast({
          title: "Submission rejected",
          description: "The video submission has been rejected.",
        });
        setSubmissionToReject(null);
      }
    },
    onError: (error) => {
      console.error('Error updating submission:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update the submission. Please try again.",
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
  
  const handlePreview = (submission: VideoSubmission) => {
    setPreviewVideo({
      id: submission.id,
      type: submission.video_type,
      url: submission.video_url,
      title: submission.title
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading submissions...</span>
      </div>
    );
  }
  
  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submitted By</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions && submissions.length > 0 ? (
              submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.name}</TableCell>
                  <TableCell>{submission.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getTypeIcon(submission.video_type)}
                      <span className="capitalize">{submission.video_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(submission.created_at)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        submission.status === 'approved' ? 'default' : 
                        submission.status === 'rejected' ? 'destructive' : 
                        'outline'
                      }
                    >
                      {submission.status}
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
                        <DropdownMenuItem onClick={() => handlePreview(submission)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        {submission.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => setSubmissionToApprove(submission)}>
                              <Check className="mr-2 h-4 w-4 text-green-500" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setSubmissionToReject(submission)}
                              className="text-destructive focus:text-destructive"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No submissions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Approve Confirmation Dialog */}
      <AlertDialog 
        open={!!submissionToApprove} 
        onOpenChange={(open) => !open && setSubmissionToApprove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve video submission?</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve the video submission and publish it to the website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => 
                submissionToApprove && 
                updateSubmissionStatus.mutate({ 
                  id: submissionToApprove.id, 
                  status: 'approved' 
                })
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {updateSubmissionStatus.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Reject Confirmation Dialog */}
      <AlertDialog 
        open={!!submissionToReject} 
        onOpenChange={(open) => !open && setSubmissionToReject(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject video submission?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reject the video submission. It will not be published to the website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => 
                submissionToReject && 
                updateSubmissionStatus.mutate({ 
                  id: submissionToReject.id, 
                  status: 'rejected' 
                })
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {updateSubmissionStatus.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
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
