"use client"
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export function useAuth() {
  const [auth, setAuth] = useState({ user: null, token: null });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setAuth({ user: decodedUser, token });
      } catch (error) {
        console.error("Invalid token:", error);
        setAuth({ user: null, token: null });
      }
    }
  }, []);

  return auth;
}