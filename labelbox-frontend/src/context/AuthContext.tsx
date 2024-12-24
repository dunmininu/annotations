import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  authToken: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(
    sessionStorage.getItem('token')
  );

  const login = (token: string) => {
    sessionStorage.setItem('token', token);
    setAuthToken(token);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setAuthToken(null);
    setIsAuthenticated(false);

  };
    
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!sessionStorage.getItem('authToken') // Check token presence on initialization.
  );

  return (
    <AuthContext.Provider value={{ isAuthenticated, authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
