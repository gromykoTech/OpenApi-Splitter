import { memo, useMemo, useState, useCallback, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import type { FileNode } from '@api-types/splitter.types';
import { exportToZip } from '@features/splitter/services/exportToZip';

type Props = {
  files: FileNode[];
  onSelect: (file: FileNode) => void;
  isProcessing?: boolean;
};

// Рекурсивная функция для фильтрации файлового дерева по поисковому запросу
function filterFileTree(files: FileNode[], searchQuery: string): FileNode[] {
  if (!searchQuery.trim()) {
    return files;
  }

  const query = searchQuery.toLowerCase().trim();

  const filterNode = (node: FileNode): FileNode | null => {
    const matchesName = node.name.toLowerCase().includes(query);

    // Если узел имеет детей, фильтруем их рекурсивно
    if (node.children && node.children.length > 0) {
      const filteredChildren = node.children
        .map(filterNode)
        .filter((child): child is FileNode => child !== null);

      // Если название папки совпадает или есть совпадающие дети, включаем узел
      if (matchesName || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : node.children,
        };
      }
      return null;
    }

    // Для файлов проверяем только название
    return matchesName ? node : null;
  };

  return files.map(filterNode).filter((node): node is FileNode => node !== null);
}

// Рекурсивная функция для отображения файлового дерева
function FileTreeItem({
  file,
  onSelect,
  level = 0,
  expandedFolders,
  toggleFolder,
  searchQuery = '',
}: {
  file: FileNode;
  onSelect: (file: FileNode) => void;
  level?: number;
  expandedFolders: Set<string>;
  toggleFolder: (id: string) => void;
  searchQuery?: string;
}) {
  const hasChildren = file.children && file.children.length > 0;
  const isExpanded = expandedFolders.has(file.id);
  const isFolder = hasChildren && !file.content;

  const handleClick = useCallback(() => {
    if (isFolder) {
      toggleFolder(file.id);
    } else {
      onSelect(file);
    }
  }, [isFolder, file, toggleFolder, onSelect]);

  return (
    <li>
      <div
        className="cursor-pointer hover:text-gray-100 py-1 flex items-center gap-1 select-none"
        style={{ paddingLeft: `${level * 1}rem` }}
        onClick={handleClick}
      >
        {hasChildren ? (
          <span>
            {isExpanded ? '📂' : '📁'}
          </span>
        ) : (
          <span>📄</span>
        )}
        <span>{file.name}</span>
      </div>
      {hasChildren && isExpanded && (
        <ul className="ml-2">
          {file.children!.map((child) => (
            <FileTreeItem
              key={child.id}
              file={child}
              onSelect={onSelect}
              level={level + 1}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              searchQuery={searchQuery}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// Мемоизация компонента для предотвращения лишних ререндеров
// FileTree ререндерится только при изменении files или onSelect
// Важно: onSelect должен быть обернут в useCallback в родительском компоненте
export const FileTree = memo(function FileTree({
  files,
  onSelect,
  isProcessing = false,
}: Props) {
  // Состояние для отслеживания открытых/закрытых папок
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  
  // Состояние для поиска
  const [searchQuery, setSearchQuery] = useState('');

  // Функция для переключения состояния папки (открыта/закрыта)
  const toggleFolder = useCallback((id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Фильтрация файлов по поисковому запросу
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return files;
    }
    return filterFileTree(files, searchQuery);
  }, [files, searchQuery]);

  // useMemo для подготовки списка файлов
  const fileList = useMemo(() => filteredFiles, [filteredFiles]);

  // Сбрасываем состояние развернутых папок при изменении файлов
  useEffect(() => {
    setExpandedFolders(new Set());
  }, [files]);

  // При поиске автоматически раскрываем все папки для лучшей видимости результатов
  useEffect(() => {
    if (searchQuery.trim()) {
      const allFolderIds = new Set<string>();
      const collectFolderIds = (nodes: FileNode[]) => {
        nodes.forEach((node) => {
          if (node.children && node.children.length > 0) {
            allFolderIds.add(node.id);
            collectFolderIds(node.children);
          }
        });
      };
      collectFolderIds(filteredFiles);
      setExpandedFolders(allFolderIds);
    }
  }, [searchQuery, filteredFiles]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Обработчик экспорта в ZIP
  const handleExport = useCallback(async () => {
    if (files.length === 0 || isProcessing) {
      return;
    }

    try {
      await exportToZip(files);
    } catch (error) {
      // Ошибки уже обработаны в exportToZip и выведены в консоль
      console.error('Ошибка экспорта:', error);
    }
  }, [files, isProcessing]);

  // Проверка возможности экспорта
  const canExport = files.length > 0 && !isProcessing;

  return (
    <section className={`w-full lg:w-1/3 h-1/2 lg:h-full flex flex-col border-r-0 lg:border-r border-b lg:border-b-0 border-gray-700 group-hover:ring-2 group-hover:ring-gray-500/50 transition-shadow duration-300 ease-in-out ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}>
      <div className="flex flex-col gap-1.5 mb-2 py-2 px-4 shrink-0">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex gap-1 mr-2 shrink-0">
            <span className="w-3 h-3 bg-red-500/80 rounded-full"></span>
            <span className="w-3 h-3 bg-yellow-500/80 rounded-full"></span>
            <span className="w-3 h-3 bg-green-500/80 rounded-full"></span>
          </div>
          <h2 className="font-semibold shrink-0 truncate">Файловая структура</h2>
        </div>
        <div className="flex flex-wrap gap-1 items-center">
          {/* Поисковая строка */}
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Поиск по названию..."
              className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none min-w-0"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-gray-700 rounded transition-colors shrink-0"
                title="Очистить поиск"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Кнопка экспорта в ZIP */}
          <button
            onClick={handleExport}
            disabled={!canExport}
            className={`p-1 cursor-pointer bg-gray-600 hover:bg-gray-700 rounded transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Скачать ZIP-архив"
          >
            <Download className="size-5" />
          </button>
          {isProcessing && (
            <span className="ml-2 text-xs text-gray-400 shrink-0">Обработка...</span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        {fileList.length === 0 ? (
          <p className="text-gray-500 text-sm">Файлы не загружены</p>
        ) : (
          <ul className="text-gray-300">
            {fileList.map((file) => (
              <FileTreeItem
                key={file.id}
                file={file}
                onSelect={onSelect}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                searchQuery={searchQuery}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
});
