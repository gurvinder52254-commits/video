import React from 'react';
import type { Video } from '../hooks/useVideos';

interface VideoPlayerProps {
  video: Video | null;
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  if (!video) {
    return (
      <div className="player-container" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        <p style={{ color: 'var(--text-muted)' }}>Select a video to play</p>
      </div>
    );
  }

  return (
    <div className="player-container">
      <div className="player-wrapper">
        <video
          key={video.id}
          src={video.url}
          controls
          autoPlay
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
      <div className="player-info">
        <h1>{video.title}</h1>
        <p>{video.description || 'A stunning video experience.'}</p>
      </div>
    </div>
  );
}
