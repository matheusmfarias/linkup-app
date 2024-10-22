import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('User loaded from storage:', parsedUser); // Log para verificar o usuário carregado
        setUser(parsedUser);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { user, token } = await AuthService.login(email, password);
      const userWithToken = { ...user, token };
      setUser(userWithToken);
      console.log('User after login:', userWithToken); // Log para verificar o usuário após login
      await AsyncStorage.setItem('user', JSON.stringify(userWithToken));
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      const { user, token } = await AuthService.register(email, password, firstName, lastName);
      const userWithToken = { ...user, token };
      setUser(userWithToken);
      console.log('User after registration:', userWithToken); // Log para verificar o usuário após registro
      await AsyncStorage.setItem('user', JSON.stringify(userWithToken));
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
