'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();
  const { t, language } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError(language === 'tr' ? 'Lütfen tüm alanları doldurun.' : 'Please fill in all fields.');
      setLoading(false);
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      setError(language === 'tr' ? 'E-posta/Kullanıcı adı veya şifre hatalı.' : 'Invalid email/username or password.');
    }
    setLoading(false);
  };

  return (
    <main className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '40px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', margin: '0 0 10px', background: 'linear-gradient(90deg, var(--text-color), var(--accent-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {language === 'tr' ? 'Üye Girişi' : 'Member Login'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {language === 'tr' ? 'Oto Rüyası dünyasına geri dönün.' : 'Back to the world of Oto Rüyası.'}
          </p>
        </div>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(46, 204, 113, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 style={{ fontSize: '20px', color: '#2ecc71', marginBottom: '10px' }}>{language === 'tr' ? 'Giriş Başarılı!' : 'Login Successful!'}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{language === 'tr' ? 'Ana sayfaya yönlendiriliyorsunuz...' : 'Redirecting to homepage...'}</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && <div style={{ background: 'rgba(255,87,34,0.1)', border: '1px solid #ff5722', color: '#ff5722', padding: '12px', borderRadius: '8px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                {language === 'tr' ? 'E-posta veya Kullanıcı Adı' : 'Email or Username'}
              </label>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'tr' ? 'kullanici adi veya e-posta' : 'username or email'} 
                style={{ width: '100%', padding: '14px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', outline: 'none' }} 
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                {language === 'tr' ? 'Şifre' : 'Password'}
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                style={{ width: '100%', padding: '14px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', outline: 'none' }} 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--accent-color)' }} /> {language === 'tr' ? 'Beni Hatırla' : 'Remember Me'}
              </label>
              <a href="#" style={{ color: 'var(--accent-color)' }}>{language === 'tr' ? 'Şifremi Unuttum' : 'Forgot Password?'}</a>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '10px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
              {loading ? (language === 'tr' ? 'Giriş Yapılıyor...' : 'Logging in...') : (language === 'tr' ? 'Giriş Yap' : 'Login')}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
              {language === 'tr' ? 'Hesabınız yok mu?' : "Don't have an account?"} <Link href="/abonelik" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{language === 'tr' ? "Hemen Premium'a Geçin" : 'Go Premium Now'}</Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
