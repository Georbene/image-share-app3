// src/components/UploadForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function UploadForm() {
  const [images, setImages] = useState([]);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [previewUrls, setPreviewUrls] = useState([]);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    images.forEach((image) => formData.append('images', image));
    if (caption.trim()) formData.append('caption', caption.trim());

    try {
      await axios.post('http://localhost:5000/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Post uploaded successfully! 🎉');
      setImages([]);
      setPreviewUrls([]);
      setCaption('');

      // Auto redirect to feed
      setTimeout(() => {
        navigate('/feed');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload post. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Clean up preview URLs when component unmounts
  const cleanupPreviews = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
  };

  return (
    <div className="container" style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Create New Post</h1>
        <p style={{ color: '#666' }}>Share your moments with the world</p>
      </div>

      {message && (
        <div style={{ 
          background: '#d4edda', 
          color: '#155724', 
          padding: '15px', 
          borderRadius: '8px', 
          textAlign: 'center',
          marginBottom: '20px',
          fontWeight: '500'
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '15px', 
          borderRadius: '8px', 
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Image Upload Area */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px', 
            fontWeight: '600',
            color: '#333'
          }}>
            Choose Photos
          </label>
          
          <label style={{
            border: '2px dashed #ccc',
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            display: 'block',
            background: '#fafafa',
            transition: 'all 0.3s'
          }}>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📸</div>
            <p style={{ fontSize: '1.1rem', color: '#555' }}>
              Click to select images or drag & drop
            </p>
            <small style={{ color: '#888' }}>Maximum 5 images • JPG, PNG, WebP</small>
          </label>

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
              gap: '12px',
              marginTop: '15px'
            }}>
              {previewUrls.map((url, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img 
                    src={url} 
                    alt={`preview ${index}`} 
                    style={{ 
                      width: '100%', 
                      height: '120px', 
                      objectFit: 'cover', 
                      borderRadius: '8px' 
                    }} 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = images.filter((_, i) => i !== index);
                      const newPreviews = previewUrls.filter((_, i) => i !== index);
                      setImages(newImages);
                      setPreviewUrls(newPreviews);
                    }}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      border: 'none',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Caption */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Caption (optional)
          </label>
          <textarea
            placeholder="What's happening? Write something nice..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows="5"
            style={{ 
              resize: 'vertical',
              fontSize: '1.05rem'
            }}
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="btn-primary"
          disabled={loading || images.length === 0}
          style={{ 
            width: '100%', 
            padding: '16px', 
            fontSize: '1.2rem',
            fontWeight: '600'
          }}
        >
          {loading ? 'Uploading your post...' : `Upload ${images.length} Photo${images.length > 1 ? 's' : ''}`}
        </button>
      </form>
    </div>
  );
}