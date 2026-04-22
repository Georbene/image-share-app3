// src/pages/Feed.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Feed.css';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState({});

  const { user } = useAuth();

  const refreshFeed = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      setPosts(response.data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFeed();
  }, [refreshFeed]);

  const toggleLike = async (postId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/posts/${postId}/like`);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId 
            ? { ...post, likeCount: response.data.likeCount }
            : post
        )
      );
    } catch (err) {
      alert('Failed to like post');
    }
  };

  const addComment = async (postId) => {
    const text = commentText[postId];
    if (!text || text.trim() === '') return;

    try {
      await axios.post(`http://localhost:5000/api/posts/${postId}/comments`, { text });
      refreshFeed();
      setCommentText(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Delete this post permanently?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`);
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const deleteComment = async (postId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}/comments/${commentId}`);
      refreshFeed();
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Loading feed...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0', color: 'red' }}>
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '700' }}>Feed</h1>
        <a href="/upload" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ padding: '12px 28px', fontSize: '1.1rem' }}>
            + New Post
          </button>
        </a>
      </div>

      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#666' }}>
          <h3>No posts yet</h3>
          <p>Be the first to share something amazing!</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post._id} className="card post-card">
            {/* Header */}
            <div className="post-header">
              <div>
                <strong style={{ fontSize: '1.1rem' }}>
                  {post.user?.firstName} {post.user?.lastName}
                </strong>
                <p style={{ color: '#777', fontSize: '0.9rem', marginTop: '4px' }}>
                  {new Date(post.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Caption */}
            {post.caption && (
              <div className="post-body">
                <p style={{ fontSize: '1.05rem', lineHeight: '1.5' }}>{post.caption}</p>
              </div>
            )}

            {/* Images */}
            <div className="post-images">
              {post.images && post.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Post by ${post.user?.firstName}`}
                  className="post-image"
                  style={{ width: '100%', display: 'block' }}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="post-actions">
              <button 
                onClick={() => toggleLike(post._id)}
                style={{ fontSize: '1.6rem' }}
              >
                ❤️ <span style={{ fontSize: '1rem', marginLeft: '4px' }}>{post.likeCount || 0}</span>
              </button>

              <button style={{ fontSize: '1.4rem' }}>
                💬 <span style={{ fontSize: '1rem', marginLeft: '4px' }}>{post.comments?.length || 0}</span>
              </button>

              {post.user?._id === user?.id && (
                <button 
                  onClick={() => deletePost(post._id)}
                  style={{ 
                    marginLeft: 'auto', 
                    color: '#e74c3c', 
                    fontSize: '1.4rem' 
                  }}
                >
                  🗑️
                </button>
              )}
            </div>

            {/* Comments */}
            <div style={{ padding: '15px 20px' }}>
              {post.comments && post.comments.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  {post.comments.map((comment, index) => (
                    <div key={index} className="comment-box">
                      <strong style={{ color: '#1877f2' }}>
                        {comment.user?.firstName} {comment.user?.lastName}
                      </strong>
                      <p style={{ margin: '8px 0 6px 0' }}>{comment.text}</p>
                      <small style={{ color: '#888' }}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </small>

                      {comment.user?._id === user?.id && (
                        <button
                          onClick={() => deleteComment(post._id, comment._id)}
                          style={{
                            position: 'absolute',
                            right: '15px',
                            top: '12px',
                            background: 'none',
                            border: 'none',
                            color: '#e74c3c',
                            cursor: 'pointer',
                            fontSize: '1.1rem'
                          }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText[post._id] || ''}
                  onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                  style={{ flex: 1 }}
                />
                <button 
                  onClick={() => addComment(post._id)}
                  className="btn-primary"
                  style={{ padding: '10px 22px' }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}