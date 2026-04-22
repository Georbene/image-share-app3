// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Profile() {
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) fetchUserPosts();
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      const myPosts = response.data.posts.filter(post => 
        post.user?._id === user.id || post.user?.id === user.id
      );
      setUserPosts(myPosts);
    } catch (err) {
      setError('Failed to load your posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`);
      setUserPosts(prev => prev.filter(post => post._id !== postId));
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}><h2>Loading your profile...</h2></div>;
  }

  return (
    <div className="container">
      {/* Profile Header */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '3rem 2rem',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginBottom: '3rem'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          background: '#1877f2',
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          margin: '0 auto 1rem'
        }}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>

        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
          {user?.firstName} {user?.lastName}
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>{user?.email}</p>

        <button 
          onClick={logout}
          style={{
            marginTop: '1.5rem',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* My Posts Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>My Posts ({userPosts.length})</h2>
        <a href="/upload" style={{ textDecoration: 'none' }}>
          <button className="btn-primary">+ New Post</button>
        </a>
      </div>

      {userPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#666' }}>
          <h3>You haven't posted anything yet</h3>
          <p>Share your first photo now!</p>
        </div>
      ) : (
        userPosts.map((post) => (
          <div key={post._id} className="card post-card">
            <div className="post-header">
              <div>
                <strong>
                  {post.user?.firstName} {post.user?.lastName}
                </strong>
                <p style={{ color: '#777', fontSize: '0.95rem' }}>
                  {new Date(post.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {post.caption && (
              <div className="post-body">
                <p>{post.caption}</p>
              </div>
            )}

            <div className="post-images">
              {post.images && post.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt="Your post"
                  className="post-image"
                  style={{ width: '100%', display: 'block' }}
                />
              ))}
            </div>

            <div style={{ padding: '15px 20px', textAlign: 'right' }}>
              <button 
                onClick={() => deletePost(post._id)}
                style={{
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Delete Post
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}