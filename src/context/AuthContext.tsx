'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
  isPremium: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkPremiumStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('otoruyasi_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('https://otoruyasi.com/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // WordPress meta verilerinden premium kontrolü simülasyonu
        // Gerçekte wp-json/wp/v2/users/me gibi bir endpoint ile meta bakılabilir
        const newUser: User = {
          token: data.token,
          user_email: data.user_email,
          user_nicename: data.user_nicename,
          user_display_name: data.user_display_name,
          isPremium: true, // Şimdilik herkese premium veriyoruz, ilerde meta'dan bakılacak
        };

        setUser(newUser);
        localStorage.setItem('otoruyasi_user', JSON.stringify(newUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('otoruyasi_user');
    window.location.href = '/';
  };

  const checkPremiumStatus = async (): Promise<boolean> => {
    if (!user) return false;
    // Burada sunucudan güncel premium durumu kontrol edilebilir
    return user.isPremium;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkPremiumStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
