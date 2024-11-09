import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Replace with your Google Client ID
const CLIENT_ID = '817764402920-mmufs4uu7r3s8ihsfn3qfgha5p3rcpkn.apps.googleusercontent.com';

interface User {
  email: string;
  name: string;
  picture: string;
}

// Custom hook for authentication
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    setUser(null);
    if (window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(localStorage.getItem('auth_token') || '');
    }
    navigate('/login');
  };

  return { user, loading, setUser, signOut };
};

// Protected Route Component
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : null;
};

// Auth Component
const Auth = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.google?.accounts?.id?.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        context: 'signin'
      });

      window.google?.accounts?.id?.renderButton(
        document.getElementById('googleButton'),
        { 
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: '100%',
          logo_alignment: 'center',
          text: 'continue_with'
        }
      );
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response: { credential: string }) => {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(decodeURIComponent(escape(window.atob(base64))));
      
      if (payload.email?.endsWith('@apkappa.it')) {
        const user = {
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('auth_token', response.credential);
        setUser(user);
        navigate('/');
      } else {
        alert('È necessario utilizzare un account @apkappa.it');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Errore durante il login. Assicurati di utilizzare un account @apkappa.it');
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 p-8 flex flex-col items-center justify-center bg-white">
        <div className="flex items-center gap-2 mb-8">
          <svg viewBox="0 0 24 24" className="w-8 h-8">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#016BF8"/>
          </svg>
          <span className="text-xl font-semibold text-gray-800">Interacta Organizer</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Accedi al tuo account</h1>
        <p className="text-gray-600 mb-4">Accedi con il tuo account aziendale</p> {/* Restored the text */}
        <div className="w-full max-w-sm flex justify-center">
          <div id="googleButton"></div>
        </div>
      </div>
      <div className="w-1/2 bg-[#1e293b] text-white flex flex-col items-center justify-center p-8">
        <img 
          src={import.meta.env.PROD ? '/Interacta/logo_io.png' : '/logo_io.png'} 
          alt="Interacta Organizer Logo" 
          className="w-32 h-32 mb-8"
        />
        <h2 className="text-4xl font-bold text-center">
          BENVENUTO IN<br/>INTERACTA ORGANIZER
        </h2>
      </div>
    </div>
  );
};

export default Auth;
