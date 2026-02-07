import { MainLayout } from '@layouts/MainLayout';
import { OpenApiSplitter } from '@features/splitter/components/WorkFlow';
import { useOpenApiSplitter } from '@features/splitter/hooks/useOpenApiSplitter';

// Тонкий контейнер компонент - вся логика в хуке useOpenApiSplitter
export default function App() {
  const {
    inputText,
    fileTree,
    selectedCode,
    isProcessing,
    error,
    onSelectFile,
    handleSplit,
    handleClearInput,
    handleUpload,
    setInputText,
  } = useOpenApiSplitter();

  return (
    <MainLayout>
      <OpenApiSplitter
        inputText={inputText}
        files={fileTree}
        code={selectedCode}
        isProcessing={isProcessing}
        error={error}
        onSelectFile={onSelectFile}
        handleSplit={handleSplit}
        handleClearInput={handleClearInput}
        setInputText={setInputText}
        handleUpload={handleUpload}
      />
    </MainLayout>
  );
}
