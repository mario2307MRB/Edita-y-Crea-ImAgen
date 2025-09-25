
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      <p className="text-lg text-neutral-300">Procesando con IA, por favor espera...</p>
    </div>
  );
};

export default Loader;
