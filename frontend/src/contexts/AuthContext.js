// contexts/AuthContext.js
import React, { createContext, useState, useContext } from 'react';
import { authAPI } from '../services/api';
import { jwtDecode } from 'jwt-decode';  // Изменено на именованный импорт

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token');
  });

  const login = async (data) => {
    try {
      const response = await authAPI.login(data);
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      
      const userData = jwtDecode(token);  // Используем напрямую
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data) => {
    try {
      await authAPI.register(data);
      await login({ username: data.username, password: data.password });
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};