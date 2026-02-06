import { Split, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [fileTree, setFileTree] = useState<string[]>([]);
  const [selectedCode, setSelectedCode] = useState('');

  // Очищение текста
  const handleClearInput = () => {
    setInputText('');
  };

  // Заглушки для кнопок
  const handleUpload = () => {
    alert('Загрузка файла (пока заглушка)');
  };

  const handleSplit = () => {
    // Здесь будет логика разделения openapi.yaml
    setFileTree(['components/', 'paths/']);
    setSelectedCode('# Пример кода после разделения');
  };

  return (
    <article className="h-screen font-normal flex flex-col gap-6 bg-gray-900 text-white ">
      {/* Заголовок */}
      <header className="text-center my-3 md:my-6 px-4">
        <h1 className="text-4xl font-bold">OpenAPI Splitter</h1>
      </header>

      {/* Зона ввода файла / текста */}
      <section className="flex items-center justify-center w-full px-4">
        <div className="w-full md:w-1/3 flex flex-col gap-2">
          {/* Поле вставки текста */}
          <textarea
            className="w-full h-32 p-2 bg-gray-800 border border-gray-700 rounded resize-none 
                 focus:outline-none focus:ring-3 focus:ring-gray-500/50
                 transition-shadow duration-300 ease-in-out"
            placeholder="Вставьте сюда openapi.yaml или yml..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          {/* Кнопки */}
          <div className="flex max-md:flex-col gap-2 w-full *:cursor-pointer *:flex *:justify-center *:items-center *:gap-2">
            <button
              title="Загрузить готовый файл openapi.yaml"
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              onClick={handleUpload}
            >
              <Upload />
              <span>Загрузить файл</span>
            </button>
            <button
              title="Разделить openapi.yaml на компоненты"
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              onClick={handleSplit}
            >
              <Split />
              <span>Разделить файл</span>
            </button>

            <button
              title="Очистить поле ввода"
              className="flex-0 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              onClick={handleClearInput}
            >
              <Trash2 />
              <span className="md:hidden">Очистить ввод</span>
            </button>
          </div>
        </div>
      </section>

      {/* Основная рабочая зона */}
      <main className="flex flex-1 border-t border-gray-700 overflow-hidden bg-gray-800 group hover:ring-2 hover:ring-gray-500/50 transition-shadow duration-300 ease-in-out">
        {/* Левая колонка — дерево файлов */}
        <section className="w-1/3 py-2 px-4 rounded-tr-xl overflow-auto border-r border-gray-700 group-hover:ring-2 group-hover:ring-gray-500/50 transition-shadow duration-300 ease-in-out">
          <div className="flex items-center mb-2">
            {/* Три точки сверху */}
            <div className="flex gap-1 mr-2">
              <span className="w-3 h-3 bg-red-500/80 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-500/80 rounded-full"></span>
              <span className="w-3 h-3 bg-green-500/80 rounded-full"></span>
            </div>
            <h2 className="font-semibold">Файловая структура</h2>
          </div>
          <ul className="text-gray-300">
            {fileTree.map((file, idx) => (
              <li
                key={idx}
                className="cursor-pointer hover:text-gray-100"
                onClick={() => setSelectedCode(`# Содержимое файла ${file}`)}
              >
                {file}
              </li>
            ))}
          </ul>
        </section>

        {/* Правая колонка — просмотр кода */}
        <section className="flex-1 py-2 px-4 overflow-auto">
          <div className="flex items-center mb-2">
            {/* Три точки сверху */}
            <div className="flex gap-1 mr-2">
              <span className="w-3 h-3 bg-red-500/80 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-500/80 rounded-full"></span>
              <span className="w-3 h-3 bg-green-500/80 rounded-full"></span>
            </div>
            <h2 className="font-semibold text-gray-200">Просмотр кода</h2>
          </div>
          <pre className="text-sm text-gray-200 whitespace-pre-wrap">
            {selectedCode}
          </pre>
        </section>
      </main>
    </article>
  );
}
