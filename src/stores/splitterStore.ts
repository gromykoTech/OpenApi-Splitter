import { create } from 'zustand';
import type { FileNode } from '@api-types/splitter.types';

// Zustand store для управления состоянием сплиттера OpenAPI
// Выбран Zustand вместо локального состояния или Redux по причинам:
// 1. Легковесность - Zustand проще Redux для проекта без сложной логики
// 2. Защита от race conditions - единая точка состояния упрощает синхронизацию
// 3. Упрощение доступа - компоненты могут напрямую использовать store при необходимости
// 4. Производительность - Zustand эффективен для частых обновлений состояния

type SplitterState = {
  inputText: string;
  fileTree: FileNode[];
  selectedCode: string;
  isProcessing: boolean;
  error: string | null;
  lastProcessedHash?: string;
};

type SplitterActions = {
  setInputText: (text: string) => void;
  clearAll: () => void;
  setFileTree: (tree: FileNode[]) => void;
  setSelectedCode: (code: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  setLastProcessedHash: (hash: string) => void;
};

type SplitterStore = SplitterState & SplitterActions;

const initialState: SplitterState = {
  inputText: '',
  fileTree: [],
  selectedCode: '',
  isProcessing: false,
  error: null,
  lastProcessedHash: undefined,
};

export const useSplitterStore = create<SplitterStore>((set) => ({
  ...initialState,

  // Обработчик обновления состояния текста ввода
  setInputText: (text: string) => set({ inputText: text, error: null }),

  // Обработчик очистки всего состояния
  clearAll: () => set(initialState),

  // Обработчик обновления дерева файлов
  setFileTree: (tree: FileNode[]) => set({ fileTree: tree }),

  // Обработчик обновления выбранного кода
  setSelectedCode: (code: string) => set({ selectedCode: code }),

  // Обработчик обновления состояния обработки
  setProcessing: (isProcessing: boolean) =>
    set({ isProcessing, error: isProcessing ? null : undefined }),

  // Обработчик обновления состояния ошибки
  setError: (error: string | null) => set({ error, isProcessing: false }),

  // Обработчик обновления хеша последнего обработанного текста
  setLastProcessedHash: (hash: string) => set({ lastProcessedHash: hash }),
}));
