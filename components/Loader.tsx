
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Contactando con los servidores de IA...",
  "Analizando la petición...",
  "La creatividad necesita su tiempo, por favor espera...",
  "Generando la magia pixel a pixel...",
  "Aplicando los toques finales...",
  "Casi listo, ¡gracias por tu paciencia!"
];

const Loader: React.FC = () => {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = loadingMessages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      <p className="text-lg text-neutral-300 transition-opacity duration-500">{message}</p>
    </div>
  );
};

export default Loader;
