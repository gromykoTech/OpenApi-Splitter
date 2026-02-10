import * as yaml from 'js-yaml';
import type {
  OpenApiDocument,
  SplitResult,
  ValidationResult,
  ParseOptions,
  SplitOptions,
} from './types';
import { yamlValidator } from './yamlValidator';
import { splitOpenApiYaml } from './openApiSplitter';

// Интерфейс сервиса парсинга OpenAPI
// Реализация - заглушки для будущей разработки
// Архитектура позволяет легко заменить заглушки на реальный парсинг без изменения остального кода
// Все методы поддерживают AbortSignal для защиты от race conditions
export interface OpenApiParser {
  parse(yaml: string, options?: ParseOptions): Promise<OpenApiDocument>;
  split(document: OpenApiDocument, options?: SplitOptions): Promise<SplitResult>;
  validate(yaml: string, options?: ParseOptions): Promise<ValidationResult>;
}

// Заглушка реализации парсера
// TODO: Реализовать реальный парсинг YAML/JSON OpenAPI
// Рекомендуемые библиотеки:
// - js-yaml для парсинга YAML
// - swagger-parser или @apidevtools/swagger-parser для валидации и работы с OpenAPI
// Для больших файлов (20k+ строк) можно рассмотреть использование Web Worker
// для парсинга в отдельном потоке и предотвращения блокировки UI
class OpenApiParserImpl implements OpenApiParser {
  async parse(yamlText: string, options?: ParseOptions): Promise<OpenApiDocument> {
    // Проверка на отмену операции (защита от race conditions)
    if (options?.signal?.aborted) {
      throw new Error('Операция отменена');
    }

    if (!yamlText || yamlText.trim().length === 0) {
      throw new Error('YAML не может быть пустым');
    }

    try {
      // Реальный парсинг YAML через js-yaml
      const parsed = yaml.load(yamlText) as OpenApiDocument;

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Некорректный OpenAPI документ');
      }

      return parsed;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Ошибка парсинга YAML: ${error.message}`);
      }
      throw new Error('Неизвестная ошибка при парсинге YAML');
    }
  }

  async split(
    document: OpenApiDocument,
    options?: SplitOptions,
  ): Promise<SplitResult> {
    // Проверка на отмену операции
    if (options?.signal?.aborted) {
      throw new Error('Операция отменена');
    }

    // Для разбиения нужна исходная YAML строка
    // Преобразуем документ обратно в YAML
    const yamlText = yaml.dump(document, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
      forceQuotes: false,
    });

    // Используем функцию разбиения
    const result = splitOpenApiYaml(yamlText);

    return {
      files: result.files,
      rootDocument: result.rootDocument,
    };
  }

  async validate(
    yamlText: string,
    options?: ParseOptions,
  ): Promise<ValidationResult> {
    // Проверка на отмену операции
    if (options?.signal?.aborted) {
      throw new Error('Операция отменена');
    }

    // Используем реальную валидацию через yamlValidator
    const validation = yamlValidator.validate(yamlText);

    // Если YAML синтаксически невалиден, возвращаем ошибки
    if (!validation.isValid) {
      return {
        isValid: false,
        errors: validation.errors.map((err) => err.message),
      };
    }

    // Дополнительная проверка на структуру документа
    // Парсинг уже выполнен в yamlValidator.validate, поэтому просто возвращаем успех
    // Разрешаем любые спецификации (openapi, asyncapi, swagger и др.)
    return { isValid: true };
  }

}

// Экспорт singleton экземпляра
export const openApiParser: OpenApiParser = new OpenApiParserImpl();

