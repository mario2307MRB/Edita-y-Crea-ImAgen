
import React, { forwardRef } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { PdfIcon } from './icons/PdfIcon';
import ShareButtons from './ShareButtons';

interface ResultDisplayProps {
  originalImage: string | null;
  modifiedImage: string;
  summary: string | null;
  onExportPDF: () => void;
  onReset: () => void;
}

const ResultDisplay = forwardRef<HTMLDivElement, ResultDisplayProps>(({ originalImage, modifiedImage, summary, onExportPDF, onReset }, ref) => {
    
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = modifiedImage;
        link.download = 'imagen-generada-ia.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasOriginal = !!originalImage;

    return (
        <div className="flex flex-col gap-6 h-full justify-between">
            <div>
              <div ref={ref} className="bg-neutral-900 p-4 rounded-lg">
                  <div className={`grid ${hasOriginal ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
                      {hasOriginal && (
                          <div>
                              <h3 className="font-bold text-center mb-2 text-neutral-400">Antes</h3>
                              <img src={originalImage} alt="Original" className="w-full h-auto rounded-md object-contain" style={{maxHeight: '40vh'}} />
                          </div>
                      )}
                      <div>
                          <h3 className="font-bold text-center mb-2 text-green-400">{hasOriginal ? 'Después' : 'Imagen Generada'}</h3>
                          <img src={modifiedImage} alt="Modificada" className="w-full h-auto rounded-md object-contain" style={{maxHeight: '40vh'}} />
                      </div>
                  </div>
                  {summary && (
                      <div className="mt-4 text-center">
                          <p className="font-semibold text-lg">Resumen de cambios:</p>
                          <p className="text-neutral-300 italic">"{summary}"</p>
                      </div>
                  )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={handleDownload} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <DownloadIcon className="w-5 h-5" />
                      Descargar
                  </button>
                  {hasOriginal && (
                    <button onClick={onExportPDF} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <PdfIcon className="w-5 h-5" />
                        Exportar PDF
                    </button>
                  )}
              </div>
              <ShareButtons text="¡Mira la imagen que creé con IA!" modifiedImage={modifiedImage} />

              <div className="text-center mt-2">
                  <button onClick={onReset} className="text-sm text-blue-400 hover:underline">
                      {hasOriginal ? 'Empezar de nuevo' : 'Crear otra imagen'}
                  </button>
              </div>
            </div>
        </div>
    );
});

ResultDisplay.displayName = 'ResultDisplay';

export default ResultDisplay;
