import type { PropsWithChildren } from 'react';

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <main className="relative min-h-screen font-normal flex flex-col gap-6 bg-gray-900 text-white">
      {children}
    </main>
  );
}
