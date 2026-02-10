import { useState, useEffect, useRef } from 'react';
import { FileTree } from './FileTree';
import { CodeViewer } from './CodeViewer';
import { InputSection } from './InputSection';
import type { FileNode } from '@api-types/splitter.types';

type Props = {
  inputText: string;
  files: FileNode[];
  code: string;
  isProcessing: boolean;
  error: string | null;
  onSelectFile: (file: FileNode) => void;
  handleSplit: () => void;
  handleClearInput: () => void;
  setInputText: (value: string) => void;
  handleUpload: () => void;
};

export function OpenApiSplitter({
  inputText,
  files,
  code,
  isProcessing,
  error,
  onSelectFile,
  handleSplit,
  handleClearInput,
  setInputText,
  handleUpload,
}: Props) {
  const [isSticky, setIsSticky] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const stickyRef = useRef<HTMLDivElement>(null);
  const topSectionRef = useRef<HTMLDivElement>(null);
  const stickyStartScrollYRef = useRef<number | null>(null);

  useEffect(() => {
    const stickyElement = stickyRef.current;
    const topSection = topSectionRef.current;
    if (!stickyElement || !topSection) return;

    const handleScroll = () => {
      const stickyRect = stickyElement.getBoundingClientRect();
      const topSectionRect = topSection.getBoundingClientRect();
      
      const isOverlapping = stickyRect.top < topSectionRect.bottom || stickyRect.top <= 1;
      
      if (isOverlapping) {
        if (stickyStartScrollYRef.current === null) {
          stickyStartScrollYRef.current = window.scrollY;
        }
        
        const overlapDistance = Math.max(0, topSectionRect.bottom - stickyRect.top);
        const maxOverlap = topSectionRect.height; // Высота верхнего блока
        const overlapProgress = Math.min(overlapDistance / maxOverlap, 1);
        
        const currentScrollY = window.scrollY;
        const scrollDistance = Math.abs(currentScrollY - stickyStartScrollYRef.current);
        const maxDistance = 200;
        const scrollProgress = Math.min(scrollDistance / maxDistance, 1);
        
        const combinedProgress = Math.max(overlapProgress, scrollProgress);
        setOverlayOpacity(combinedProgress * 0.5);
        
        setIsSticky(true);
      } else {
        setOverlayOpacity(0);
        setIsSticky(false);
        stickyStartScrollYRef.current = null;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <div
        ref={topSectionRef}
        className={`sticky top-0 transition-all duration-500 ease-out ${
          isSticky
            ? 'scale-[0.90] opacity-90'
            : 'scale-100 opacity-100'
        }`}
      >
        
        <header className="relative z-10 text-center my-3 md:my-6 px-4">
          <h1 className="text-4xl font-bold">OpenAPI Splitter</h1>
        </header>

        <InputSection
          value={inputText}
          handleSplit={handleSplit}
          handleClearInput={handleClearInput}
          setInputText={setInputText}
          handleUpload={handleUpload}
          isProcessing={isProcessing}
          error={error}
        />
      </div>

      {/* Затемнение фона при sticky - динамическое на основе прокрутки */}
      <div
        className="fixed inset-0 bg-black pointer-events-none transition-opacity duration-500 ease-out"
        style={{
          opacity: overlayOpacity,
          zIndex: 15,
        }}
      />

      <div
        ref={stickyRef}
        className="sticky top-0 z-20 flex flex-col lg:flex-row border-t border-gray-700 bg-gray-800 shadow-2xl h-dvh max-h-dvh lg:h-screen lg:max-h-screen group hover:ring-2 hover:ring-gray-500/50 transition-shadow duration-300 ease-in-out"
      >
        {/* Overlay с индикатором загрузки */}
        {isProcessing && (
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <div className="text-white text-lg font-semibold">Обработка файла...</div>
              <div className="text-gray-400 text-sm">Пожалуйста, подождите</div>
            </div>
          </div>
        )}

        <FileTree files={files} onSelect={onSelectFile} isProcessing={isProcessing} />
        <CodeViewer code={code} isProcessing={isProcessing} />
      </div>
    </>
  );
}
