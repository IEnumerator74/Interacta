import React, { useState } from 'react';
import { Users, Building, Laptop, Cog, Globe, Plus, Download, Upload, LogOut } from 'lucide-react';
import { useAuth } from './Auth';
import { Space as SpaceType, Community, ExpandedSpaces, EditingCommunity, MoveModal as MoveModalType } from '../types/organization';
import Space from './Space';
import MoveModal from './MoveModal';

const OrganizationStructure: React.FC = () => {
  const { user, signOut } = useAuth();
  const [expandedSpaces, setExpandedSpaces] = useState<ExpandedSpaces>({});
  const [editingSpace, setEditingSpace] = useState<string | null>(null);
  const [editingCommunity, setEditingCommunity] = useState<EditingCommunity | null>(null);
  const [editName, setEditName] = useState('');
  const [showMoveModal, setShowMoveModal] = useState<MoveModalType | null>(null);
  const [draggedCommunity, setDraggedCommunity] = useState<{spaceId: string, community: Community} | null>(null);
  
  const [spaces, setSpaces] = useState<SpaceType[]>([
    {
      id: 'admin',
      icon: <Users className="w-5 h-5" />,
      name: 'Amministrazione e HR',
      color: 'bg-blue-100',
      communities: [
        { id: '1', name: 'Comunicazioni HR' },
        { id: '2', name: 'Richieste viaggi e trasferte' },
        { id: '3', name: 'Richieste ferie/permessi' },
        { id: '4', name: 'Documentazione amministrativa' },
        { id: '5', name: 'Welfare aziendale' }
      ]
    },
    {
      id: 'commercial',
      icon: <Building className="w-5 h-5" />,
      name: 'Commerciale',
      color: 'bg-green-100',
      communities: [
        { id: '6', name: 'Comunicazioni commerciali' },
        { id: '7', name: 'Offerte progetto' },
        { id: '8', name: 'Demo e POC' },
        { id: '9', name: 'Segnalazioni clienti' },
        { id: '10', name: 'Opportunità commerciali' }
      ]
    },
    {
      id: 'technical',
      icon: <Laptop className="w-5 h-5" />,
      name: 'Tecnico',
      color: 'bg-yellow-100',
      communities: [
        { id: '11', name: 'R&D' },
        { id: '12', name: 'Delivery' },
        { id: '13', name: 'Assistenza e supporto' },
        { id: '14', name: 'Cloud & DevSecOps' },
        { id: '15', name: 'Documentazione tecnica' }
      ]
    },
    {
      id: 'operations',
      icon: <Cog className="w-5 h-5" />,
      name: 'Operations',
      color: 'bg-purple-100',
      communities: [
        { id: '16', name: 'Ticket IT interni' },
        { id: '17', name: 'Facility management' },
        { id: '18', name: 'Richieste acquisti' },
        { id: '19', name: 'Asset aziendali' }
      ]
    },
    {
      id: 'corporate',
      icon: <Globe className="w-5 h-5" />,
      name: 'Aziendale',
      color: 'bg-red-100',
      communities: [
        { id: '20', name: 'Comunicazioni corporate' },
        { id: '21', name: 'Eventi aziendali' },
        { id: '22', name: 'Mercatomania (social)' },
        { id: '23', name: 'Formazione' },
        { id: '24', name: 'Certificazioni e compliance' }
      ]
    }
  ]);

  const handleDragStart = (e: React.DragEvent, spaceId: string, community: Community) => {
    setDraggedCommunity({ spaceId, community });
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow dropping
  };

  const handleDrop = (e: React.DragEvent, targetSpaceId: string) => {
    e.preventDefault();
    if (!draggedCommunity || draggedCommunity.spaceId === targetSpaceId) return;

    const { spaceId: sourceSpaceId, community } = draggedCommunity;
    moveCommunity(community.id, sourceSpaceId, targetSpaceId);
    setDraggedCommunity(null);
  };

  const saveStructure = () => {
    const cleanedSpaces = spaces.map(space => ({
      ...space,
      icon: space.id,
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
        setSpaces(importedSpaces.map((space: SpaceType) => ({
          ...space,
          icon: getIconById(space.id)
        })));
      } catch (error) {
        console.error("Errore durante l'importazione del file JSON:", error);
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
  
  const toggleSpace = (spaceId: string) => {
    setExpandedSpaces(prev => ({
      ...prev,
      [spaceId]: !prev[spaceId]
    }));
  };

  const startEditingSpace = (spaceId: string, name: string) => {
    setEditingSpace(spaceId);
    setEditName(name);
  };

  const startEditingCommunity = (spaceId: string, communityId: string, name: string) => {
    setEditingCommunity({ spaceId, communityId });
    setEditName(name);
  };

  const saveSpaceName = (spaceId: string) => {
    if (editName.trim() !== '') {
      setSpaces(spaces.map(space => 
        space.id === spaceId ? { ...space, name: editName } : space
      ));
    }
    setEditingSpace(null);
    setEditName('');
  };

  const saveCommunityName = (spaceId: string, communityId: string) => {
    if (editName.trim() !== '') {
      setSpaces(spaces.map(space => 
        space.id === spaceId 
          ? {
              ...space,
              communities: space.communities.map(comm =>
                comm.id === communityId ? { ...comm, name: editName } : comm
              )
            }
          : space
      ));
    }
    setEditingCommunity(null);
    setEditName('');
  };

  const addNewCommunity = (spaceId: string) => {
    const newId = `new-${Date.now()}`;
    setSpaces(spaces.map(space =>
      space.id === spaceId
        ? {
            ...space,
            communities: [...space.communities, { id: newId, name: 'Nuova community' }]
          }
        : space
    ));
  };

  const addNewSpace = () => {
    const newId = `space-${Date.now()}`;
    const icons = [Users, Building, Laptop, Cog, Globe];
    const colors = ['bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100', 'bg-red-100'];
    const RandomIcon = icons[Math.floor(Math.random() * icons.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newSpace = {
      id: newId,
      icon: <RandomIcon className="w-5 h-5" />,
      name: 'Nuovo spazio',
      color: randomColor,
      communities: []
    };

    setSpaces([...spaces, newSpace]);
    setExpandedSpaces(prev => ({ ...prev, [newId]: true }));
  };

  const deleteSpace = (spaceId: string) => {
    setSpaces(spaces.filter(space => space.id !== spaceId));
  };

  const deleteCommunity = (spaceId: string, communityId: string) => {
    setSpaces(spaces.map(space =>
      space.id === spaceId
        ? {
            ...space,
            communities: space.communities.filter(comm => comm.id !== communityId)
          }
        : space
    ));
  };

  const moveCommunity = (communityId: string, fromSpaceId: string, toSpaceId: string) => {
    const fromSpace = spaces.find(s => s.id === fromSpaceId);
    const community = fromSpace?.communities.find(c => c.id === communityId);
    
    if (!community) return;

    setSpaces(spaces.map(space => {
      if (space.id === fromSpaceId) {
        return {
          ...space,
          communities: space.communities.filter(c => c.id !== communityId)
        };
      }
      if (space.id === toSpaceId) {
        return {
          ...space,
          communities: [...space.communities, community]
        };
      }
      return space;
    }));

    setShowMoveModal(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Organizzazione Interacta</h1>
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
        <div className="flex gap-3">
          <button
            onClick={saveStructure}
            className="flex items-center gap-2 px-4 h-10 border border-[#1e293b] text-[#1e293b] rounded hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Salva struttura
          </button>
          <label className="flex items-center gap-2 px-4 h-10 border border-[#1e293b] text-[#1e293b] rounded hover:bg-gray-50 cursor-pointer">
            <Upload className="w-4 h-4" />
            Importa struttura
            <input type="file" accept=".json" onChange={importStructure} className="hidden" />
          </label>
          <button
            onClick={addNewSpace}
            className="flex items-center gap-2 px-4 h-10 bg-[#1e293b] text-white rounded hover:bg-[#334155]"
          >
            <Plus className="w-4 h-4" />
            Nuovo spazio
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {spaces.map(space => (
          <Space
            key={space.id}
            space={space}
            isExpanded={!!expandedSpaces[space.id]}
            isEditing={editingSpace === space.id}
            editName={editName}
            editingCommunity={editingCommunity}
            onToggle={toggleSpace}
            onStartEditing={startEditingSpace}
            onSave={saveSpaceName}
            onCancelEdit={() => {
              setEditingSpace(null);
              setEditName('');
            }}
            onDelete={deleteSpace}
            onAddCommunity={addNewCommunity}
            onEditNameChange={setEditName}
            onCommunityStartEditing={startEditingCommunity}
            onCommunitySave={saveCommunityName}
            onCommunityCancelEdit={() => {
              setEditingCommunity(null);
              setEditName('');
            }}
            onCommunityDelete={deleteCommunity}
            onCommunityMove={(spaceId, communityId) => 
              setShowMoveModal({ spaceId, communityId })}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
          />
        ))}
      </div>

      {showMoveModal && (
        <MoveModal
          showMoveModal={showMoveModal}
          spaces={spaces}
          onMove={moveCommunity}
          onClose={() => setShowMoveModal(null)}
        />
      )}
    </div>
  );
};

export default OrganizationStructure;
