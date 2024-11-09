import React, { useState } from 'react';
    import { ChevronDown, ChevronUp, Users, Building, Laptop, Cog, Globe, Plus, Trash2, Edit2, Save, X, MoveVertical, Download, Upload } from 'lucide-react';

    interface ExpandedSpaces {
      [key: string]: boolean;
    }

    interface EditingCommunity {
      spaceId: string;
      communityId: string;
    }

    interface MoveModal {
      spaceId: string;
      communityId: string;
    }

    interface Community {
      id: string;
      name: string;
    }

    interface Space {
      id: string;
      icon: JSX.Element;
      name: string;
      color: string;
      communities: Community[];
    }

    const OrganizationStructure = () => {
      const [expandedSpaces, setExpandedSpaces] = useState<ExpandedSpaces>({});
      const [editingSpace, setEditingSpace] = useState<string | null>(null);
      const [editingCommunity, setEditingCommunity] = useState<EditingCommunity | null>(null);
      const [editName, setEditName] = useState('');
      const [showMoveModal, setShowMoveModal] = useState<MoveModal | null>(null);
      const [draggedCommunity, setDraggedCommunity] = useState<{spaceId: string, community: Community} | null>(null);
      
      const [spaces, setSpaces] = useState<Space[]>([
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
            setSpaces(importedSpaces.map((space: Space) => ({
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
            <h1 className="text-2xl font-bold text-gray-800">Organizzazione Interacta</h1>
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
              <div 
                key={space.id} 
                className="border rounded-lg shadow-sm overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, space.id)}
              >
                <div 
                  className={`flex items-center justify-between p-4 ${space.color} hover:bg-opacity-80 transition-colors duration-200`}
                  onDoubleClick={(e) => {
                    if (!editingSpace) {
                      e.preventDefault();
                      toggleSpace(space.id);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="flex items-center gap-3 flex-grow">
                    {space.icon}
                    {editingSpace === space.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-2 py-1 rounded border"
                        autoFocus
                        onBlur={() => saveSpaceName(space.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveSpaceName(space.id);
                          if (e.key === 'Escape') {
                            setEditingSpace(null);
                            setEditName('');
                          }
                        }}
                      />
                    ) : (
                      <span 
                        className="font-semibold text-gray-800 select-none"
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          startEditingSpace(space.id, space.name);
                        }}
                      >
                        {space.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editingSpace === space.id ? (
                      <>
                        <button onClick={() => saveSpaceName(space.id)} className="p-1">
                          <Save className="w-4 h-4 text-green-600" />
                        </button>
                        <button onClick={() => {
                          setEditingSpace(null);
                          setEditName('');
                        }} className="p-1">
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditingSpace(space.id, space.name)} className="p-1">
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button onClick={() => deleteSpace(space.id)} className="p-1">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          toggleSpace(space.id);
                        }} className="p-1">
                          {expandedSpaces[space.id] ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {expandedSpaces[space.id] && (
                  <div className="bg-white">
                    <ul className="py-2">
                      {space.communities.map(community => (
                        <li 
                          key={community.id} 
                          className="px-6 py-2 hover:bg-gray-50 cursor-move"
                          draggable="true"
                          onDragStart={(e) => handleDragStart(e, space.id, community)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-grow">
                              <div className="w-2 h-2 rounded-full bg-gray-400" />
                              {editingCommunity?.spaceId === space.id && 
                               editingCommunity?.communityId === community.id ? (
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="px-2 py-1 rounded border"
                                  autoFocus
                                  onBlur={() => saveCommunityName(space.id, community.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveCommunityName(space.id, community.id);
                                    if (e.key === 'Escape') {
                                      setEditingCommunity(null);
                                      setEditName('');
                                    }
                                  }}
                                />
                              ) : (
                                <span 
                                  className="select-none"
                                  onDoubleClick={(e) => {
                                    e.preventDefault();
                                    startEditingCommunity(space.id, community.id, community.name);
                                  }}
                                >
                                  {community.name}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {editingCommunity?.spaceId === space.id && 
                               editingCommunity?.communityId === community.id ? (
                                <>
                                  <button onClick={() => saveCommunityName(space.id, community.id)} className="p-1">
                                    <Save className="w-4 h-4 text-green-600" />
                                  </button>
                                  <button onClick={() => {
                                    setEditingCommunity(null);
                                    setEditName('');
                                  }} className="p-1">
                                    <X className="w-4 h-4 text-red-600" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => startEditingCommunity(space.id, community.id, community.name)} 
                                    className="p-1"
                                  >
                                    <Edit2 className="w-4 h-4 text-gray-600" />
                                  </button>
                                  <button 
                                    onClick={() => setShowMoveModal({ spaceId: space.id, communityId: community.id })} 
                                    className="p-1"
                                  >
                                    <MoveVertical className="w-4 h-4 text-blue-600" />
                                  </button>
                                  <button 
                                    onClick={() => deleteCommunity(space.id, community.id)} 
                                    className="p-1"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                      <li className="px-6 py-2">
                        <button
                          onClick={() => addNewCommunity(space.id)}
                          className="flex items-center gap-2 text-green-600 hover:text-green-700"
                        >
                          <Plus className="w-4 h-4" />
                          Aggiungi community
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {showMoveModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Sposta community</h3>
                <div className="space-y-2">
                  {spaces
                    .filter(s => s.id !== showMoveModal.spaceId)
                    .map(space => (
                      <button
                        key={space.id}
                        onClick={() => moveCommunity(showMoveModal.communityId, showMoveModal.spaceId, space.id)}
                        className="w-full text-left px-4 py-2 rounded hover:bg-gray-100"
                      >
                        {space.name}
                      </button>
                    ))}
                </div>
                <button
                  onClick={() => setShowMoveModal(null)}
                  className="mt-4 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annulla
                </button>
              </div>
            </div>
          )}
        </div>
      );
    };

    export default OrganizationStructure;
