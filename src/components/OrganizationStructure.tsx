import React, { useState, Dispatch, SetStateAction } from 'react';
import { Space as SpaceType, Community, ExpandedSpaces, EditingCommunity, MoveModal as MoveModalType } from '../types/organization';
import Space from './Space';
import MoveModal from './MoveModal';
import { collection, doc, updateDoc, deleteDoc, addDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface OrganizationStructureProps {
  spaces: SpaceType[];
  setSpaces: Dispatch<SetStateAction<SpaceType[]>>;
}

const OrganizationStructure: React.FC<OrganizationStructureProps> = ({ spaces, setSpaces }) => {
  const [expandedSpaces, setExpandedSpaces] = useState<ExpandedSpaces>({});
  const [editingSpace, setEditingSpace] = useState<string | null>(null);
  const [editingCommunity, setEditingCommunity] = useState<EditingCommunity | null>(null);
  const [editName, setEditName] = useState('');
  const [showMoveModal, setShowMoveModal] = useState<MoveModalType | null>(null);
  const [draggedCommunity, setDraggedCommunity] = useState<{spaceId: string, community: Community} | null>(null);

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

  const saveSpaceName = async (spaceId: string) => {
    if (editName.trim() !== '' && auth.currentUser) {
      try {
        const spaceRef = doc(db, 'spaces', spaceId);
        const updateData = {
          name: editName,
          lastModifiedBy: auth.currentUser.email || auth.currentUser.uid,
          lastModifiedAt: new Date()
        };
        
        await updateDoc(spaceRef, updateData);
        
        setSpaces(spaces.map(space => 
          space.id === spaceId ? { 
            ...space, 
            name: editName,
            lastModifiedBy: auth.currentUser?.email || auth.currentUser?.uid || '',
            lastModifiedAt: new Date()
          } : space
        ));
      } catch (error) {
        console.error('Errore durante il salvataggio dello spazio:', error);
      }
    }
    setEditingSpace(null);
    setEditName('');
  };

  const saveCommunityName = async (spaceId: string, communityId: string) => {
    if (editName.trim() !== '' && auth.currentUser) {
      try {
        const communityRef = doc(db, 'spaces', spaceId, 'communities', communityId);
        const updateData = {
          name: editName,
          lastModifiedBy: auth.currentUser.email || auth.currentUser.uid,
          lastModifiedAt: new Date()
        };

        await updateDoc(communityRef, updateData);

        setSpaces(spaces.map(space => 
          space.id === spaceId 
            ? {
                ...space,
                communities: space.communities.map(comm =>
                  comm.id === communityId ? { ...comm, name: editName } : comm
                ),
                lastModifiedBy: auth.currentUser?.email || auth.currentUser?.uid || '',
                lastModifiedAt: new Date()
              }
            : space
        ));
      } catch (error) {
        console.error('Errore durante il salvataggio della community:', error);
      }
    }
    setEditingCommunity(null);
    setEditName('');
  };

  const addNewCommunity = async (spaceId: string) => {
    if (auth.currentUser) {
      try {
        const communitiesRef = collection(db, 'spaces', spaceId, 'communities');
        const newCommunityData = {
          name: 'Nuova community',
          lastModifiedBy: auth.currentUser.email || auth.currentUser.uid,
          lastModifiedAt: new Date()
        };
        
        const newCommunityDoc = await addDoc(communitiesRef, newCommunityData);
        const newCommunity = { 
          id: newCommunityDoc.id, 
          name: 'Nuova community' 
        };

        setSpaces(spaces.map(space =>
          space.id === spaceId
            ? {
                ...space,
                communities: [...space.communities, newCommunity],
                lastModifiedBy: auth.currentUser?.email || auth.currentUser?.uid || '',
                lastModifiedAt: new Date()
              }
            : space
        ));
      } catch (error) {
        console.error('Errore durante l\'aggiunta della community:', error);
      }
    }
  };

  const deleteSpace = async (spaceId: string) => {
    if (auth.currentUser) {
      try {
        const spaceRef = doc(db, 'spaces', spaceId);
        await deleteDoc(spaceRef);
        setSpaces(spaces.filter(space => space.id !== spaceId));
      } catch (error) {
        console.error('Errore durante l\'eliminazione dello spazio:', error);
      }
    }
  };

  const deleteCommunity = async (spaceId: string, communityId: string) => {
    if (auth.currentUser) {
      try {
        const communityRef = doc(db, 'spaces', spaceId, 'communities', communityId);
        await deleteDoc(communityRef);

        // Aggiorna anche lo spazio con l'ultima modifica
        const spaceRef = doc(db, 'spaces', spaceId);
        await updateDoc(spaceRef, {
          lastModifiedBy: auth.currentUser.email || auth.currentUser.uid,
          lastModifiedAt: new Date()
        });

        setSpaces(spaces.map(space =>
          space.id === spaceId
            ? {
                ...space,
                communities: space.communities.filter(comm => comm.id !== communityId),
                lastModifiedBy: auth.currentUser?.email || auth.currentUser?.uid || '',
                lastModifiedAt: new Date()
              }
            : space
        ));
      } catch (error) {
        console.error('Errore durante l\'eliminazione della community:', error);
      }
    }
  };

  const moveCommunity = async (communityId: string, fromSpaceId: string, toSpaceId: string) => {
    if (auth.currentUser) {
      try {
        const fromSpace = spaces.find(s => s.id === fromSpaceId);
        const community = fromSpace?.communities.find(c => c.id === communityId);
        
        if (!community) return;

        // Ottieni i dati della community dalla subcollection di origine
        const sourceCommunityRef = doc(db, 'spaces', fromSpaceId, 'communities', communityId);
        
        // Crea un nuovo documento nella subcollection di destinazione
        const targetCommunityRef = doc(db, 'spaces', toSpaceId, 'communities', communityId);
        await setDoc(targetCommunityRef, {
          name: community.name,
          lastModifiedBy: auth.currentUser.email || auth.currentUser.uid,
          lastModifiedAt: new Date()
        });

        // Elimina il documento dalla subcollection di origine
        await deleteDoc(sourceCommunityRef);

        // Aggiorna i timestamp di modifica per entrambi gli spazi
        const fromSpaceRef = doc(db, 'spaces', fromSpaceId);
        const toSpaceRef = doc(db, 'spaces', toSpaceId);

        await updateDoc(fromSpaceRef, {
          lastModifiedBy: auth.currentUser.email || auth.currentUser.uid,
          lastModifiedAt: new Date()
        });

        await updateDoc(toSpaceRef, {
          lastModifiedBy: auth.currentUser.email || auth.currentUser.uid,
          lastModifiedAt: new Date()
        });

        setSpaces(spaces.map(space => {
          if (space.id === fromSpaceId) {
            return {
              ...space,
              communities: space.communities.filter(c => c.id !== communityId),
              lastModifiedBy: auth.currentUser?.email || auth.currentUser?.uid || '',
              lastModifiedAt: new Date()
            };
          }
          if (space.id === toSpaceId) {
            return {
              ...space,
              communities: [...space.communities, community],
              lastModifiedBy: auth.currentUser?.email || auth.currentUser?.uid || '',
              lastModifiedAt: new Date()
            };
          }
          return space;
        }));

        setShowMoveModal(null);
      } catch (error) {
        console.error('Errore durante lo spostamento della community:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-4 p-4">
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
