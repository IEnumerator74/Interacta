import React from 'react';
import { ChevronDown, ChevronUp, Edit2, Trash2, Save, X, Plus } from 'lucide-react';
import { Space as SpaceType, Community as CommunityType } from '../types/organization';
import Community from './Community';

interface SpaceProps {
  space: SpaceType;
  isExpanded: boolean;
  isEditing: boolean;
  editName: string;
  editingCommunity: { spaceId: string; communityId: string } | null;
  onToggle: (spaceId: string) => void;
  onStartEditing: (spaceId: string, name: string) => void;
  onSave: (spaceId: string) => void;
  onCancelEdit: () => void;
  onDelete: (spaceId: string) => void;
  onAddCommunity: (spaceId: string) => void;
  onEditNameChange: (value: string) => void;
  onCommunityStartEditing: (spaceId: string, communityId: string, name: string) => void;
  onCommunitySave: (spaceId: string, communityId: string) => void;
  onCommunityCancelEdit: () => void;
  onCommunityDelete: (spaceId: string, communityId: string) => void;
  onCommunityMove: (spaceId: string, communityId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, spaceId: string) => void;
  onDragStart: (e: React.DragEvent, spaceId: string, community: CommunityType) => void;
}

const Space: React.FC<SpaceProps> = ({
  space,
  isExpanded,
  isEditing,
  editName,
  editingCommunity,
  onToggle,
  onStartEditing,
  onSave,
  onCancelEdit,
  onDelete,
  onAddCommunity,
  onEditNameChange,
  onCommunityStartEditing,
  onCommunitySave,
  onCommunityCancelEdit,
  onCommunityDelete,
  onCommunityMove,
  onDragOver,
  onDrop,
  onDragStart,
}) => {
  return (
    <div 
      className="border rounded-lg shadow-sm overflow-hidden"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, space.id)}
    >
      <div 
        className={`flex items-center justify-between p-4 ${space.color} hover:bg-opacity-80 transition-colors duration-200`}
        onDoubleClick={(e) => {
          if (!isEditing) {
            e.preventDefault();
            onToggle(space.id);
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        <div className="flex items-center gap-3 flex-grow">
          {space.icon}
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => onEditNameChange(e.target.value)}
              className="px-2 py-1 rounded border"
              autoFocus
              onBlur={() => onSave(space.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSave(space.id);
                if (e.key === 'Escape') onCancelEdit();
              }}
            />
          ) : (
            <span 
              className="font-semibold text-gray-800 select-none"
              onDoubleClick={(e) => {
                e.stopPropagation();
                onStartEditing(space.id, space.name);
              }}
            >
              {space.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button onClick={() => onSave(space.id)} className="p-1">
                <Save className="w-4 h-4 text-green-600" />
              </button>
              <button onClick={onCancelEdit} className="p-1">
                <X className="w-4 h-4 text-red-600" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onStartEditing(space.id, space.name)} className="p-1">
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={() => onDelete(space.id)} className="p-1">
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
              <button onClick={(e) => {
                e.stopPropagation();
                onToggle(space.id);
              }} className="p-1">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="bg-white">
          <ul className="py-2">
            {space.communities.map(community => (
              <Community
                key={community.id}
                community={community}
                spaceId={space.id}
                isEditing={editingCommunity?.spaceId === space.id && 
                          editingCommunity?.communityId === community.id}
                editName={editName}
                onStartEditing={onCommunityStartEditing}
                onSave={onCommunitySave}
                onCancelEdit={onCommunityCancelEdit}
                onDelete={onCommunityDelete}
                onMove={onCommunityMove}
                onEditNameChange={onEditNameChange}
                onDragStart={onDragStart}
              />
            ))}
            <li className="px-6 py-2">
              <button
                onClick={() => onAddCommunity(space.id)}
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
  );
};

export default Space;
