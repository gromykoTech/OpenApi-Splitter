import { Split, Trash2, Upload, Loader2, Wand2 } from 'lucide-react';
import { YamlEditor } from './YamlEditor';
import { useSplitterStore } from '@stores/splitterStore';
import { yamlValidator } from '@features/splitter/services/yamlValidator';

type Props = {
  value: string;
  setInputText: (value: string) => void;
  handleClearInput: () => void;
  handleSplit: () => void;
  handleUpload: () => void;
  isProcessing?: boolean;
  error?: string | null;
};

export function InputSection({
  value,
  setInputText,
  handleUpload,
  handleSplit,
  handleClearInput,
  isProcessing = false,
  error,
}: Props) {
  const store = useSplitterStore();
  const yamlErrors = store.yamlErrors;
  const isYamlValid = store.isYamlValid;

  // Обработчик форматирования YAML
  const handleFormat = () => {
    if (!value.trim()) return;
    const formatted = yamlValidator.format(value);
    if (formatted !== value) {
      setInputText(formatted);
    }
  };

  return (
    <section className="flex items-center justify-center w-full px-4">
      <div className="w-full md:w-2/3 lg:w-1/2 flex flex-col gap-2">
        {/* Поле вставки текста с подсветкой синтаксиса */}
        <YamlEditor
          value={value}
          onChange={setInputText}
          errors={yamlErrors}
          disabled={isProcessing}
          placeholder="Вставьте сюда openapi.yaml или yml..."
        />

        {/* Отображение ошибок валидации YAML */}
        {yamlErrors.length > 0 && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-2">
            <div className="font-semibold mb-1">Ошибки валидации YAML:</div>
            <ul className="list-disc list-inside space-y-1">
              {yamlErrors.map((err, idx) => (
                <li key={idx}>
                  Строка {err.line}, колонка {err.column}: {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Отображение других ошибок */}
        {error && !yamlErrors.length && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-2">
            {error}
          </div>
        )}

        {/* Кнопки */}
        <div className="flex max-md:flex-col gap-2 w-full *:cursor-pointer *:flex *:justify-center *:items-center *:gap-2">
          <button
            title="Загрузить готовый файл openapi.yaml"
            className="flex-1 px-1.5 lg:px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleUpload}
            disabled={isProcessing}
          >
            <Upload />
            <span>Загрузить файл</span>
          </button>
          <button
            title="Разделить openapi.yaml на компоненты"
            className="flex-1 px-1.5 lg:px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSplit}
            disabled={isProcessing || !value.trim() || !isYamlValid}
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <Split />}
            <span>{isProcessing ? 'Обработка...' : 'Разделить файл'}</span>
          </button>

          <button
            title="Форматировать YAML"
            className="flex-0 px-1.5 lg:px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleFormat}
            disabled={isProcessing || !value.trim() || !isYamlValid}
          >
            <Wand2 />
            <span className="md:hidden">Форматировать</span>
          </button>

          <button
            title="Очистить поле ввода"
            className="flex-0 px-1.5 lg:px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleClearInput}
            disabled={isProcessing}
          >
            <Trash2 />
            <span className="md:hidden">Очистить ввод</span>
          </button>
        </div>
      </div>
    </section>
  );
}
