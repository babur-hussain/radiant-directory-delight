
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Video, Star } from 'lucide-react';

const VideoSubmissionPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Submit Your <span className="text-brand-orange">Video</span></h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Share your creative work with businesses and showcase your talent.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Submission Form
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">Video Title</label>
                <Input id="title" placeholder="Enter your video title" />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
                <Textarea id="description" placeholder="Describe your video content" rows={4} />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2">Category</label>
                <Input id="category" placeholder="e.g., Fashion, Food, Tech" />
              </div>
              
              <div>
                <label htmlFor="video-upload" className="block text-sm font-medium mb-2">Upload Video</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">MP4, MOV up to 100MB</p>
                  <Button variant="outline" className="mt-4">Choose File</Button>
                </div>
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium mb-2">Tags</label>
                <Input id="tags" placeholder="Enter tags separated by commas" />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-blue-600" />
                  <p className="font-medium text-blue-900">Submission Guidelines</p>
                </div>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Video should be original content</li>
                  <li>• Maximum file size: 100MB</li>
                  <li>• Supported formats: MP4, MOV</li>
                  <li>• Content should be appropriate and professional</li>
                </ul>
              </div>
              
              <Button className="w-full">Submit Video</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoSubmissionPage;
