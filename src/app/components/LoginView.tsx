// src/app/components/LoginView.tsx
import { useState, FormEvent } from 'react';

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLang, setCurrentLang] = useState<'Fr' | 'En'>('Fr');

  const translations = {
    Fr: {
      welcome: 'Bonjour!',
      subtitle: 'Pour vous connecter à votre compte, renseignez votre adresse email ainsi que votre mot de passe.',
      login: 'Se connecter',
      logging: 'Connexion en cours...',
      emailPlaceholder: 'Votre adresse email',
      passwordPlaceholder: 'Votre mot de passe',
      forgotPassword: 'Mot de passe oublié ?',
      rememberMe: 'Se souvenir de moi',
      contact: "N'hésitez pas à nous contacter",
      support: 'support@bonsante.com',
      copyright: 'All rights reserved © BonSanté Technologies 2023',
      marketingTitle: 'La gestion simplifiée pour des projets réussis.',
      marketingText: 'Le nouveau rapport interactif inclut des informations mises à jour sur les approbations ou les traitements en cours pour chaque équipe.',
      errorEmailRequired: 'Veuillez saisir votre adresse email',
      errorPasswordRequired: 'Veuillez saisir votre mot de passe',
      errorInvalidEmail: 'Veuillez saisir une adresse email valide',
      errorCredentials: 'Email ou mot de passe incorrect',
    },
    En: {
      welcome: 'Welcome!',
      subtitle: 'To connect to your account, please enter your email address and password.',
      login: 'Sign in',
      logging: 'Logging in...',
      emailPlaceholder: 'Your email address',
      passwordPlaceholder: 'Your password',
      forgotPassword: 'Forgot password?',
      rememberMe: 'Remember me',
      contact: 'Feel free to contact us',
      support: 'support@bonsante.com',
      copyright: 'All rights reserved © BonSanté Technologies 2023',
      marketingTitle: 'Simplified management for successful projects.',
      marketingText: 'The new interactive report includes updated information on approvals or ongoing treatments for each team.',
      errorEmailRequired: 'Please enter your email address',
      errorPasswordRequired: 'Please enter your password',
      errorInvalidEmail: 'Please enter a valid email address',
      errorCredentials: 'Incorrect email or password',
    },
  };

  const t = translations[currentLang];

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError(t.errorEmailRequired);
      return;
    }

    if (!validateEmail(email)) {
      setError(t.errorInvalidEmail);
      return;
    }

    if (!password) {
      setError(t.errorPasswordRequired);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (rememberMe) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('user', JSON.stringify(data.user));
        }
        onLoginSuccess(data.user);
      } else {
        setError(data.message || t.errorCredentials);
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Veuillez saisir votre email pour réinitialiser votre mot de passe');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Un email de réinitialisation a été envoyé');
      } else {
        setError(data.message || 'Erreur lors de l\'envoi');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion au serveur');
    }
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#e2f1f8' }}>
      <div className="main-card flex flex-col md:flex-row bg-white" style={{ width: '100%', maxWidth: '1100px', minHeight: '700px', borderRadius: '2.5rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)' }}>
        
        {/* Left Section - Form */}
        <section className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between relative">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8" style={{ background: '#0ea5e9', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight" style={{ color: '#1e293b' }}>BonSanté</span>
            </div>
            <button
              onClick={() => setCurrentLang(currentLang === 'Fr' ? 'En' : 'Fr')}
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: '#64748b' }}
            >
              <span className="uppercase">{currentLang}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <div className="max-w-md mx-auto w-full">
            <header className="text-center mb-10">
              <h1 className="text-4xl font-heading font-extrabold mb-4" style={{ color: '#1e293b' }}>{t.welcome}</h1>
              <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{t.subtitle}</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl transition-all"
                  style={{ background: '#f8fafc', border: 'none', color: '#0f172a' }}
                  placeholder={t.emailPlaceholder}
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl transition-all"
                  style={{ background: '#f8fafc', border: 'none', color: '#0f172a' }}
                  placeholder={t.passwordPlaceholder}
                />
                <div className="mt-3 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-semibold hover:underline"
                    style={{ color: '#0ea5e9' }}
                  >
                    {t.forgotPassword}
                  </button>
                  <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#64748b' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded"
                      style={{ accentColor: '#0ea5e9' }}
                    />
                    {t.rememberMe}
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg" style={{ background: '#fef2f2', color: '#ef4444', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 font-bold rounded-2xl shadow-lg transition-all disabled:opacity-50"
                style={{ background: '#1e293b', color: '#fff' }}
              >
                {loading ? t.logging : t.login}
              </button>
            </form>

            <footer className="mt-12 text-center text-sm">
              <p className="mb-1" style={{ color: '#94a3b8' }}>{t.contact}</p>
              <a href="mailto:support@bonsante.com" className="font-semibold hover:underline" style={{ color: '#0ea5e9' }}>
                {t.support}
              </a>
            </footer>
          </div>

          <div className="text-center text-[10px] mt-8" style={{ color: '#cbd5e1' }}>
            {t.copyright}
          </div>
        </section>

        {/* Right Section - Visual */}
        <section className="hidden md:block w-1/2 relative overflow-hidden">
          <img
            alt="Professional Office Environment"
            className="absolute inset-0 w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=1000&fit=crop"
          />
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div
              className="w-full max-w-sm p-8 rounded-3xl text-white shadow-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <div className="mb-6">
                <svg className="animate-spin h-8 w-8 text-white/80" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
                </svg>
              </div>
              <h2 className="text-2xl font-heading font-bold mb-4 leading-tight">{t.marketingTitle}</h2>
              <p className="text-white/80 text-sm leading-relaxed">{t.marketingText}</p>
              <div className="flex gap-1.5 mt-8">
                <div className="w-8 h-1 bg-white rounded-full"></div>
                <div className="w-2 h-1 bg-white/30 rounded-full"></div>
                <div className="w-2 h-1 bg-white/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .font-heading {
          font-family: 'Manrope', sans-serif;
        }
      `}</style>
    </div>
  );
}