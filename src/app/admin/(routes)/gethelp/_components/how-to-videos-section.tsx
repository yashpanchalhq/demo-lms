
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

interface HowToVideosSectionProps {
  videos: { title: string; url: string }[];
}

export const HowToVideosSection = ({ videos }: HowToVideosSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How-to Videos</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <div key={index} className="space-y-2">
            <div className="aspect-video bg-gray-200 rounded-md flex items-center justify-center text-muted-foreground">
              {/* Placeholder for video player */}
              Video Player Placeholder
            </div>
            <h4 className="font-medium">{video.title}</h4>
            <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
              Watch Video
            </a>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
