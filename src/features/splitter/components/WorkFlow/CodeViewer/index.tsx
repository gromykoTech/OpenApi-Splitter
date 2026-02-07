import { memo, useMemo } from 'react';

type Props = {
  code: string;
};

// Мемоизация компонента для предотвращения ререндеров при изменении других частей UI
// CodeViewer отображает большой текст (может быть 10-20k строк), ререндеры дорогие
// Ререндерится только при изменении пропа code
export const CodeViewer = memo(function CodeViewer({ code }: Props) {
  // useMemo для подготовки кода
  // Сейчас просто возвращаем code, но здесь можно добавить трансформацию
  // (например, форматирование, подсветка синтаксиса)
  const displayCode = useMemo(() => code || 'Выберите файл для просмотра', [code]);

  return (
    <section className="flex-1 py-2 px-4 overflow-auto">
      <div className="flex items-center mb-2">
        <div className="flex gap-1 mr-2">
          <span className="w-3 h-3 bg-red-500/80 rounded-full"></span>
          <span className="w-3 h-3 bg-yellow-500/80 rounded-full"></span>
          <span className="w-3 h-3 bg-green-500/80 rounded-full"></span>
        </div>
        <h2 className="font-semibold text-gray-200">Просмотр кода</h2>
      </div>
      <pre className="text-sm text-gray-200 whitespace-pre-wrap">{displayCode}</pre>
    </section>
  );
});
