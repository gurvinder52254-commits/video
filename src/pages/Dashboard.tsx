import React, { useState, useRef } from 'react';
import { useVideos } from '../hooks/useVideos';
import type { Video } from '../hooks/useVideos';
import { Plus, Edit2, Trash2, X, Check, Upload, Link as LinkIcon, FileVideo, Image as ImageIcon } from 'lucide-react';

export function Dashboard() {
  const { videos, addVideo, updateVideoMetadata, removeVideo, featuredVideos, addFeaturedVideo, removeFeaturedVideo, updateFeaturedVideoInfo, loading } = useVideos();
  const [isAdding, setIsAdding] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file');

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    url: '',
    thumbnail: '',
    isLocal: true
  });

  const [files, setFiles] = useState<{ video?: File; thumb?: File }>({});

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateVideoMetadata(editingId, { 
        title: formData.title, 
        description: formData.description,
        url: !formData.isLocal ? formData.url : undefined
      });
      setEditingId(null);
      showStatus('success', 'Video updated successfully!');
    } else {
      await addVideo(
        formData.title,
        uploadMode === 'url' ? formData.url : '',
        formData.thumbnail,
        uploadMode === 'file',
        files.video,
        files.thumb,
        formData.description,
        formData.duration
      );
      setIsAdding(false);
      showStatus('success', 'Video added to library!');
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', duration: '', url: '', thumbnail: '', isLocal: true });
    setFiles({});
    setEditingId(null);
    setIsAdding(false);
  };

  const startEdit = (video: Video) => {
    setEditingId(video.id);
    setUploadMode(video.isLocal ? 'file' : 'url');
    setFormData({
      title: video.title,
      description: video.description || '',
      duration: video.duration || '',
      url: video.url,
      thumbnail: video.thumbnail,
      isLocal: video.isLocal
    });
    setIsAdding(true);
  };

  if (loading) return <div className="container">Loading storage...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {statusMsg && (
        <div className={`glass`} style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '1rem 2rem',
          background: statusMsg.type === 'success' ? '#22c55e' : '#ef4444',
          color: 'white',
          zIndex: 1000,
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {statusMsg.text}
        </div>
      )}
      <div className="dashboard-header">
        <h1>Upload & Manage Videos</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {!isAdding && (
            <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
              <Plus size={18} /> Add New Video
            </button>
          )}
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', border: '2px solid var(--primary-light)' }}>
        <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LinkIcon size={20} /> Premium Featured Experience
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Add videos here. They will play automatically at the bottom of the Home page.
        </p>

        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
          {featuredVideos.map((fv) => (
            <div key={fv.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                className="input-field"
                style={{ flex: 1 }}
                defaultValue={fv.url}
                onBlur={(e) => {
                  if (e.target.value !== fv.url) {
                    updateFeaturedVideoInfo(fv.id, e.target.value);
                    showStatus('success', 'Featured video updated!');
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-outline"
                style={{ borderColor: '#ef4444', color: '#ef4444' }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to remove this featured video?')) {
                    removeFeaturedVideo(fv.id);
                  }
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          const input = (e.target as HTMLFormElement).elements.namedItem('newFeaturedUrl') as HTMLInputElement;
          if (input.value) {
            addFeaturedVideo(input.value);
            input.value = '';
            showStatus('success', 'Featured video added!');
          }
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              name="newFeaturedUrl"
              className="input-field"
              type="url"
              placeholder="Add New YouTube URL (e.g. https://youtu.be/...)"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
              <Plus size={18} /> Add
            </button>
          </div>
        </form>
      </div>

      {isAdding && (
        <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit Video' : 'Add New Video'}</h2>


          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Video Title</label>
              <input
                className="input-field"
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Enter video title"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea
                className="input-field"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter short description"
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>

            {!editingId ? (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <button 
                    type="button" 
                    className={`btn ${uploadMode === 'file' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setUploadMode('file')}
                  >
                    Upload File
                  </button>
                  <button 
                    type="button" 
                    className={`btn ${uploadMode === 'url' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setUploadMode('url')}
                  >
                    YouTube / URL
                  </button>
                </div>
                
                {uploadMode === 'file' ? (
                  <div className="input-group">
                    <label className="input-label">Video File</label>
                    <div
                      className="glass"
                      style={{
                        padding: '2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: '2px dashed var(--border)'
                      }}
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <FileVideo size={32} style={{ marginBottom: '0.5rem', color: 'var(--primary)' }} />
                      <p style={{ fontSize: '0.8rem' }}>{files.video ? files.video.name : 'Select Video'}</p>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        hidden
                        onChange={e => setFiles({ ...files, video: e.target.files?.[0] })}
                        required={uploadMode === 'file'}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="input-group">
                    <label className="input-label">Video URL</label>
                    <input
                      className="input-field"
                      type="url"
                      value={formData.url}
                      onChange={e => setFormData({ ...formData, url: e.target.value })}
                      required={uploadMode === 'url'}
                      placeholder="Enter external or YouTube URL"
                    />
                  </div>
                )}
              </div>
            ) : (
              !formData.isLocal && (
                <div className="input-group">
                  <label className="input-label">Video URL</label>
                  <input
                    className="input-field"
                    type="url"
                    value={formData.url}
                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                    required
                    placeholder="Enter external or YouTube URL"
                  />
                </div>
              )
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                <Check size={18} /> {editingId ? 'Save Changes' : 'Upload Video'}
              </button>
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                <X size={18} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass" style={{ overflowX: 'auto' }}>
        <table className="video-list-table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Title</th>
              <th>Source</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map(video => (
              <tr key={video.id}>
                <td>
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt="" style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : video.isLocal ? (
                    <video src={video.url} style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px', pointerEvents: 'none' }} preload="metadata" muted playsInline />
                  ) : (
                    <div style={{ width: '80px', height: '45px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileVideo size={20} color="var(--text-muted)" />
                    </div>
                  )}
                </td>
                <td style={{ fontWeight: 500 }}>{video.title}</td>
                <td>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    background: video.isLocal ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: video.isLocal ? 'var(--primary)' : 'var(--text-muted)',
                    borderRadius: '10px'
                  }}>
                    {video.isLocal ? 'LOCAL FILE' : 'IFRAME URL'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={() => startEdit(video)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.4rem', color: '#ef4444', borderColor: '#ef4444' }} onClick={() => removeVideo(video.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
