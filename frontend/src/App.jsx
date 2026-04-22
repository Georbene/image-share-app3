// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import UploadForm from './components/UploadForm';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';


function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="container" style={{ padding: '2rem 0' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
         

          {/* Protected Routes - Only logged-in users can access */}
          <Route 
            path="/feed" 
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute>
                <UploadForm />
              </ProtectedRoute>
            } 
          />
          
            <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile/>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div>404 - Page not found</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;