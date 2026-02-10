import { zip } from 'fflate';
import type { FileNode } from '@api-types/splitter.types';

/**
 * Рекурсивно собирает все файлы из дерева FileNode в объект для ZIP-архива.
 * 
 * @param node - Узел файлового дерева (файл или папка)
 * @param files - Объект для хранения файлов (путь -> содержимое как Uint8Array)
 */
function collectFiles(
  node: FileNode,
  files: Record<string, Uint8Array>,
): void {
  // Если у узла есть content, это файл - добавляем в ZIP
  if (node.content) {
    // Преобразуем строку в Uint8Array для fflate
    const encoder = new TextEncoder();
    files[node.path] = encoder.encode(node.content);
  }

  // Если у узла есть children, это папка - рекурсивно обходим детей
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      collectFiles(child, files);
    });
  }
}

/**
 * Экспортирует разрезанную OpenAPI-спецификацию в ZIP-архив.
 * 
 * Функция:
 * - Рекурсивно обходит дерево файлов
 * - Создает ZIP-архив с сохранением полной иерархии директорий
 * - Инициирует автоматическое скачивание файла `openapi-split.zip`
 * 
 * @param files - Массив корневых узлов файлового дерева (результат splitOpenApiYaml)
 * @throws {Error} При ошибке создания или скачивания архива (выводится в console.error)
 */
export async function exportToZip(files: FileNode[]): Promise<void> {
  try {
    // Проверка на пустой массив файлов
    if (!files || files.length === 0) {
      console.error('Нет файлов для экспорта');
      return;
    }

    // Объект для хранения файлов ZIP-архива
    // Ключ - путь файла в архиве, значение - содержимое как Uint8Array
    const zipFiles: Record<string, Uint8Array> = {};

    // Рекурсивно собираем все файлы из дерева
    files.forEach((file) => {
      collectFiles(file, zipFiles);
    });

    // Проверка, что есть хотя бы один файл для экспорта
    if (Object.keys(zipFiles).length === 0) {
      console.error('Нет файлов с содержимым для экспорта');
      return;
    }

    // Создаем ZIP-архив асинхронно
    await new Promise<void>((resolve, reject) => {
      zip(zipFiles, (err, data) => {
        if (err) {
          console.error('Ошибка при создании ZIP-архива:', err);
          reject(err);
          return;
        }

        try {
          // Создаем Blob из данных ZIP
          // data - это Uint8Array, который совместим с BlobPart
          const blob = new Blob([data as BlobPart], { type: 'application/zip' });

          // Создаем URL для скачивания
          const url = URL.createObjectURL(blob);

          // Создаем временный элемент <a> для инициации скачивания
          const link = document.createElement('a');
          link.href = url;
          link.download = 'openapi-split.zip';
          link.style.display = 'none';

          // Добавляем в DOM, кликаем и удаляем
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Освобождаем URL после скачивания
          URL.revokeObjectURL(url);

          resolve();
        } catch (downloadError) {
          console.error('Ошибка при скачивании ZIP-архива:', downloadError);
          reject(downloadError);
        }
      });
    });
  } catch (error) {
    // Все ошибки логируются в консоль, UI-уведомления не показываются
    console.error('Ошибка экспорта в ZIP:', error);
    throw error;
  }
}

