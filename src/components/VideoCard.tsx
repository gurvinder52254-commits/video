import React from 'react';
import type { Video } from '../hooks/useVideos';
import { Play, FileVideo } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
  isActive?: boolean;
}

export function VideoCard({ video, onClick, isActive }: VideoCardProps) {
  return (
    <div 
      className={`video-card ${isActive ? 'active-card' : ''}`} 
      onClick={() => onClick(video)}
    >
      <div className="thumbnail-container">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="thumbnail" />
        ) : video.isLocal ? (
          <video src={video.url} className="thumbnail" style={{ objectFit: 'cover', pointerEvents: 'none' }} preload="metadata" muted playsInline />
        ) : (
          <div className="thumbnail" style={{ background: 'var(--bg-lighter)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileVideo size={48} color="var(--text-muted)" />
          </div>
        )}
        <div className="play-overlay">
          <Play size={24} fill={isActive ? "white" : "currentColor"} />
        </div>
        {video.duration && (
          <div className="duration-badge">
            {video.duration}
          </div>
        )}
      </div>
      <div className="video-info">
        <h3 className="video-title">{video.title}</h3>
        <p className="video-description">{video.description || 'No description available.'}</p>
      </div>
    </div>
  );
}
