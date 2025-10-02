"use client";

import { useState, useEffect, useCallback } from 'react';
import { StorageService } from '@/lib/storage-service';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const loggedIn = StorageService.isLoggedIn();
      if (loggedIn) {
        setIsAuthenticated(true);
        setUsername(StorageService.getUsername());
      }
    } catch (error) {
      console.error("Failed to check auth status:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newUsername: string) => {
    try {
      StorageService.setLoggedIn(true);
      StorageService.setUsername(newUsername);
      setIsAuthenticated(true);
      setUsername(newUsername);
    } catch (error) {
      console.error("Failed to login:", error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      StorageService.clearAuth();
      setIsAuthenticated(false);
      setUsername('');
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  }, []);

  return { isAuthenticated, username, isLoading, login, logout };
}; 