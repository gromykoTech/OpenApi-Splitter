import type { PropsWithChildren } from 'react';

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <main className="h-screen font-normal flex flex-col gap-6 bg-gray-900 text-white ">
      <header className="text-center my-3 md:my-6 px-4">
        <h1 className="text-4xl font-bold">OpenAPI Splitter</h1>
      </header>

      {children}
    </main>
  );
}
