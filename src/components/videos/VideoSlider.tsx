
import React, { useState, useRef } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Instagram, Youtube, Upload, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export type VideoSource = {
  id: string;
  type: 'instagram' | 'youtube' | 'upload';
  url: string;
  thumbnail?: string;
  title: string;
};

interface VideoSliderProps {
  videos: VideoSource[];
}

const VideoSlider: React.FC<VideoSliderProps> = ({ videos }) => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const isMobile = useIsMobile();

  const getEmbedUrl = (video: VideoSource) => {
    if (video.type === 'instagram') {
      // Instagram embed URL format
      return `https://www.instagram.com/p/${video.url.split('/').pop()}/embed`;
    } else if (video.type === 'youtube') {
      // YouTube embed URL format
      const videoId = video.url.includes('youtu.be') 
        ? video.url.split('/').pop() 
        : video.url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // For upload type, return the direct URL
    return video.url;
  };

  const handleVideoPlay = (videoId: string) => {
    if (activeVideo && activeVideo !== videoId) {
      // Pause the previously playing video
      const prevVideo = videoRefs.current[activeVideo];
      if (prevVideo) prevVideo.pause();
    }
    setActiveVideo(videoId);
  };

  const togglePlayPause = (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (!video) return;
    
    if (video.paused) {
      video.play();
      handleVideoPlay(videoId);
    } else {
      video.pause();
      setActiveVideo(null);
    }
  };
  
  const getVideoIcon = (type: VideoSource['type']) => {
    switch (type) {
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      case 'upload': return <Upload className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="video-slider-container w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {videos.map((video) => (
            <CarouselItem 
              key={video.id} 
              className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 pl-4"
            >
              <div className="relative rounded-lg overflow-hidden bg-black aspect-[9/16] sm:aspect-video shadow-lg">
                {video.type === 'upload' ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video
                      ref={(el) => (videoRefs.current[video.id] = el)}
                      src={video.url}
                      poster={video.thumbnail}
                      className="w-full h-full object-cover"
                      onPlay={() => handleVideoPlay(video.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute bg-black/30 hover:bg-black/50 text-white rounded-full"
                      onClick={() => togglePlayPause(video.id)}
                    >
                      {activeVideo === video.id ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                    </Button>
                  </div>
                ) : (
                  <iframe 
                    src={getEmbedUrl(video)}
                    className="w-full h-full border-0"
                    title={video.title}
                    allowFullScreen
                    loading="lazy"
                  />
                )}
                
                <div className={cn(
                  "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent",
                  "p-3 flex items-center justify-between text-white"
                )}>
                  <div className="flex items-center">
                    <span className="bg-primary/90 p-1 rounded-full">
                      {getVideoIcon(video.type)}
                    </span>
                    <span className="ml-2 text-sm font-medium truncate">
                      {video.title}
                    </span>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-center items-center gap-4 mt-4">
          <CarouselPrevious 
            className={cn(
              "static relative transform-none",
              "bg-primary hover:bg-primary/90 text-primary-foreground"
            )} 
          />
          <CarouselNext 
            className={cn(
              "static relative transform-none",
              "bg-primary hover:bg-primary/90 text-primary-foreground"
            )} 
          />
        </div>
      </Carousel>
    </div>
  );
};

export default VideoSlider;
