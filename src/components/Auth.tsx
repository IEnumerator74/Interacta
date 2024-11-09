import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

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
    // Optional: revoke Google access - check if google is defined before accessing and use type assertion
    const google = window.google as { accounts?: { oauth2?: { revoke: (token: string) => void } } };
    if (google?.accounts?.oauth2) {
      google.accounts.oauth2.revoke(localStorage.getItem('auth_token') || '');
    }
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
    // Load the Google API Client
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      // Type assertion for google object - more specific
      const google = window.google as { accounts?: { id?: { initialize: (config: any) => void; renderButton: (element: HTMLElement | null, options: any) => void } } };
      google?.accounts?.id?.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        context: 'signin'
      });

      google?.accounts?.id?.renderButton(
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

  const handleCredentialResponse = async (response: any) => {
    try {
      // Decode the credential
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
    <div className="split-container">
      <div className="login-section">
        <div className="logo">
          <svg viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#016BF8"/>
          </svg>
          <span>Interacta Organizer</span>
        </div>
        
        <h1>Accedi al tuo account</h1>
        <p className="signup-text">Accedi con il tuo account aziendale</p>

        <div className="social-buttons">
          <div id="googleButton"></div>
        </div>
      </div>
      <div className="welcome-section text-4xl">
        BENVENUTO IN<br/>INTERACTA ORGANIZER
      </div>
    </div>
  );
};

export default Auth;
