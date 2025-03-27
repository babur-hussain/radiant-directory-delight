
import React, { useState } from 'react';
import VideoSlider, { VideoSource } from './VideoSlider';
import VideoSubmissionForm from './VideoSubmissionForm';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Video, VideoType, VideoStatus } from '@/types/video';

// Fetch videos from Supabase
const fetchVideos = async (): Promise<Video[]> => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching videos:', error);
    throw new Error('Failed to fetch videos');
  }
  
  // Cast the video_type to VideoType and status to VideoStatus to satisfy TypeScript
  return (data || []).map(video => ({
    ...video,
    video_type: video.video_type as VideoType,
    status: video.status as VideoStatus
  }));
};

// Fallback demo videos
const demoVideos: VideoSource[] = [
  {
    id: '1',
    type: 'instagram',
    url: 'https://www.instagram.com/p/C1P1uwOIXs7/',
    title: 'Business Success Story',
  },
  {
    id: '2',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Entrepreneur Interview',
  },
];

const VideoReelsSection: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Fetch videos with react-query
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: fetchVideos,
    retry: 1,
  });
  
  // Convert to VideoSource format
  const videoSources: VideoSource[] = videos ? videos.map(video => ({
    id: video.id,
    type: video.video_type,
    url: video.video_url,
    thumbnail: video.thumbnail_url,
    title: video.title,
  })) : demoVideos;
  
  // Use demo videos if loading or error
  const displayVideos = (videos && videos.length > 0) ? videoSources : demoVideos;

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
              Explore Success Stories
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Inspiring Business <span className="text-gradient-blue">Journeys</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Watch how businesses across India are thriving and making an impact in their communities.
          </p>
        </div>
        
        <VideoSlider videos={displayVideos} />
        
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Have an inspiring business story to share?
          </p>
          <button 
            onClick={() => setIsFormOpen(true)}
            className={cn(
              "inline-flex items-center text-primary hover:underline",
              "text-sm font-medium"
            )}
          >
            Submit your video story
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <VideoSubmissionForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
      />
    </section>
  );
};

export default VideoReelsSection;
