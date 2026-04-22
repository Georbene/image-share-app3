// src/pages/Landing.jsx
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        Welcome to Image Share
      </h1>
      <p style={{ fontSize: '1.3rem', color: '#555', maxWidth: '600px', margin: '0 auto 3rem' }}>
        Share your moments, connect with friends, and discover amazing photos.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/register">
          <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
            Get Started - Create Account
          </button>
        </Link>

        <Link to="/login">
          <button style={{ 
            padding: '14px 32px', 
            fontSize: '1.1rem',
            backgroundColor: '#6c757d',
            color: 'white'
          }}>
            Already have an account? Login
          </button>
        </Link>
      </div>

      <div style={{ marginTop: '4rem', color: '#666' }}>
        <p>Share photos • Like • Comment • Connect</p>
      </div>
    </div>
  );
}