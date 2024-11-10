import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Bubbles from './Bubbles/Bubbles';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

declare global {
  interface Window {
    google: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement | null, options: any) => void;
        };
        oauth2?: {
          revoke: (token: string) => void;
        };
      };
    };
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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

  const signOut = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Errore durante il logout:', error);
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

const Auth = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    console.log('Inizializzazione Auth component');
    console.log('CLIENT_ID:', CLIENT_ID);

    const loadGoogleScript = () => {
      console.log('Caricamento script Google');
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Script Google caricato con successo');
        initializeGoogleSignIn();
      };
      script.onerror = (error) => {
        console.error('Errore nel caricamento dello script Google:', error);
      };
      document.head.appendChild(script);

      return script;
    };

    const initializeGoogleSignIn = () => {
      console.log('Inizializzazione Google Sign-In');
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            context: 'signin',
            hosted_domain: 'apkappa.it'
          });

          console.log('Rendering del pulsante Google');
          window.google.accounts.id.renderButton(
            document.getElementById('googleButton'),
            {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              width: 200,
              text: 'continue_with'
            }
          );
          console.log('Pulsante Google renderizzato con successo');
        } catch (error) {
          console.error('Errore durante l\'inizializzazione di Google Sign-In:', error);
        }
      } else {
        console.error('Google Sign-In API non disponibile');
      }
    };

    const script = loadGoogleScript();

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handleCredentialResponse = async (response: { credential: string }) => {
    console.log('Risposta credenziali ricevuta');
    
    if (isAuthenticating) {
      console.log('Autenticazione già in corso, ignoro la richiesta');
      return;
    }
    
    try {
      setIsAuthenticating(true);
      console.log('Inizio processo di autenticazione');
      
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(decodeURIComponent(escape(window.atob(base64))));
      
      console.log('Email dell\'utente:', payload.email);

      if (!payload.email?.endsWith('@apkappa.it')) {
        throw new Error('È necessario utilizzare un account @apkappa.it');
      }

      console.log('Creazione credenziale Firebase');
      const credential = GoogleAuthProvider.credential(response.credential);
      
      console.log('Accesso a Firebase');
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      console.log('Ottenimento token Firebase');
      const firebaseToken = await firebaseUser.getIdToken();

      const user = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      };

      console.log('Salvataggio dati utente');
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('auth_token', firebaseToken);
      setUser(user);
      navigate('/');
    } catch (error) {
      console.error('Errore dettagliato durante il login:', error);
      alert('Errore durante il login. Assicurati di utilizzare un account @apkappa.it');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Login form */}
      <div className="w-1/2 p-8 flex flex-col items-center justify-center bg-white relative z-10">
        <div className="flex items-center gap-2 mb-8">
          <svg viewBox="0 0 24 24" className="w-8 h-8">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
              fill="#016BF8"
            />
          </svg>
          <span className="text-xl font-semibold text-gray-800">
            Interacta Organizer
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Accedi al tuo account
        </h1>
        <p className="text-gray-600 mb-4">
          Accedi con il tuo account aziendale
        </p>
        <div className="w-full max-w-sm flex justify-center">
          <div id="googleButton" className="flex justify-center"></div>
        </div>
      </div>

      {/* Right side - Animated background */}
      <div className="w-1/2 relative bg-[#1e293b] overflow-hidden">
        {/* Bubbles container */}
        <div className="absolute inset-0">
          <Bubbles />
        </div>
        
        {/* Content overlay */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center">
          <img
            src={import.meta.env.PROD ? '/Interacta/logo_io.png' : '/logo_io.png'}
            alt="Interacta Organizer Logo"
            className="w-32 h-32 mb-8"
          />
          <h2 className="text-4xl font-bold text-center text-white">
            BENVENUTO IN<br />INTERACTA ORGANIZER
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Auth;
