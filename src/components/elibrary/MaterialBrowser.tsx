import React from 'react';
import { EmptyState } from '../ui/LoadingState';
import { ELibrary as ELibraryType, Bookmark, ReadingProgress, OCRProcessingState } from '../../types';
import MaterialCard from './MaterialCard';

interface SemanticSearchResult {
  material: ELibraryType;
  relevanceScore: number;
  relevanceReason: string;
  matchedConcepts: string[];
}

export interface MaterialBrowserProps {
  materials: ELibraryType[];
  bookmarks: Bookmark[];
  favorites: Set<string>;
  offlineDownloads: Set<string>;
  readingProgress: Map<string, ReadingProgress>;
  ocrProcessing: Map<string, OCRProcessingState>;
  ocrEnabled: boolean;
  selectedForOCR: Set<string>;
  isSemanticMode: boolean;
  semanticSearchResults: SemanticSearchResult[];
  getFileType: (fileType: string) => 'PDF' | 'DOCX' | 'PPT' | 'VIDEO';
  getSubjectName: (material: ELibraryType) => string;
  formatFileSize: (bytes: number) => string;
  onBookmark: (materialId: string) => void;
  onFavorite: (materialId: string) => void;
  onDownload: (material: ELibraryType) => Promise<void>;
  onRating: (material: ELibraryType) => void;
  onOfflineDownload: (materialId: string, fileUrl: string) => void;
  onOCRSelect: (materialId: string) => void;
  onOCRProcess: (material: ELibraryType) => void;
}

const MaterialBrowser: React.FC<MaterialBrowserProps> = ({
  materials,
  bookmarks,
  favorites,
  offlineDownloads,
  readingProgress,
  ocrProcessing,
  ocrEnabled,
  selectedForOCR,
  isSemanticMode,
  semanticSearchResults,
  getFileType,
  getSubjectName,
  formatFileSize,
  onBookmark,
  onFavorite,
  onDownload,
  onRating,
  onOfflineDownload,
  onOCRSelect,
  onOCRProcess
}) => {
  if (materials.length === 0) {
    return (
      <div className="col-span-full">
        <EmptyState 
          message="Tidak ada materi ditemukan untuk filter ini"
          icon={
            <div className="mx-auto w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400">
              <div className="text-4xl">📄</div>
            </div>
          }
          size="lg"
          ariaLabel="Tidak ada materi ditemukan"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {materials.map((item) => (
        <MaterialCard
          key={item.id}
          item={item}
          bookmarks={bookmarks}
          favorites={favorites}
          offlineDownloads={offlineDownloads}
          readingProgress={readingProgress}
          ocrProcessing={ocrProcessing}
          ocrEnabled={ocrEnabled}
          selectedForOCR={selectedForOCR}
          isSemanticMode={isSemanticMode}
          semanticSearchResults={semanticSearchResults}
          getFileType={getFileType}
          getSubjectName={getSubjectName}
          formatFileSize={formatFileSize}
          onBookmark={onBookmark}
          onFavorite={onFavorite}
          onDownload={onDownload}
          onRating={onRating}
          onOfflineDownload={onOfflineDownload}
          onOCRSelect={onOCRSelect}
          onOCRProcess={onOCRProcess}
        />
      ))}
    </div>
  );
};

export default MaterialBrowser;
