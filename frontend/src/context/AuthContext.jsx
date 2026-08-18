// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error parsing user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // ✅ Agent Register
  const agentRegister = async (userData) => {
    try {
      console.log('📝 Registering agent:', userData);
      const response = await api.post('/auth/agent-register', userData);
      console.log('✅ Registration response:', response.data);
      
      toast.success('✅ Agent registration successful! Please wait for admin verification.');
      return { success: true, user: response.data.data.user };
    } catch (error) {
      console.error('❌ Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // ✅ Login
  const login = async (email, password) => {
    try {
      console.log('🔑 Logging in:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('✅ Login response:', response.data);
      
      const { user, agent, accessToken } = response.data.data;
      
      // ✅ Check if user is admin or agent
      if (!['admin', 'super_admin', 'agent'].includes(user.role)) {
        toast.error('Access denied. Only admins and agents can access this platform.');
        return { success: false };
      }
      
      // ✅ Store user with proper data
      const userData = {
        ...user,
        is_verified: agent?.is_verified || false,
        company: agent?.company || '',
        agentProfile: agent
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      return { success: true, user: userData, agent };
    } catch (error) {
      console.error('❌ Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // ✅ Logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    toast.info('Logged out successfully');
  };

  // ✅ Check if user is admin
  const isAdmin = user && ['admin', 'super_admin'].includes(user.role);
  
  // ✅ Check if user is agent
  const isAgent = user && user.role === 'agent';
  
  // ✅ Check if user is business (admin or agent)
  const isBusiness = isAdmin || isAgent;

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      loading,
      isAuthenticated,
      agentRegister,
      login,
      logout,
      isAdmin,
      isAgent,
      isBusiness
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;