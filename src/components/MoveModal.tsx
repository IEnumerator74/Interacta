import React from 'react';
import { Space, MoveModal as MoveModalType } from '../types/organization';

interface MoveModalProps {
  showMoveModal: MoveModalType;
  spaces: Space[];
  onMove: (communityId: string, fromSpaceId: string, toSpaceId: string) => void;
  onClose: () => void;
}

const MoveModal: React.FC<MoveModalProps> = ({
  showMoveModal,
  spaces,
  onMove,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Sposta community</h3>
        <div className="space-y-2">
          {spaces
            .filter(s => s.id !== showMoveModal.spaceId)
            .map(space => (
              <button
                key={space.id}
                onClick={() => onMove(showMoveModal.communityId, showMoveModal.spaceId, space.id)}
                className="w-full text-left px-4 py-2 rounded hover:bg-gray-100"
              >
                {space.name}
              </button>
            ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Annulla
        </button>
      </div>
    </div>
  );
};

export default MoveModal;
