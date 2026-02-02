import React from 'react';
import DocumentTextIcon from '../icons/DocumentTextIcon';
import { StarIcon, BookmarkIcon } from '../icons/MaterialIcons';
import { ELibrary as ELibraryType, ReadingProgress, Bookmark, OCRProcessingState } from '../../types';
import { GRADIENT_CLASSES } from '../../config/gradients';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import Button from '../ui/Button';

interface SemanticSearchResult {
  material: ELibraryType;
  relevanceScore: number;
  relevanceReason: string;
  matchedConcepts: string[];
}

export interface MaterialCardProps {
  item: ELibraryType;
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

const MaterialCard: React.FC<MaterialCardProps> = ({
  item,
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
  const semanticResult = isSemanticMode && semanticSearchResults.length > 0
    ? semanticSearchResults.find((r) => r.material.id === item.id)
    : null;

  return (
    <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-md transition-all hover:-translate-y-1 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-xl ${
            getFileType(item.fileType) === 'PDF'
              ? 'bg-red-50 text-red-600 dark:bg-red-900/20'
              : getFileType(item.fileType) === 'DOCX'
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
              : getFileType(item.fileType) === 'PPT'
              ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20'
              : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20'
          }`}
        >
          <DocumentTextIcon />
        </div>
        <div className="flex gap-1">
          <Button
            onClick={() => onBookmark(item.id)}
            variant={bookmarks.some((b) => b.materialId === item.id) ? 'info' : 'ghost'}
            size="sm"
            className="p-1.5"
            aria-label="Bookmark"
          >
            <BookmarkIcon className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={() => onFavorite(item.id)}
            variant={favorites.has(item.id) ? 'info' : 'ghost'}
            size="sm"
            className="p-1.5"
            aria-label="Favorit"
          >
            <StarIcon className="w-4 h-4" />
          </Button>
        </div>
      </div> 
  
      <h3 className="text-lg font-bold text-neutral-900 dark:text-white line-clamp-2 mb-2 flex-grow">
        {item.title}
      </h3> 
  
      {/* Semantic Search Information */}
      {semanticResult && (
        <div className={`mb-3 p-2 ${GRADIENT_CLASSES.AI_SEMANTIC} rounded-lg border border-purple-200 dark:border-purple-700`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
              🧠 Relevansi AI
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              {Math.round(semanticResult.relevanceScore * 100)}%
            </span>
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400">
            {semanticResult.relevanceReason}
          </div>
          {semanticResult.matchedConcepts.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {semanticResult.matchedConcepts.slice(0, 3).map((concept: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded text-xs">
                  {concept}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
  
      <div className="text-sm text-neutral-500 dark:text-neutral-400 space-y-2 mb-4">
        <p>
          Mapel:{' '}
          <span className="text-neutral-700 dark:text-neutral-300">
            {getSubjectName(item)}
          </span>
          {item.subjectId && (
            <Badge variant="success" size="sm">
              ✓ Valid
            </Badge>
          )}
        </p>
        <p className="text-xs">
          Diunggah: {new Date(item.uploadedAt).toLocaleDateString('id-ID')}
        </p>
        <div className="flex justify-between text-xs">
          <span>{formatFileSize(item.fileSize)}</span>
          <span>{item.downloadCount} unduhan</span>
        </div>
        
        {/* Rating Display */}
        {item.averageRating && (
          <div className="flex items-center gap-1">
            <div className="flex text-yellow-500">
              {'★'.repeat(Math.floor(item.averageRating))}{'☆'.repeat(5 - Math.floor(item.averageRating))}
            </div>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              {item.averageRating.toFixed(1)} ({item.totalReviews || 0})
            </span>
          </div>
        )}
        
        {/* Reading Progress */}
        {readingProgress.has(item.id) && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-600 dark:text-blue-400">Progress Baca</span>
              <span className="text-neutral-600 dark:text-neutral-400">
                {Math.round((readingProgress.get(item.id)?.currentPosition || 0) * 100)}%
              </span>
            </div>
            <ProgressBar
              value={(readingProgress.get(item.id)?.currentPosition || 0) * 100}
              size="sm"
              color="blue"
              aria-label={`Reading progress: ${Math.round((readingProgress.get(item.id)?.currentPosition || 0) * 100)}%`}
            />
          </div>
        )}
        
        {/* Enhanced OCR Status */}
        {ocrEnabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 dark:text-neutral-400">OCR</span>
              {item.ocrStatus === 'completed' && (
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${item.isSearchable ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                  <span className={item.isSearchable ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}>
                    {Math.round(item.ocrConfidence || 0)}%
                  </span>
                </div>
              )}
              {ocrProcessing.has(item.id) && (
                <span className="text-blue-600 dark:text-blue-400">
                  {ocrProcessing.get(item.id)?.progress || 0}%
                </span>
              )}
            </div>
            
            {/* OCR Status Display */}
            {ocrProcessing.has(item.id) ? (
              <div className="flex items-center gap-2">
                <ProgressBar
                  value={ocrProcessing.get(item.id)?.progress || 0}
                  size="sm"
                  color="blue"
                  aria-label="OCR processing progress"
                />
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  Memproses...
                </span>
              </div>
            ) : item.ocrStatus === 'completed' ? (
              <div className="space-y-1">
                <div className="flex flex-wrap gap-1">
                  <Badge variant={item.isSearchable ? 'success' : 'warning'} size="sm">
                    {item.ocrQuality?.documentType || 'Unknown'}
                  </Badge>
                  {item.aiSummary && (
                    <Badge variant="info" size="sm">
                      📝 Summary
                    </Badge>
                  )}
                </div>
                
                {/* AI Summary Display */}
                {item.aiSummary && (
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                      📝 Ringkasan AI
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 line-clamp-3">
                      {item.aiSummary}
                    </div>
                  </div>
                )}
                
                {/* Plagiarism Warning */}
                {item.plagiarismFlags && item.plagiarismFlags.length > 0 && (
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                    <div className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
                      ⚠️ Deteksi Plagiasi
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {item.plagiarismFlags.length} kemiripan terdeteksi
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                Belum diproses
              </span>
            )}
          </div>
        )}
      </div> 
  
      {ocrEnabled && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => onOCRSelect(item.id)}
            aria-label={selectedForOCR.has(item.id) ? `Hapus pemilihan OCR untuk ${item.title}` : `Pilih untuk diproses OCR: ${item.title}`}
            aria-pressed={selectedForOCR.has(item.id)}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 ${
              selectedForOCR.has(item.id)
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
            }`}
            disabled={ocrProcessing.has(item.id)}
          >
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${selectedForOCR.has(item.id) ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {selectedForOCR.has(item.id) ? 'Dipilih' : 'Pilih'}
          </button>
          
          {item.ocrStatus !== 'processing' && (
            <Button
              variant="success"
              size="sm"
              onClick={() => onOCRProcess(item)}
              disabled={ocrProcessing.has(item.id)}
            >
              Proses
            </Button>
          )}
        </div>
      )}
  
      <div className="flex gap-2">
        <Button
          onClick={() => onDownload(item)}
          variant="primary"
          size="sm"
          className="flex-1"
        >
          Download
        </Button>
        
        <Button
          onClick={() => onRating(item)}
          variant="ghost"
          size="sm"
          className="p-2"
          aria-label="Beri rating dan review"
        >
          <StarIcon className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={() => onOfflineDownload(item.id, item.fileUrl)}
          variant={offlineDownloads.has(item.id) ? 'success' : 'ghost'}
          size="sm"
          className="p-2"
          aria-label={offlineDownloads.has(item.id) ? 'Tersedia offline' : 'Unduh untuk akses offline'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default MaterialCard;
