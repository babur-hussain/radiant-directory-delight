
export type VideoType = 'instagram' | 'youtube' | 'upload';
export type VideoStatus = 'pending' | 'approved' | 'rejected';

export interface Video {
  id: string;
  title: string;
  description: string;
  video_type: VideoType;
  video_url: string;
  thumbnail_url?: string;
  status: VideoStatus;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface VideoSubmission {
  id: string;
  name: string;
  email: string;
  title: string;
  description: string;
  video_type: VideoType;
  video_url: string;
  business_name?: string;
  contact_number?: string;
  status: VideoStatus;
  created_at: string;
  user_id?: string;
}
