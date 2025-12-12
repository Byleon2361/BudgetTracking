// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { jwtDecode } from 'jwt-decode';

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
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      console.log('Loaded user from localStorage:', parsedUser);
      return parsedUser;
    }
    return null;
  });
  
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      console.log('Loaded token from localStorage');
      return savedToken;
    }
    return null;
  });

  // Функция для извлечения имени пользователя из декодированного токена
  const extractUserInfo = (decodedToken) => {
    console.log('Decoded JWT token:', decodedToken);
    
    // Проверяем различные варианты полей, которые могут содержать имя пользователя
    if (decodedToken.sub) {
      // Стандартное поле JWT для subject (обычно username или userId)
      return {
        ...decodedToken,
        username: decodedToken.sub,
        displayName: decodedToken.sub
      };
    }
    
    if (decodedToken.username) {
      return {
        ...decodedToken,
        displayName: decodedToken.username
      };
    }
    
    if (decodedToken.name) {
      return {
        ...decodedToken,
        displayName: decodedToken.name
      };
    }
    
    // Если ничего не нашли, используем email как отображаемое имя
    if (decodedToken.email) {
      return {
        ...decodedToken,
        displayName: decodedToken.email.split('@')[0] // Берем часть до @
      };
    }
    
    return {
      ...decodedToken,
      displayName: 'Пользователь'
    };
  };

  const login = async (data) => {
    try {
      const response = await authAPI.login(data);
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      
      const decodedToken = jwtDecode(token);
      const userData = extractUserInfo(decodedToken);
      
      console.log('Extracted user data:', userData);
      
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