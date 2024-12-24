import React, { JSX } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = !!sessionStorage.getItem('accessToken'); 

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
