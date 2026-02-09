import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

type Props = {
  value: string;
  onChange: (value: string) => void;
  errors?: Array<{ line: number; column: number; message: string }>;
  disabled?: boolean;
  placeholder?: string;
};

// Компонент редактора YAML на основе CodeMirror
// Поддерживает подсветку синтаксиса
// Ошибки валидации отображаются под редактором в InputSection
export function YamlEditor({
  value,
  onChange,
  disabled = false,
  placeholder = 'Вставьте сюда openapi.yaml или yml...',
}: Props) {
  // Расширения CodeMirror
  const extensions = useMemo(() => {
    return [
      yaml(),
      EditorView.theme({
        '&': {
          fontSize: '14px',
        },
        '.cm-content': {
          padding: '8px',
          minHeight: '128px', // h-32 = 128px
        },
        '.cm-editor': {
          borderRadius: '0.375rem', // rounded
        },
        '.cm-focused': {
          outline: 'none',
        },
      }),
    ];
  }, []);

  return (
    <div className="w-full border max-h-[500px] overflow-y-auto border-gray-700 rounded overflow-hidden focus-within:ring-3 focus-within:ring-gray-500/50 transition-shadow duration-300 ease-in-out">
      <CodeMirror
        className=''
        value={value}
        onChange={onChange}
        extensions={extensions}
        theme={oneDark}
        editable={!disabled}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: false,
          allowMultipleSelections: false,
        }}
      />
    </div>
  );
}
