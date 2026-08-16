import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Topics from './pages/Topics';
import TopicDetails from './pages/TopicDetails';
import PracticeSession from './pages/PracticeSession';
import Results from './pages/Results';
import PracticeHistory from './pages/PracticeHistory';
import Analytics from './pages/Analytics';
import UserFeedback from './pages/UserFeedback';
import AdminTopics from './pages/AdminTopics';
import Landing from './pages/Landing';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* User Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                <UserFeedback />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topics"
            element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                <Topics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topics/:id"
            element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                <TopicDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/:topicId"
            element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                <PracticeSession />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results/:sessionId"
            element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                <Results />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                <PracticeHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/topics"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminTopics />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
