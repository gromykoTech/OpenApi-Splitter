import { useEffect, useRef } from 'react';
import { useSplitterStore } from '@stores/splitterStore';
import { yamlValidator } from '@features/splitter/services/yamlValidator';

// Debounce задержка для валидации (мс)
const VALIDATION_DEBOUNCE_MS = 300;

// Хук для валидации YAML в реальном времени
// Использует debounce для оптимизации производительности
export function useYamlValidation() {
  // Используем селекторы Zustand для получения только нужных значений
  // Это предотвращает бесконечные циклы обновлений
  const inputText = useSplitterStore((state) => state.inputText);
  const setYamlValid = useSplitterStore((state) => state.setYamlValid);
  const setYamlErrors = useSplitterStore((state) => state.setYamlErrors);
  const yamlErrors = useSplitterStore((state) => state.yamlErrors);
  const isYamlValid = useSplitterStore((state) => state.isYamlValid);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Очистка timeout при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Валидация при изменении inputText в store
  useEffect(() => {
    // Очищаем предыдущий timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Если текст пустой, считаем валидным (чтобы не блокировать пустое поле)
    if (!inputText || inputText.trim().length === 0) {
      setYamlValid(true);
      setYamlErrors([]);
      return;
    }

    // Debounce валидации
    timeoutRef.current = setTimeout(() => {
      const validation = yamlValidator.validate(inputText);
      setYamlValid(validation.isValid);
      setYamlErrors(validation.errors);
    }, VALIDATION_DEBOUNCE_MS);
  }, [inputText, setYamlValid, setYamlErrors]);

  return {
    yamlErrors,
    isYamlValid,
  };
}

