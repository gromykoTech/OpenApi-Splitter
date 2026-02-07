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
  return (
    <>
      <InputSection
        value={inputText}
        handleSplit={handleSplit}
        handleClearInput={handleClearInput}
        setInputText={setInputText}
        handleUpload={handleUpload}
        isProcessing={isProcessing}
        error={error}
      />

      <div className="flex flex-1 border-t border-gray-700 overflow-hidden bg-gray-800 group hover:ring-2 hover:ring-gray-500/50 transition-shadow duration-300 ease-in-out">
        <FileTree files={files} onSelect={onSelectFile} isProcessing={isProcessing} />
        <CodeViewer code={code} />
      </div>
    </>
  );
}
