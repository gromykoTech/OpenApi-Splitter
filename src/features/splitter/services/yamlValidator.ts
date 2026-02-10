import * as yaml from 'js-yaml';
import type { YamlError, YamlValidationState } from '@api-types/splitter.types';

// Сервис для валидации и форматирования YAML
// Использует js-yaml для парсинга и определения ошибок
export class YamlValidator {
  /**
   * Валидация YAML строки
   * Возвращает состояние валидации с детальными ошибками и их позициями
   */
  validate(yamlText: string): YamlValidationState {
    if (!yamlText || yamlText.trim().length === 0) {
      return {
        isValid: false,
        errors: [
          {
            line: 1,
            column: 1,
            message: 'YAML не может быть пустым',
            raw: 'Empty YAML',
          },
        ],
      };
    }

    try {
      // Попытка парсинга YAML
      yaml.load(yamlText);
      return {
        isValid: true,
        errors: [],
      };
    } catch (error) {
      // Обработка ошибок парсинга
      const errors = this.parseError(error, yamlText);
      return {
        isValid: false,
        errors,
      };
    }
  }

  /**
   * Парсинг ошибки js-yaml в структурированный формат
   */
  private parseError(error: unknown, yamlText: string): YamlError[] {
    if (!(error instanceof Error)) {
      return [
        {
          line: 1,
          column: 1,
          message: 'Неизвестная ошибка при парсинге YAML',
          raw: String(error),
        },
      ];
    }

    const errorMessage = error.message;
    const lines = yamlText.split('\n');

    // Попытка извлечь позицию из сообщения об ошибке
    // Формат ошибок js-yaml: "YAMLException: ... at line X, column Y"
    const lineMatch = errorMessage.match(/line (\d+)/i);
    const columnMatch = errorMessage.match(/column (\d+)/i);

    let line = 1;
    let column = 1;

    if (lineMatch) {
      line = parseInt(lineMatch[1], 10);
      // Ограничиваем номер строки
      if (line > lines.length) {
        line = lines.length;
      }
      if (line < 1) {
        line = 1;
      }
    }

    if (columnMatch) {
      column = parseInt(columnMatch[1], 10);
      // Ограничиваем номер колонки
      if (line <= lines.length) {
        const lineLength = lines[line - 1].length;
        if (column > lineLength) {
          column = lineLength;
        }
      }
      if (column < 1) {
        column = 1;
      }
    }

    // Извлекаем понятное сообщение об ошибке
    let message = errorMessage;
    // Убираем префикс "YAMLException: " если есть
    if (message.includes(':')) {
      const parts = message.split(':');
      if (parts.length > 1) {
        message = parts.slice(1).join(':').trim();
      }
    }

    return [
      {
        line,
        column,
        message: message || 'Ошибка синтаксиса YAML',
        raw: errorMessage,
      },
    ];
  }

  /**
   * Форматирование валидного YAML
   * Исправляет отступы и форматирование, но не исправляет синтаксические ошибки
   */
  format(yamlText: string): string {
    if (!yamlText || yamlText.trim().length === 0) {
      return yamlText;
    }

    try {
      // Парсим YAML
      const parsed = yaml.load(yamlText);
      if (!parsed) {
        return yamlText;
      }

      // Форматируем обратно в YAML с правильными отступами
      return yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1, // без ограничения длины строки
        noRefs: true, // без ссылок
        quotingType: '"',
        forceQuotes: false,
      });
    } catch (error) {
      // Если YAML невалидный, возвращаем исходный текст
      // Форматирование невалидного YAML может изменить его семантику
      return yamlText;
    }
  }

  /**
   * Проверка, является ли строка валидным YAML
   */
  isValid(yamlText: string): boolean {
    return this.validate(yamlText).isValid;
  }
}

// Экспорт singleton экземпляра
export const yamlValidator = new YamlValidator();

