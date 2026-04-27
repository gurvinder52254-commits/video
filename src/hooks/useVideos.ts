import { useState, useEffect } from 'react';

export type Video = {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  url: string; // The URL to play
  thumbnail: string;
  createdAt: number;
  isLocal: boolean;
};

export type FeaturedVideo = {
  id: string;
  url: string;
};

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<FeaturedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch videos and featured settings
  useEffect(() => {
    const loadData = async () => {
      try {
        const [videosRes, featuredRes] = await Promise.all([
          fetch('/api/videos'),
          fetch('/api/featured')
        ]);
        
        if (videosRes.ok) {
          setVideos(await videosRes.json());
        }
        if (featuredRes.ok) {
          setFeaturedVideos(await featuredRes.json());
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addFeaturedVideo = async (url: string) => {
    let embedUrl = url;
    if (url.includes('youtu.be/')) {
      const id = url.split('/').pop()?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${id}`;
    } else if (url.includes('watch?v=')) {
      const id = new URLSearchParams(new URL(url).search).get('v');
      embedUrl = `https://www.youtube.com/embed/${id}`;
    }
    
    const newFeatured = { id: Math.random().toString(36).substr(2, 9), url: embedUrl };
    const updatedList = [...featuredVideos, newFeatured];
    
    try {
      await fetch('/api/featured', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList)
      });
      setFeaturedVideos(updatedList);
    } catch (err) {
      console.error('Failed to update featured videos', err);
    }
  };

  const removeFeaturedVideo = async (id: string) => {
    const updatedList = featuredVideos.filter(v => v.id !== id);
    try {
      await fetch('/api/featured', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList)
      });
      setFeaturedVideos(updatedList);
    } catch (err) {
      console.error('Failed to update featured videos', err);
    }
  };

  const updateFeaturedVideoInfo = async (id: string, url: string) => {
    let embedUrl = url;
    if (url.includes('youtu.be/')) {
      const videoId = url.split('/').pop()?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('watch?v=')) {
      const videoId = new URLSearchParams(new URL(url).search).get('v');
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    const updatedList = featuredVideos.map(v => v.id === id ? { ...v, url: embedUrl } : v);
    try {
      await fetch('/api/featured', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList)
      });
      setFeaturedVideos(updatedList);
    } catch (err) {
      console.error('Failed to update featured video', err);
    }
  };

  const uploadFile = async (file: File, id: string, prefix: string) => {
    const filename = `${prefix}-${id}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    const response = await fetch(`/api/upload/${encodeURIComponent(filename)}`, {
      method: 'POST',
      body: file
    });
    const result = await response.json();
    return result.url;
  };

  const addVideo = async (
    title: string,
    videoUrl: string,
    thumbnailUrl: string,
    isLocal: boolean,
    videoFile?: File,
    thumbFile?: File,
    description?: string,
    duration?: string
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    let finalUrl = videoUrl;
    let finalThumb = thumbnailUrl;

    if (isLocal && videoFile) {
      finalUrl = await uploadFile(videoFile, id, 'video');
      if (thumbFile) {
        finalThumb = await uploadFile(thumbFile, id, 'thumb');
      }
    }

    const newVideo: Video = {
      id,
      title,
      description,
      duration: duration || '0:00',
      url: finalUrl,
      thumbnail: finalThumb,
      createdAt: Date.now(),
      isLocal
    };

    try {
      await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVideo)
      });
      setVideos(prev => [newVideo, ...prev]);
    } catch (err) {
      console.error('Failed to save metadata', err);
    }
    return id;
  };

  const updateVideoMetadata = async (id: string, updates: Partial<Video>) => {
    const newVideos = videos.map(v => v.id === id ? { ...v, ...updates } : v);
    setVideos(newVideos);
    try {
      await fetch('/api/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVideos)
      });
    } catch (err) {
      console.error('Failed to update metadata', err);
    }
  };

  const removeVideo = async (id: string) => {
    try {
      await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      setVideos(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      console.error('Failed to delete video', err);
    }
  };

  return { 
    videos, addVideo, updateVideoMetadata, removeVideo, 
    featuredVideos, addFeaturedVideo, removeFeaturedVideo, updateFeaturedVideoInfo, 
    loading 
  };
}
