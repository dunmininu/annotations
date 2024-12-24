import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './pages/ProtectedRoute';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Annotations from './pages/Annotations';
import FetchProjects from './pages/FetchProjects';
import MainLayout from './layouts/MainLayout';
import ProjectDetails from './pages/ProjectDetails';

// Main app component
const App: React.FC = () => {
  const isAuthenticated = !!sessionStorage.getItem('accessToken');

  return (
    <BrowserRouter>
      <Routes>
        {/* Routes without Sidebar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Routes with Sidebar */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/annotations/:taskId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Annotations />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/fetch-projects"
          element={
            <ProtectedRoute>
              <MainLayout>
                <FetchProjects />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/project-detail/:projectId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProjectDetails />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Catch-all for undefined routes */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
