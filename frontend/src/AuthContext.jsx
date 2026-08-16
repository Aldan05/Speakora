import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('speakora_token');
      const storedUserStr = localStorage.getItem('speakora_user');

      if (token && storedUserStr) {
        try {
          setUser(JSON.parse(storedUserStr));
        } catch (e) {
          console.warn('Failed to parse stored user:', e);
        }
      }

      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('speakora_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          if (!storedUserStr) {
            const demoUser = { id: 'demo-user-1', name: 'Demo Speaker', email: 'aldan@example.com', role: 'USER' };
            setUser(demoUser);
            localStorage.setItem('speakora_user', JSON.stringify(demoUser));
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const loginUser = (token, userData) => {
    localStorage.setItem('speakora_token', token);
    localStorage.setItem('speakora_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('speakora_token');
    localStorage.removeItem('speakora_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
