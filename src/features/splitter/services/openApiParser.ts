import type { ValidationResult } from '@api-types/splitter.types';
import type { ParseOptions } from '@api-types/parserOptions.types';
import { yamlValidator } from './yamlValidator';

/**
 * Валидация OpenAPI YAML спецификации.
 * 
 * @param yamlText - YAML текст для валидации
 * @param options - Опции валидации (включая AbortSignal для отмены операции)
 * @returns Результат валидации с флагом валидности и списком ошибок
 */
export async function validateOpenApi(
  yamlText: string,
  options?: ParseOptions,
): Promise<ValidationResult> {
  // Проверка на отмену операции (защита от race conditions)
  if (options?.signal?.aborted) {
    throw new Error('Операция отменена');
  }

  // Используем валидацию через yamlValidator
  const validation = yamlValidator.validate(yamlText);

  // Если YAML синтаксически невалиден, возвращаем ошибки
  if (!validation.isValid) {
    return {
      isValid: false,
      errors: validation.errors.map((err) => err.message),
    };
  }

  // Разрешаем любые спецификации (openapi, asyncapi, swagger и др.)
  return { isValid: true };
}

