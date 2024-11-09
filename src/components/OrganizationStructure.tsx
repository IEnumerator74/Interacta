import React, { useState, Dispatch, SetStateAction } from 'react';
import { Space as SpaceType, Community, ExpandedSpaces, EditingCommunity, MoveModal as MoveModalType } from '../types/organization';
import Space from './Space';
import MoveModal from './MoveModal';

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
    <div className="max-w-4xl mx-auto">
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
