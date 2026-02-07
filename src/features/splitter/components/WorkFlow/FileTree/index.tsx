import { memo, useMemo } from 'react';
import type { FileNode } from '@api-types/splitter.types';

type Props = {
  files: FileNode[];
  onSelect: (file: FileNode) => void;
  isProcessing?: boolean;
};

// Рекурсивная функция для отображения файлового дерева
function FileTreeItem({
  file,
  onSelect,
  level = 0,
}: {
  file: FileNode;
  onSelect: (file: FileNode) => void;
  level?: number;
}) {
  const hasChildren = file.children && file.children.length > 0;

  return (
    <li>
      <div
        className="cursor-pointer hover:text-gray-100 py-1"
        style={{ paddingLeft: `${level * 1}rem` }}
        onClick={() => onSelect(file)}
      >
        {hasChildren ? '📁' : '📄'} {file.name}
      </div>
      {hasChildren && (
        <ul className="ml-2">
          {file.children!.map((child) => (
            <FileTreeItem
              key={child.id}
              file={child}
              onSelect={onSelect}
              level={level + 1}
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
  // useMemo для подготовки списка файлов
  // Сейчас просто возвращаем files, но здесь можно добавить трансформацию данных
  // если понадобится (например, сортировка, фильтрация)
  const fileList = useMemo(() => files, [files]);

  return (
    <section className="w-1/3 py-2 px-4 overflow-auto border-r border-gray-700 group-hover:ring-2 group-hover:ring-gray-500/50 transition-shadow duration-300 ease-in-out">
      <div className="flex items-center mb-2">
        <div className="flex gap-1 mr-2">
          <span className="w-3 h-3 bg-red-500/80 rounded-full"></span>
          <span className="w-3 h-3 bg-yellow-500/80 rounded-full"></span>
          <span className="w-3 h-3 bg-green-500/80 rounded-full"></span>
        </div>
        <h2 className="font-semibold">Файловая структура</h2>
        {isProcessing && (
          <span className="ml-2 text-xs text-gray-400">Обработка...</span>
        )}
      </div>
      {fileList.length === 0 ? (
        <p className="text-gray-500 text-sm">Файлы не загружены</p>
      ) : (
        <ul className="text-gray-300">
          {fileList.map((file) => (
            <FileTreeItem key={file.id} file={file} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </section>
  );
});
