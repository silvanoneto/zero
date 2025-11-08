'use client';

import { useEffect } from 'react';

export default function BookPage() {
  useEffect(() => {
    // Redirecionar para o HTML estático
    window.location.href = '/book/index.html';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Carregando o livro...</p>
      </div>
    </div>
  );
}
