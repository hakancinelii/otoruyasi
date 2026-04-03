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
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
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
      const response = await fetch('https://cms.otoruyasi.com/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        const newUser: User = {
          token: data.token,
          user_email: data.user_email,
          user_nicename: data.user_nicename,
          user_display_name: data.user_display_name,
          isPremium: false, // İlk girişte meta'dan kontrol edilecek
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

  const register = async (username: string, email: string, password: string) => {
    try {
      // WordPress User Registration
      const response = await fetch('https://cms.otoruyasi.com/wp-json/wp/v2/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Kayıttan sonra otomatik giriş yapmayı dene
        const loginSuccess = await login(username, password);
        return { success: loginSuccess, message: loginSuccess ? '' : 'Kullanıcı oluşturuldu ancak giriş yapılamadı.' };
      } else {
        // WordPress tarafındaki hata mesajlarını kullanıcıya iletelim
        return { success: false, message: data.message || 'Kullanıcı oluşturulamadı. Lütfen bilgilerinizi kontrol edin.' };
      }
    } catch (error) {
      console.error('Register error:', error);
      // Demo ve gerçek senaryo dengesi: Hata durumunda bile login denenebilir ya da hata döndürülebilir
      return { success: false, message: 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('otoruyasi_user');
    window.location.href = '/';
  };

  const checkPremiumStatus = async (): Promise<boolean> => {
    if (!user) return false;
    return user.isPremium;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkPremiumStatus }}>
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
