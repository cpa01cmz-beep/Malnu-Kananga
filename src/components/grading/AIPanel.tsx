
import React from 'react';
import { LightBulbIcon } from '../icons/LightBulbIcon';
import Button from '../ui/Button';
import MarkdownRenderer from '../MarkdownRenderer';

export interface AIPanelProps {
  isAnalyzing: boolean;
  analysisResult: string | null;
  setAnalysisResult: React.Dispatch<React.SetStateAction<string | null>>;
}

const AIPanel: React.FC<AIPanelProps> = ({ isAnalyzing: _isAnalyzing, analysisResult, setAnalysisResult }) => {
  if (!analysisResult) return null;

  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 mb-6 animate-scale-in">
      <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
        <LightBulbIcon className="w-5 h-5" />
        Hasil Analisis Pedagogis (Gemini 3 Pro)
      </h3>
      <div className="text-neutral-700 dark:text-neutral-300 text-sm">
        <MarkdownRenderer content={analysisResult} />
      </div>
      <div className="mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAnalysisResult(null)}
        >
          Tutup Analisis
        </Button>
      </div>
    </div>
  );
};

export default AIPanel;
