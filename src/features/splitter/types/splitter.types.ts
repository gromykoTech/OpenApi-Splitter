// Структура файлового дерева для отображения результата сплита OpenAPI
export type FileNode = {
  id: string;
  name: string;
  path: string;
  content?: string; // содержимое файла
  children?: FileNode[];
};

// Типы для OpenAPI документа (упрощенная структура для заглушек)
export type OpenApiDocument = {
  openapi?: string;
  info?: Record<string, unknown>;
  paths?: Record<string, unknown>;
  components?: Record<string, unknown>;
  [key: string]: unknown;
};

// Результат разделения OpenAPI на файлы
export type SplitResult = {
  files: FileNode[];
  rootDocument?: OpenApiDocument;
};

// Результат валидации
export type ValidationResult = {
  isValid: boolean;
  errors?: string[];
};

// Состояние обработки
export type ProcessingState = {
  isProcessing: boolean;
  progress?: number; // 0-100 для индикатора прогресса
};
