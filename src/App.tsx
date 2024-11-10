import React, { useState, useEffect } from 'react';
import { Download, Upload, Plus, LogOut, Users, Building, Laptop, Cog, Globe } from 'lucide-react';
import OrganizationStructure from './components/OrganizationStructure';
import { useAuth } from './components/Auth';
import { Space as SpaceType, Community } from './types/organization';
import { FirebaseError } from 'firebase/app';
import { collection, getDocs, query, getFirestore, collectionGroup, where, FirestoreError } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';

const DEFAULT_COLORS = {
  admin: 'bg-blue-100',
  commercial: 'bg-green-100',
  technical: 'bg-yellow-100',
  operations: 'bg-purple-100',
  corporate: 'bg-red-100'
};

const App: React.FC = () => {
  const { user, signOut } = useAuth();
  const [spaces, setSpaces] = useState<SpaceType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setIsAuthenticated(!!firebaseUser);
      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      firebaseUser.getIdToken().then((token) => {
        localStorage.setItem('auth_token', token);
      });
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && isAuthenticated) {
      const fetchSpaces = async () => {
        setLoading(true);
        setError(null);
        try {
          console.log('Iniziando il recupero degli spazi per utente:', user.email);
          const spacesCollection = collection(db, 'spaces');
          console.log('Collezione spaces riferimento ottenuto');
          
          const spacesSnapshot = await getDocs(spacesCollection);
          console.log(`Snapshot ottenuto: ${spacesSnapshot.size} documenti trovati`);
          
          if (spacesSnapshot.empty) {
            console.log('Nessun documento trovato nella collezione spaces');
            setSpaces([]);
            return;
          }

          const spacesList = spacesSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            console.log(`\n=== Processando Space ID: ${doc.id} ===`);
            console.log('Dati raw dello space:', data);

            // Recupero delle communities dalla subcollection
            const communitiesRef = collection(doc.ref, 'communities');
            const communitiesSnapshot = await getDocs(communitiesRef);
            const communities = communitiesSnapshot.docs.map(communityDoc => ({
              id: communityDoc.id,
              name: communityDoc.data().name || 'Community senza nome'
            }));

            // Assicuriamoci che lo space abbia sempre un colore
            const color = data.color || DEFAULT_COLORS[doc.id as keyof typeof DEFAULT_COLORS] || 'bg-gray-100';
            
            const space = {
              id: doc.id,
              name: data.name || 'Spazio senza nome',
              color,
              communities
            };
            
            console.log('Space completamente processato:', space);
            console.log('=== Fine processamento Space ===\n');
            
            return space;
          });
          
          const resolvedSpaces = await Promise.all(spacesList);
          console.log('\nTutti gli spazi prima della processazione finale:', resolvedSpaces);
          
          const processedSpaces = resolvedSpaces.map((space: any) => ({
            ...space,
            icon: getIconById(space.id)
          }));

          console.log('Spazi elaborati con successo. Risultato finale:', processedSpaces);
          setSpaces(processedSpaces);
        } catch (error: unknown) {
          let errorMessage = 'Errore sconosciuto durante il recupero della struttura organizzativa';
          
          if (error instanceof FirebaseError || error instanceof FirestoreError) {
            errorMessage = `Errore Firebase: ${error.code} - ${error.message}`;
            console.error('Errore Firebase dettagliato:', error);
          } else if (error instanceof Error) {
            errorMessage = error.message;
            console.error('Errore generico:', error);
          }
          
          console.error('Errore durante il recupero degli spazi:', error);
          setError(errorMessage);
          setSpaces([]);
        } finally {
          setLoading(false);
        }
      };

      fetchSpaces();
    }
  }, [user, isAuthenticated]);

  const saveStructure = () => {
    // Rimuoviamo l'icona JSX prima del salvataggio
    const cleanedSpaces = spaces.map(space => ({
      id: space.id,
      name: space.name,
      color: space.color,
      communities: space.communities
    }));

    const fileContent = JSON.stringify(cleanedSpaces, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'organization-structure.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importStructure = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSpaces = JSON.parse(e.target?.result as string);
        const processedSpaces = importedSpaces.map((space: any) => ({
          ...space,
          icon: getIconById(space.id),
          color: space.color || DEFAULT_COLORS[space.id as keyof typeof DEFAULT_COLORS] || 'bg-gray-100',
          communities: Array.isArray(space.communities) ? space.communities : []
        }));
        setSpaces(processedSpaces);
      } catch (error: unknown) {
        let errorMessage = "Errore sconosciuto durante l'importazione";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        console.error("Errore durante l'importazione del file JSON:", error);
        setError(errorMessage);
      }
    };
    reader.readAsText(file);
  };

  const getIconById = (id: string) => {
    switch (id) {
      case 'admin': return <Users className="w-5 h-5" />;
      case 'commercial': return <Building className="w-5 h-5" />;
      case 'technical': return <Laptop className="w-5 h-5" />;
      case 'operations': return <Cog className="w-5 h-5" />;
      case 'corporate': return <Globe className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const addNewSpace = () => {
    const newId = `space-${Date.now()}`;
    const icons = [Users, Building, Laptop, Cog, Globe];
    const colors = ['bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100', 'bg-red-100'];
    const RandomIcon = icons[Math.floor(Math.random() * icons.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newSpace: SpaceType = {
      id: newId,
      icon: <RandomIcon className="w-5 h-5" />,
      name: 'Nuovo spazio',
      color: randomColor,
      communities: []
    };

    setSpaces([...spaces, newSpace]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="fixed top-0 w-full bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src={import.meta.env.PROD ? '/Interacta/logo_io.png' : '/logo_io.png'} 
                alt="Interacta Logo" 
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-xl font-bold text-gray-900">
                Organizzazione Interacta
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={saveStructure}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Salva struttura
              </button>
              <label className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                Importa struttura
                <input type="file" accept=".json" onChange={importStructure} className="hidden" />
              </label>
              <button
                onClick={addNewSpace}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nuovo spazio
              </button>

              {user && (
                <div className="flex items-center gap-3 ml-4 bg-gray-100 rounded-full py-2 px-4">
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{user.name}</span>
                    <span className="text-xs text-gray-600">{user.email}</span>
                  </div>
                  <button
                    onClick={signOut}
                    className="ml-2 p-2 hover:bg-gray-200 rounded-full transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="pt-20 pb-6">
        {error && (
          <div className="max-w-4xl mx-auto mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="max-w-4xl mx-auto p-4 text-center">
            Caricamento struttura organizzativa...
          </div>
        ) : (
          <OrganizationStructure spaces={spaces} setSpaces={setSpaces} />
        )}
      </main>
    </div>
  );
};

export default App;
