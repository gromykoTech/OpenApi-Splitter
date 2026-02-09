import { memo, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

type Props = {
  code: string;
};

// Мемоизация компонента для предотвращения ререндеров при изменении других частей UI
// CodeViewer отображает большой текст (может быть 10-20k строк), ререндеры дорогие
// Ререндерится только при изменении пропа code
export const CodeViewer = memo(function CodeViewer({ code }: Props) {
  // useMemo для подготовки кода
  const displayCode = useMemo(() => code || 'Выберите файл для просмотра', [code]);

  // Расширения CodeMirror для read-only режима
  const extensions = useMemo(
    () => [
      yaml(),
      EditorView.editable.of(false), // read-only режим
      EditorView.theme({
        '&': {
          fontSize: '14px',
        },
        '.cm-content': {
          padding: '8px',
        },
        '.cm-editor': {
          backgroundColor: 'transparent',
        },
        '.cm-scroller': {
          overflow: 'auto',
        },
      }),
    ],
    [],
  );

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
      <div className="border border-gray-700 rounded overflow-hidden">
        <CodeMirror
          value={displayCode}
          extensions={extensions}
          theme={oneDark}
          editable={false}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightSelectionMatches: false,
          }}
        />
      </div>
    </section>
  );
});
