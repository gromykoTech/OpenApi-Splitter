// Опции для парсинга OpenAPI
export type ParseOptions = {
  signal?: AbortSignal;
};

// Опции для разделения OpenAPI на файлы
export type SplitOptions = {
  signal?: AbortSignal;
  outputFormat?: 'yaml' | 'json';
};

