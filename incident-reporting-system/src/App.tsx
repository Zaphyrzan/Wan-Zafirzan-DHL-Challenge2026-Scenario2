/**
 * App Component
 * Root component of the application
 * Handles routing, authentication context, and layout
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { AuthGuard } from './components/Auth/AuthGuard';
import { UploadConsole } from './components/UploadConsole/UploadConsole';
import './styles/App.css';

/**
 * Dashboard component
 * Main application view for authenticated users
 * Contains upload console and incident viewer
 */
function Dashboard() {
  // JSX render
  return (
    <div className="dashboard">
      {/* Dashboard header with DHL branding */}
      <div className="dashboard-header">
        {/* DHL Logo and branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          {/* DHL Logo */}
          <div style={{ fontSize: '2rem', fontWeight: 'bold', letterSpacing: '2px', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#FFCD00' }}>DHL</span>
          </div>
          {/* Vertical separator */}
          <div style={{ width: '2px', height: '2.5rem', backgroundColor: '#FFCD00' }}></div>
          {/* Title section */}
          <div>
            <h1 className="dashboard-title">Incident Reporting System</h1>
            <p className="dashboard-subtitle">AI-Enhanced Incident Reporting & Resolution System</p>
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="dashboard-content">
        {/* Upload console section */}
        <div className="upload-section">
          {/* Upload console component */}
          <UploadConsole />
        </div>

        {/* Incident viewer section - will be added later */}
        <div className="incidents-section">
          {/* Placeholder for incident viewer */}
          <div className="placeholder">
            <h2>Incident Viewer</h2>
            <p>Searchable and filterable incident list coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Unauthorized component
 * Shows when user tries to access a page without required role
 */
function Unauthorized() {
  // JSX render
  return (
    <div className="unauthorized-container">
      {/* Error heading */}
      <h1>403 - Unauthorized</h1>

      {/* Error message */}
      <p>You don't have permission to access this page.</p>

      {/* Back to dashboard link */}
      <a href="/dashboard" className="back-link">
        Back to Dashboard
      </a>
    </div>
  );
}

/**
 * Not Found component
 * Shows when user visits non-existent route
 */
function NotFound() {
  // JSX render
  return (
    <div className="not-found-container">
      {/* Error heading */}
      <h1>404 - Page Not Found</h1>

      {/* Error message */}
      <p>The page you're looking for doesn't exist.</p>

      {/* Back to home link */}
      <a href="/auth/login" className="back-link">
        Back to Login
      </a>
    </div>
  );
}

/**
 * App Component
 * Main application entry point with routing
 */
function App() {
  // JSX render
  return (
    // Browser router for client-side routing
    <Router>
      {/* Auth provider wrapper */}
      <AuthProvider>
        {/* Routes configuration */}
        <Routes>
          {/* Login route - public, no authentication required */}
          <Route path="/auth/login" element={<LoginForm />} />

          {/* Dashboard route - protected, requires authentication */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            }
          />

          {/* Unauthorized route - shown when user lacks required role */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Root route - redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all route - 404 page not found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Export component as default
export default App;
