
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
import { Check, X, ExternalLink, Video } from 'lucide-react';
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
import { VideoSubmission, VideoStatus } from '@/types/video';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export const AdminVideoSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<VideoSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('video_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSubmissions(data as VideoSubmission[]);
    } catch (error) {
      console.error('Error fetching video submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load video submissions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleApprove = async (submission: VideoSubmission) => {
    setIsProcessing(true);
    try {
      // First, create a new video from the submission
      const { error: insertError } = await supabase
        .from('videos')
        .insert([
          {
            title: submission.title,
            description: submission.description,
            video_type: submission.video_type,
            video_url: submission.video_url,
            status: 'approved',
            user_id: submission.user_id,
          }
        ]);
      
      if (insertError) throw insertError;
      
      // Then update the submission status
      const { error: updateError } = await supabase
        .from('video_submissions')
        .update({ status: 'approved' })
        .eq('id', submission.id);
      
      if (updateError) throw updateError;
      
      // Update the local state
      setSubmissions(submissions.map(s => 
        s.id === submission.id ? { ...s, status: 'approved' as VideoStatus } : s
      ));
      
      toast({
        title: 'Submission approved',
        description: 'The video submission has been approved and published.',
      });
    } catch (error) {
      console.error('Error approving submission:', error);
      toast({
        title: 'Error',
        description: 'There was an error approving the submission. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('video_submissions')
        .update({ status: 'rejected' })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the local state
      setSubmissions(submissions.map(s => 
        s.id === id ? { ...s, status: 'rejected' as VideoStatus } : s
      ));
      
      toast({
        title: 'Submission rejected',
        description: 'The video submission has been rejected.',
      });
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast({
        title: 'Error',
        description: 'There was an error rejecting the submission. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
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
          <p className="text-muted-foreground">Loading submissions...</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>All video submissions from users.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Details</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No submissions found.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{submission.title}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                          {submission.description}
                        </span>
                        {submission.business_name && (
                          <span className="text-xs mt-1">
                            Business: {submission.business_name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span>{submission.name}</span>
                        <span className="text-xs text-muted-foreground">{submission.email}</span>
                        {submission.contact_number && (
                          <span className="text-xs text-muted-foreground">{submission.contact_number}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getVideoTypeIcon(submission.video_type)}</TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(submission.video_url, '_blank')}
                          title="View video"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        
                        {submission.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-500 hover:text-green-600 hover:bg-green-50"
                              onClick={() => handleApprove(submission)}
                              disabled={isProcessing}
                              title="Approve submission"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  disabled={isProcessing}
                                  title="Reject submission"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Reject this submission?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to reject this video submission?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleReject(submission.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Reject
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
