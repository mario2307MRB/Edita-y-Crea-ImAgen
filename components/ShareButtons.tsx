import React, { useState, useEffect } from 'react';
import { ShareIcon } from './icons/ShareIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

interface ShareButtonsProps {
  text: string;
  modifiedImage: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ text, modifiedImage }) => {
  const [canShare, setCanShare] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    if (navigator.share) {
      setCanShare(true);
    }
  }, []);

  const dataURLtoBlob = async (dataUrl: string) => {
    const res = await fetch(dataUrl);
    return await res.blob();
  };

  const handleShare = async () => {
    try {
      const blob = await dataURLtoBlob(modifiedImage);
      const file = new File([blob], 'imagen-modificada-ia.png', { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Editor de Fotos IA',
          text: text,
          files: [file],
        });
      } else {
        throw new Error("No se puede compartir el archivo.");
      }
    } catch (error) {
      console.error('Error al compartir la imagen:', error);
      alert('Tu navegador no soporta compartir este archivo. Por favor, descarga la imagen y compártela manualmente.');
    }
  };
  
  const copyImageToClipboard = async () => {
    if (!navigator.clipboard?.write) {
      alert('Tu navegador no soporta copiar imágenes al portapapeles.');
      return;
    }
    try {
      const blob = await dataURLtoBlob(modifiedImage);
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Error al copiar la imagen:', error);
      alert('No se pudo copiar la imagen al portapapeles.');
    }
  };

  return (
    <div className="text-center border-t border-neutral-700 pt-4 mt-4">
      <p className="font-semibold mb-3">Compartir resultado:</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {canShare && (
          <button 
            onClick={handleShare} 
            className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <ShareIcon className="w-5 h-5" />
            Compartir
          </button>
        )}
        <button 
          onClick={copyImageToClipboard}
          disabled={copyStatus === 'copied'}
          className="flex-1 bg-neutral-600 hover:bg-neutral-700 disabled:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          {copyStatus === 'idle' ? <ClipboardIcon className="w-5 h-5" /> : <CheckIcon className="w-5 h-5" />}
          {copyStatus === 'idle' ? 'Copiar Imagen' : '¡Copiada!'}
        </button>
      </div>
    </div>
  );
};

export default ShareButtons;