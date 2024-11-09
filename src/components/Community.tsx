import React from 'react';
import { Edit2, MoveVertical, Trash2, Save, X } from 'lucide-react';
import { Community as CommunityType } from '../types/organization';

interface CommunityProps {
  community: CommunityType;
  spaceId: string;
  isEditing: boolean;
  editName: string;
  onStartEditing: (spaceId: string, communityId: string, name: string) => void;
  onSave: (spaceId: string, communityId: string) => void;
  onCancelEdit: () => void;
  onDelete: (spaceId: string, communityId: string) => void;
  onMove: (spaceId: string, communityId: string) => void;
  onEditNameChange: (value: string) => void;
  onDragStart: (e: React.DragEvent, spaceId: string, community: CommunityType) => void;
}

const Community: React.FC<CommunityProps> = ({
  community,
  spaceId,
  isEditing,
  editName,
  onStartEditing,
  onSave,
  onCancelEdit,
  onDelete,
  onMove,
  onEditNameChange,
  onDragStart,
}) => {
  return (
    <li 
      className="px-6 py-2 hover:bg-gray-50 cursor-move"
      draggable="true"
      onDragStart={(e) => onDragStart(e, spaceId, community)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-grow">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => onEditNameChange(e.target.value)}
              className="px-2 py-1 rounded border"
              autoFocus
              onBlur={() => onSave(spaceId, community.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSave(spaceId, community.id);
                if (e.key === 'Escape') onCancelEdit();
              }}
            />
          ) : (
            <span 
              className="select-none"
              onDoubleClick={(e) => {
                e.preventDefault();
                onStartEditing(spaceId, community.id, community.name);
              }}
            >
              {community.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button onClick={() => onSave(spaceId, community.id)} className="p-1">
                <Save className="w-4 h-4 text-green-600" />
              </button>
              <button onClick={onCancelEdit} className="p-1">
                <X className="w-4 h-4 text-red-600" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => onStartEditing(spaceId, community.id, community.name)} 
                className="p-1"
              >
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
              <button 
                onClick={() => onMove(spaceId, community.id)} 
                className="p-1"
              >
                <MoveVertical className="w-4 h-4 text-blue-600" />
              </button>
              <button 
                onClick={() => onDelete(spaceId, community.id)} 
                className="p-1"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
};

export default Community;
