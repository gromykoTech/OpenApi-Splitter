import { memo, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

type Props = {
  code: string;
  isProcessing?: boolean;
};

// Мемоизация компонента для предотвращения ререндеров при изменении других частей UI
// CodeViewer отображает большой текст (может быть 10-20k строк), ререндеры дорогие
// Ререндерится только при изменении пропа code
export const CodeViewer = memo(function CodeViewer({ code, isProcessing = false }: Props) {
  // useMemo для подготовки кода
  const displayCode = useMemo(() => code || 'Выберите файл для просмотра', [code]);

  // Расширения CodeMirror для read-only режима
  const extensions = useMemo(
    () => [
      yaml(),
      EditorView.editable.of(false), // read-only режим
      EditorView.lineWrapping, // Перенос длинных строк
      EditorView.theme({
        '&': {
          fontSize: '14px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
        '.cm-content': {
          padding: '8px',
        },
        '.cm-editor': {
          backgroundColor: 'transparent',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
        },
        '.cm-scroller': {
          overflow: 'auto',
          height: '100%',
          flex: '1 1 auto',
        },
      }),
    ],
    [],
  );

  return (
    <section className={`flex-1 w-full lg:w-auto h-1/2 lg:h-full flex flex-col py-2 px-4 ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}>
      <div className="flex items-center mb-2 shrink-0">
        <div className="flex gap-1 mr-2">
          <span className="w-3 h-3 bg-red-500/80 rounded-full"></span>
          <span className="w-3 h-3 bg-yellow-500/80 rounded-full"></span>
          <span className="w-3 h-3 bg-green-500/80 rounded-full"></span>
        </div>
        <h2 className="font-semibold text-gray-200">Просмотр кода</h2>
      </div>
      <div className="flex-1 border border-gray-700 rounded overflow-hidden min-h-0 flex flex-col">
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
          className="h-full w-full"
        />
      </div>
    </section>
  );
});
