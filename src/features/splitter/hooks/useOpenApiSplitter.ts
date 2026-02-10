import { useCallback, useRef } from 'react';
import { useSplitterStore } from '@stores/splitterStore';
import { openApiParser } from '@features/splitter/services/openApiParser';
import { splitOpenApiYaml } from '@features/splitter/services/openApiSplitter';
import { useYamlValidation } from '@features/splitter/hooks/useYamlValidation';
import type { FileNode } from '@api-types/splitter.types';

// Максимальный размер файла для предупреждения (1MB)
// Для файлов больше этого размера показываем предупреждение, но не блокируем обработку
// Парсинг YAML обычно быстрый даже для 20k строк, но большие файлы могут замедлить UI
const MAX_FILE_SIZE_WARNING = 1024 * 1024;

// Простая функция хеширования для проверки изменений
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// Хук для работы с OpenAPI сплиттером
// Использует Zustand store для управления состоянием и защиту от race conditions
// Все обработчики обернуты в useCallback для передачи в memo-компоненты
export function useOpenApiSplitter() {
  const store = useSplitterStore();
  // AbortController для отмены предыдущих операций при запуске новых
  // Защита от race conditions: если пользователь быстро жмет кнопки или загружает новый файл,
  // предыдущая операция отменяется, чтобы избежать конфликтов состояний
  const abortControllerRef = useRef<AbortController | null>(null);

  // Интеграция валидации YAML в реальном времени
  useYamlValidation();

  // Валидация input перед обработкой
  const validateInput = useCallback((text: string): string | null => {
    if (!text || text.trim().length === 0) {
      return 'Поле ввода не может быть пустым';
    }

    // Проверка размера файла
    const sizeInBytes = new Blob([text]).size;
    if (sizeInBytes > MAX_FILE_SIZE_WARNING) {
      // Предупреждение, но не блокируем обработку
      console.warn(
        `Файл большой (${(sizeInBytes / 1024 / 1024).toFixed(2)}MB). Обработка может занять время.`,
      );
    }

    return null;
  }, []);

  // Обработка ошибок с понятными сообщениями для пользователя
  // Игнорируем ошибки отмены операций - это нормальное поведение при защите от race conditions
  const handleError = useCallback(
    (error: unknown, defaultMessage: string) => {
      let message = defaultMessage;
      if (error instanceof Error) {
        if (error.message === 'Операция отменена') {
          console.log('Операция отменена (нормальное поведение)');
          return; // Игнорируем ошибки отмены - это нормальное поведение
        }
        message = error.message;
        console.error('Ошибка:', error.message, error.stack);
      } else {
        console.error('Неизвестная ошибка:', error);
      }
      console.error('Устанавливаем ошибку в store:', message);
      store.setError(message);
    },
    [store],
  );

  // Отмена предыдущей операции при запуске новой
  const cancelPreviousOperation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  }, []);

  // Внутренняя функция для обработки split с явным текстом
  // Принимает текст как аргумент, чтобы избежать проблем с устаревшим состоянием
  const processSplit = useCallback(
    async (yamlText: string) => {
      // Защита от повторных операций - предотвращает множественные запросы
      if (store.isProcessing) {
        console.log('Уже обрабатывается, пропускаем');
        return;
      }

      // Валидация input перед обработкой
      const validationError = validateInput(yamlText);
      if (validationError) {
        console.log('Ошибка валидации input:', validationError);
        store.setError(validationError);
        return;
      }

      // Проверка валидности YAML из store (валидация происходит в реальном времени)
      if (!store.isYamlValid) {
        console.log('YAML невалиден');
        store.setError(
          'YAML содержит ошибки. Исправьте ошибки перед разделением файла.',
        );
        return;
      }

      // Проверка на повторный split без изменений через хеш
      // Избегаем лишней обработки, если файл не изменился
      const currentHash = hashString(yamlText);
      if (currentHash === store.lastProcessedHash) {
        console.log('Файл не изменился');
        store.setError('Файл не изменился. Нет необходимости повторно обрабатывать.');
        return;
      }

      // Отмена предыдущей операции для защиты от race conditions
      const signal = cancelPreviousOperation();

      try {
        console.log('Начинаем обработку...');
        store.setProcessing(true);
        store.setError(null);

        // Дополнительная валидация YAML через парсер (для проверки структуры OpenAPI)
        console.log('Валидация YAML...');
        const validation = await openApiParser.validate(yamlText, { signal });

        if (!validation.isValid) {
          const errorMsg = validation.errors?.join(', ') || 'YAML файл содержит ошибки';
          console.error('Ошибка валидации:', errorMsg);
          store.setError(errorMsg);
          store.setProcessing(false);
          return;
        }

        console.log('Разделение на файлы...');
        // Разделение на файлы напрямую из YAML строки
        // Используем splitOpenApiYaml() напрямую для эффективности
        const result = splitOpenApiYaml(yamlText);

        console.log('Файлы разделены, обновляем состояние...', result.files.length);
        // Обновление состояния
        store.setFileTree(result.files);
        store.setLastProcessedHash(currentHash);
        store.setSelectedCode('');

        // Установка первого файла (openapi.yaml) как выбранного по умолчанию
        if (result.files.length > 0) {
          const rootFile = result.files[0]; // openapi.yaml всегда первый
          if (rootFile.content) {
            store.setSelectedCode(rootFile.content);
            console.log('Контент установлен для', rootFile.path);
          }
        }
        console.log('Обработка завершена успешно');
      } catch (error) {
        console.error('Ошибка при обработке:', error);
        handleError(error, 'Ошибка при обработке OpenAPI файла');
      } finally {
        console.log('Сбрасываем isProcessing');
        store.setProcessing(false);
      }
    },
    [store, validateInput, cancelPreviousOperation, handleError],
  );

  // Публичный обработчик разделения OpenAPI файла
  // useCallback нужен для передачи в memo-компоненты (InputSection)
  // Использует текущее значение из store для ручного ввода
  const handleSplit = useCallback(async () => {
    console.log('handleSplit вызван, inputText длина:', store.inputText.length);
    await processSplit(store.inputText);
  }, [store, processSplit]);

  // Обработчик загрузки файла через input[type="file"]
  // useCallback нужен для передачи в memo-компоненты
  const handleUpload = useCallback(async () => {
    // Создаем input элемент программно для загрузки файла
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yaml,.yml,.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Проверка размера файла с предупреждением для больших файлов
      // Для файлов > 1MB показываем подтверждение, так как обработка может занять время
      if (file.size > MAX_FILE_SIZE_WARNING) {
        const shouldContinue = confirm(
          `Файл большой (${(file.size / 1024 / 1024).toFixed(2)}MB). Продолжить?`,
        );
        if (!shouldContinue) return;
      }

      try {
        const text = await file.text();
        // Обновляем состояние для отображения в UI
        store.setInputText(text);
        // Запускаем split с явно переданным текстом файла
        // Это гарантирует, что используется реальный текст файла, а не старое состояние
        await processSplit(text);
      } catch (error) {
        handleError(error, 'Ошибка при чтении файла');
      }
    };
    input.click();
  }, [store, processSplit, handleError]);

  const handleClearInput = useCallback(() => {
    // Отменяем текущую операцию при очистке
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    store.clearAll();
  }, [store]);

  const onSelectFile = useCallback(
    (file: FileNode) => {
      // Используем content из FileNode или генерируем заглушку
      // После реализации парсера content будет содержать реальное содержимое файла
      const content =
        file.content ||
        `# Файл: ${file.path}\n\nСодержимое будет загружено после реализации парсера.`;
      store.setSelectedCode(content);
    },
    [store],
  );

  return {
    inputText: store.inputText,
    fileTree: store.fileTree,
    selectedCode: store.selectedCode,
    isProcessing: store.isProcessing,
    error: store.error,
    setInputText: store.setInputText,
    handleClearInput,
    handleUpload,
    handleSplit,
    onSelectFile,
  };
}
