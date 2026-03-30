'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, register } = useAuth();
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
      setTimeout(() => { router.push('/'); }, 1500);
    } else {
      setError(language === 'tr' ? 'E-posta/Kullanıcı adı veya şifre hatalı.' : 'Invalid email/username or password.');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !username || !password || !confirmPassword) {
      setError(language === 'tr' ? 'Lütfen tüm alanları doldurun.' : 'Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(language === 'tr' ? 'Şifreler eşleşmiyor.' : 'Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(language === 'tr' ? 'Şifre en az 6 karakter olmalıdır.' : 'Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const result = await register(username, email, password);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => { router.push('/abonelik'); }, 2000);
    } else {
      setError(result.message || (language === 'tr' ? 'Kayıt oluşturulamadı.' : 'Registration failed.'));
    }
    setLoading(false);
  };

  return (
    <main className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '40px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
        
        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderRadius: '12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', marginBottom: '30px', overflow: 'hidden' }}>
          <button
            onClick={() => { setIsRegister(false); setError(''); }}
            style={{
              flex: 1, padding: '14px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
              background: !isRegister ? 'var(--accent-color)' : 'transparent',
              color: !isRegister ? '#000' : 'var(--text-muted)',
              transition: 'all 0.3s ease'
            }}
          >
            {language === 'tr' ? '🔑 Giriş Yap' : '🔑 Login'}
          </button>
          <button
            onClick={() => { setIsRegister(true); setError(''); }}
            style={{
              flex: 1, padding: '14px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
              background: isRegister ? 'var(--accent-color)' : 'transparent',
              color: isRegister ? '#000' : 'var(--text-muted)',
              transition: 'all 0.3s ease'
            }}
          >
            {language === 'tr' ? '✨ Kayıt Ol' : '✨ Register'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', margin: '0 0 8px', background: 'linear-gradient(90deg, var(--text-color), var(--accent-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {isRegister
              ? (language === 'tr' ? 'Hesap Oluştur' : 'Create Account')
              : (language === 'tr' ? 'Üye Girişi' : 'Member Login')
            }
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            {isRegister
              ? (language === 'tr' ? 'Oto Rüyası Premium dünyasına katılın.' : 'Join the Oto Rüyası Premium world.')
              : (language === 'tr' ? 'Oto Rüyası dünyasına geri dönün.' : 'Back to the world of Oto Rüyası.')
            }
          </p>
        </div>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(46, 204, 113, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 style={{ fontSize: '20px', color: '#2ecc71', marginBottom: '10px' }}>
              {isRegister
                ? (language === 'tr' ? 'Kayıt Başarılı!' : 'Registration Successful!')
                : (language === 'tr' ? 'Giriş Başarılı!' : 'Login Successful!')
              }
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              {isRegister
                ? (language === 'tr' ? 'Abonelik sayfasına yönlendiriliyorsunuz...' : 'Redirecting to subscription page...')
                : (language === 'tr' ? 'Ana sayfaya yönlendiriliyorsunuz...' : 'Redirecting to homepage...')
              }
            </p>
          </div>
        ) : (
          <form onSubmit={isRegister ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && <div style={{ background: 'rgba(255,87,34,0.1)', border: '1px solid #ff5722', color: '#ff5722', padding: '12px', borderRadius: '10px', fontSize: '13px', textAlign: 'center' }}>{error}</div>}
            
            {/* Username - only for register */}
            {isRegister && (
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {language === 'tr' ? 'Kullanıcı Adı' : 'Username'}
                </label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={language === 'tr' ? 'kullaniciadiniz' : 'yourusername'} 
                  className="auth-input"
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {isRegister
                  ? (language === 'tr' ? 'E-posta Adresi' : 'Email Address')
                  : (language === 'tr' ? 'E-posta veya Kullanıcı Adı' : 'Email or Username')
                }
              </label>
              <input 
                type={isRegister ? 'email' : 'text'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isRegister ? 'ornek@email.com' : (language === 'tr' ? 'kullanici adi veya e-posta' : 'username or email')} 
                className="auth-input"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {language === 'tr' ? 'Şifre' : 'Password'}
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="auth-input"
              />
            </div>

            {/* Confirm password - only for register */}
            {isRegister && (
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {language === 'tr' ? 'Şifre Tekrar' : 'Confirm Password'}
                </label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="auth-input"
                />
              </div>
            )}

            {/* Remember Me / Forgot - only for login */}
            {!isRegister && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--accent-color)' }} /> {language === 'tr' ? 'Beni Hatırla' : 'Remember Me'}
                </label>
                <a href="#" style={{ color: 'var(--accent-color)' }}>{language === 'tr' ? 'Şifremi Unuttum' : 'Forgot Password?'}</a>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '15px', marginTop: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
              {loading
                ? (language === 'tr' ? 'İşleniyor...' : 'Processing...')
                : isRegister
                  ? (language === 'tr' ? 'Hesap Oluştur' : 'Create Account')
                  : (language === 'tr' ? 'Giriş Yap' : 'Login')
              }
            </button>

            {/* Bottom CTA */}
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              {isRegister ? (
                <>
                  {language === 'tr' ? 'Zaten hesabınız var mı?' : 'Already have an account?'}{' '}
                  <button type="button" onClick={() => { setIsRegister(false); setError(''); }} style={{ color: 'var(--accent-color)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                    {language === 'tr' ? 'Giriş Yapın' : 'Sign In'}
                  </button>
                </>
              ) : (
                <>
                  {language === 'tr' ? 'Hesabınız yok mu?' : "Don't have an account?"}{' '}
                  <button type="button" onClick={() => { setIsRegister(true); setError(''); }} style={{ color: 'var(--accent-color)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                    {language === 'tr' ? 'Hemen Kaydolun' : 'Register Now'}
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        .auth-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 10px;
          background: var(--bg-color);
          border: 1px solid var(--border-color);
          color: var(--text-color);
          outline: none;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }
        .auth-input:focus {
          border-color: var(--accent-color);
        }
        .auth-input::placeholder {
          color: var(--text-muted);
          opacity: 0.6;
        }
      `}</style>
    </main>
  );
}
