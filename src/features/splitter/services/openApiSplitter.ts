import * as yaml from 'js-yaml';
import type { FileNode, OpenApiDocument, SplitResult } from '@api-types/splitter.types';

// Глубокое копирование объекта
// ВАЖНО: Сохраняет $ref как строки, не преобразует их
// $ref остаются в исходном виде (#/components/schemas/User)
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Нормализация пути: удаление ведущих/замыкающих слэшей
function normalizePath(path: string): string {
  return path.replace(/^\/+/, '').replace(/\/+$/, '');
}

// Генерация уникального ID для узла дерева
function generateId(path: string): string {
  return path || 'root';
}

// Безопасное получение значения из объекта
function safeGet<T>(obj: unknown, key: string): T | undefined {
  if (obj && typeof obj === 'object' && key in obj) {
    return (obj as Record<string, T>)[key];
  }
  return undefined;
}

// Чистая функция для разбиения OpenAPI YAML на виртуальное дерево файлов
// 
// ВАЖНО: Обработка $ref ссылок
// - Все $ref остаются абсолютными и не изменяются (#/components/schemas/User)
// - $ref не преобразуются в относительные пути (./models/User.yaml)
// - $ref не привязываются к физическим файлам (components/schemas/User.yaml)
// - Структура $ref сохраняется точно, как в исходном файле
// - Поведение идентично монолитному openapi.yaml
// 
// Гарантии:
// - До разбиения: $ref валидны
// - После разбиения: $ref остаются валидными
// - Любой OpenAPI-валидатор воспринимает спецификацию как один файл
export function splitOpenApiYaml(yamlText: string): SplitResult {
  if (!yamlText || yamlText.trim().length === 0) {
    throw new Error('YAML не может быть пустым');
  }

  // 1. Парсинг YAML в объект
  let parsed: OpenApiDocument;
  try {
    parsed = yaml.load(yamlText) as OpenApiDocument;
  } catch (error) {
    throw new Error(`Ошибка парсинга YAML: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Некорректный документ');
  }

  const originalDoc = parsed;
  const rootDoc = deepClone(originalDoc);

  // Поля, которые нужно исключить из главного файла openapi.yaml
  // Эти поля будут разбиты на отдельные файлы
  const excludedFields = ['paths', 'components'];

  // Удаляем исключенные поля из главного файла
  excludedFields.forEach((field) => {
    delete (rootDoc as Record<string, unknown>)[field];
  });

  // 2. Обработка components
  const components = safeGet<Record<string, Record<string, unknown>>>(
    originalDoc,
    'components',
  ) || {};

  const componentsRootNode: FileNode = {
    id: 'components',
    name: 'components',
    path: 'components',
    children: [],
  };

  // Обрабатываем все типы в components
  Object.entries(components).forEach(([typeKey, typeValue]) => {
    if (!typeValue || typeof typeValue !== 'object') return;

    const typeDirNode: FileNode = {
      id: `components/${typeKey}`,
      name: typeKey,
      path: `components/${typeKey}`,
      children: [],
    };

    // Обрабатываем каждую сущность данного типа
    Object.entries(typeValue as Record<string, unknown>).forEach(([name, value]) => {
      const filePath = `components/${typeKey}/${name}.yaml`;

      // Создаем YAML файл с только этой сущностью
      const fileDoc = {
        components: {
          [typeKey]: {
            [name]: value,
          },
        },
      };

      // Сериализация в YAML с сохранением $ref как абсолютных ссылок
      // noRefs: true - предотвращает разрешение ссылок, сохраняет $ref как строки
      const content = yaml.dump(fileDoc, {
        indent: 2,
        lineWidth: -1,
        noRefs: true, // ВАЖНО: сохраняет $ref как абсолютные ссылки (#/components/...)
        quotingType: '"',
        forceQuotes: false,
      });

      typeDirNode.children!.push({
        id: generateId(filePath),
        name: `${name}.yaml`,
        path: filePath,
        content,
      });
    });

    // Добавляем директорию типа, если в ней есть файлы
    if (typeDirNode.children && typeDirNode.children.length > 0) {
      componentsRootNode.children!.push(typeDirNode);
    }
  });

  // 3. Обработка paths
  const paths = safeGet<Record<string, unknown>>(originalDoc, 'paths') || {};

  const pathsRootNode: FileNode = {
    id: 'paths',
    name: 'paths',
    path: 'paths',
    children: [],
  };

  // Обрабатываем каждый path
  Object.entries(paths).forEach(([pathKey, pathItem]) => {
    if (!pathItem || typeof pathItem !== 'object') return;

    // Нормализуем путь для файловой структуры
    // Сохраняем оригинальный pathKey для содержимого файла (с параметрами и слэшами)
    const normalized = normalizePath(pathKey);
    
    // Обработка edge case: пустой путь или только "/"
    const segments = normalized.split('/').filter(Boolean);
    const fileName = segments.length > 0 
      ? segments[segments.length - 1] 
      : 'root';
    
    const filePath = `paths/${normalized || 'root'}.yaml`;

    // Создаем YAML файл с только этим path
    const fileDoc = {
      paths: {
        [pathKey]: pathItem,
      },
    };

    // Сериализация в YAML с сохранением $ref как абсолютных ссылок
    // noRefs: true - предотвращает разрешение ссылок, сохраняет $ref как строки
    const content = yaml.dump(fileDoc, {
      indent: 2,
      lineWidth: -1,
      noRefs: true, // ВАЖНО: сохраняет $ref как абсолютные ссылки (#/components/...)
      quotingType: '"',
      forceQuotes: false,
    });

    // Строим иерархию директорий по сегментам пути
    let currentDir = pathsRootNode;

    // Создаем директории для всех сегментов кроме последнего
    let currentPath = 'paths';
    segments.slice(0, -1).forEach((segment) => {
      currentPath += `/${segment}`;
      if (!currentDir.children) {
        currentDir.children = [];
      }

      // Ищем существующую директорию или создаем новую
      let childDir = currentDir.children.find(
        (c) => !c.content && c.name === segment,
      );

      if (!childDir) {
        childDir = {
          id: generateId(currentPath),
          name: segment,
          path: currentPath,
          children: [],
        };
        currentDir.children.push(childDir);
      }

      currentDir = childDir;
    });

    // Добавляем файл в последнюю директорию (или в корень paths, если сегментов нет)
    if (!currentDir.children) {
      currentDir.children = [];
    }

    currentDir.children.push({
      id: generateId(filePath),
      name: `${fileName}.yaml`,
      path: filePath,
      content,
    });
  });

  // 4. Формирование главного файла openapi.yaml
  // excludedFields уже удалены выше, в rootDoc остаются только разрешенные поля:
  // openapi, info, servers, tags и другие технические ключи
  const rootFilePath = 'openapi.yaml';
  // Сериализация главного файла с сохранением $ref как абсолютных ссылок
  // noRefs: true - предотвращает разрешение ссылок, сохраняет $ref как строки
  const rootContent = yaml.dump(rootDoc, {
    indent: 2,
    lineWidth: -1,
    noRefs: true, // ВАЖНО: сохраняет $ref как абсолютные ссылки (#/components/...)
    quotingType: '"',
    forceQuotes: false,
  });

  const rootFileNode: FileNode = {
    id: 'openapi-root',
    name: 'openapi.yaml',
    path: rootFilePath,
    content: rootContent,
  };

  // 5. Построение корневого дерева
  const tree: FileNode[] = [rootFileNode];

  // Добавляем components, если есть файлы
  if (componentsRootNode.children && componentsRootNode.children.length > 0) {
    tree.push(componentsRootNode);
  }

  // Добавляем paths, если есть файлы
  if (pathsRootNode.children && pathsRootNode.children.length > 0) {
    tree.push(pathsRootNode);
  }

  return {
    files: tree,
    rootDocument: rootDoc,
  };
}

