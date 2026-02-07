import { Split, Trash2, Upload, Loader2 } from 'lucide-react';

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
  return (
    <section className="flex items-center justify-center w-full px-4">
      <div className="w-full md:w-2/3 lg:w-1/2 flex flex-col gap-2">
        {/* Поле вставки текста */}
        <textarea
          className="w-full h-32 p-2 bg-gray-800 border border-gray-700 rounded resize-none 
                 focus:outline-none focus:ring-3 focus:ring-gray-500/50
                 transition-shadow duration-300 ease-in-out"
          placeholder="Вставьте сюда openapi.yaml или yml..."
          value={value}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isProcessing}
        />

        {/* Отображение ошибок */}
        {error && (
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
            disabled={isProcessing || !value.trim()}
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <Split />}
            <span>{isProcessing ? 'Обработка...' : 'Разделить файл'}</span>
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
