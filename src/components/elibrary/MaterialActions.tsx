import React from 'react';
import Button from '../../ui/Button';
import DocumentTextIcon from '../../icons/DocumentTextIcon';
import { StarIcon, BookmarkIcon } from '../../icons/MaterialIcons';

export interface MaterialActionsProps {
  material: any;
  isBookmarked: boolean;
  isFavorite: boolean;
  isOfflineAvailable: boolean;
  onBookmark: () => void;
  onFavorite: () => void;
  onDownload: () => void;
  onRating: () => void;
  onOfflineToggle: () => void;
}

const MaterialActions: React.FC<MaterialActionsProps> = ({
  material,
  isBookmarked,
  isFavorite,
  isOfflineAvailable,
  onBookmark,
  onFavorite,
  onDownload,
  onRating,
  onOfflineToggle
}) => {
  return (
    <div className="flex gap-2">
      <Button
        onClick={onDownload}
        variant="primary"
        size="sm"
        className="flex-1"
      >
        <DocumentTextIcon className="w-4 h-4 mr-2" />
        Download
      </Button>
      
      <Button
        onClick={onRating}
        variant="ghost"
        size="sm"
        className="p-2"
        aria-label="Beri rating dan review"
      >
        <StarIcon className="w-4 h-4" />
      </Button>
      
      <Button
        onClick={onOfflineToggle}
        variant={isOfflineAvailable ? 'success' : 'ghost'}
        size="sm"
        className="p-2"
        aria-label={isOfflineAvailable ? 'Tersedia offline' : 'Unduh untuk akses offline'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
        </svg>
      </Button>
    </div>
  );
};

export default MaterialActions;
