// src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px'
      }}>
        <Link to="/feed" style={{ 
          color: 'white', 
          textDecoration: 'none', 
          fontSize: '1.8rem', 
          fontWeight: '700',
          letterSpacing: '-0.5px'
        }}>
          ImageShares
        </Link>

        <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
          {!user && (
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>
              Home
            </Link>
          )}

          {user && (
            <>
              <Link to="/feed" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>
                Feed
              </Link>
              <Link to="/upload" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>
                Upload
              </Link>
              <Link to="/profile" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>
                Profile
              </Link>
            </>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontWeight: '600', color: 'white' }}>
                Hi, {user.firstName}
              </span>
              <button 
                onClick={logout}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.4)',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/login">
                <button style={{
                  background: 'transparent',
                  color: 'white',
                  border: '1px solid white',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button className="btn-primary" style={{ padding: '8px 20px' }}>
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}