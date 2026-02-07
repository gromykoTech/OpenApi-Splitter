import type {
  OpenApiDocument,
  SplitResult,
  ValidationResult,
} from '@api-types/splitter.types';

// Типы для сервиса парсинга OpenAPI
export type { OpenApiDocument, SplitResult, ValidationResult };

// Опции для парсинга
export type ParseOptions = {
  signal?: AbortSignal;
};

// Опции для разделения
export type SplitOptions = {
  signal?: AbortSignal;
  outputFormat?: 'yaml' | 'json';
};
