
import React, { useState, useCallback, useRef } from 'react';
import { generateImage, summarizeChanges, createImageFromText } from './services/geminiService';
import type { StyleOption } from './types';
import { STYLE_OPTIONS } from './constants';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import Loader from './components/Loader';
import ImageCreator from './components/ImageCreator';
import { GithubIcon } from './components/icons/GithubIcon';
import { EditIcon } from './components/icons/EditIcon';
import { CreateIcon } from './components/icons/CreateIcon';

// Extend window type for jspdf and html2canvas
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;

  }
}

const App: React.FC = () => {
  const [mode, setMode] = useState<'initial' | 'edit' | 'create'>('initial');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImageURL, setOriginalImageURL] = useState<string | null>(null);
  const [modifiedImageURL, setModifiedImageURL] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>('');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLE_OPTIONS[0].id);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (file: File) => {
    setOriginalFile(file);
    setOriginalImageURL(URL.createObjectURL(file));
    setModifiedImageURL(null);
    setSummary('');
    setError(null);
    setMode('edit');
  };

  const handleEditGeneration = useCallback(async () => {
    if (!originalFile || !userPrompt) {
      setError('Por favor, sube una imagen y escribe una descripción de los cambios.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setModifiedImageURL(null);

    try {
      const fullPrompt = `Tarea principal: Mejora la imagen. Si es en blanco y negro o sepia, restáurala a todo color. Luego, aplica estas modificaciones descritas por el usuario: "${userPrompt}". El estilo final debe ser: "${selectedStyle}".`;
      
      const [imageData, summaryText] = await Promise.all([
        generateImage(originalFile, fullPrompt),
        summarizeChanges(userPrompt, selectedStyle),
      ]);
      
      setModifiedImageURL(`data:${imageData.mimeType};base64,${imageData.data}`);
      setSummary(summaryText);

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Hubo un error desconocido.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [originalFile, userPrompt, selectedStyle]);
  
  const handleCreateGeneration = useCallback(async (prompt: string, style: string, aspectRatio: string) => {
    if (!prompt) {
      setError('Por favor, describe la imagen que quieres crear.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setModifiedImageURL(null);
    setOriginalImageURL(null);
    setSummary(null);

    try {
      const imageData = await createImageFromText(prompt, style, aspectRatio as any);
      setModifiedImageURL(`data:${imageData.mimeType};base64,${imageData.data}`);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Hubo un error desconocido.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    setMode('initial');
    setOriginalFile(null);
    setOriginalImageURL(null);
    setModifiedImageURL(null);
    setUserPrompt('');
    setSelectedStyle(STYLE_OPTIONS[0].id);
    setSummary('');
    setError(null);
  };

  const handleExportPDF = () => {
    if (resultRef.current && window.html2canvas && window.jspdf) {
      const { jsPDF } = window.jspdf;
      window.html2canvas(resultRef.current, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('resultado-ia.pdf');
      });
    }
  };

  const InitialChoiceScreen = () => (
    <div className="max-w-2xl mx-auto text-center py-16">
        <h2 className="text-4xl font-bold mb-4">¿Qué quieres hacer?</h2>
        <p className="text-neutral-400 mb-10 text-lg">Elige si quieres mejorar una imagen existente o crear una nueva desde cero.</p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => setMode('edit')} 
              className="group flex-1 bg-neutral-800 p-8 rounded-lg border border-neutral-700 hover:border-blue-500 hover:bg-neutral-700/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <EditIcon className="w-12 h-12 mx-auto mb-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <h3 className="text-xl font-bold">Editar Imagen Existente</h3>
            </button>
            <button 
              onClick={() => setMode('create')} 
              className="group flex-1 bg-neutral-800 p-8 rounded-lg border border-neutral-700 hover:border-green-500 hover:bg-neutral-700/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <CreateIcon className="w-12 h-12 mx-auto mb-4 text-green-400 group-hover:text-green-300 transition-colors" />
              <h3 className="text-xl font-bold">Crear Imagen desde Texto</h3>
            </button>
        </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans">
      <header className="bg-neutral-800/50 backdrop-blur-sm p-4 border-b border-neutral-700 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-blue-400 cursor-pointer" onClick={handleReset}>Editor de Fotos IA ✨</h1>
        <a href="https://github.com/google/labs-prototypes" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
          <GithubIcon className="w-6 h-6" />
        </a>
      </header>

      <main className="p-4 md:p-8">
        {mode === 'initial' && <InitialChoiceScreen />}
        
        {mode === 'edit' && !originalImageURL && <ImageUploader onImageUpload={handleImageUpload} />}
        
        {((mode === 'edit' && originalImageURL) || mode === 'create') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel (Controls) */}
            <div className="bg-neutral-800 p-6 rounded-lg shadow-lg flex flex-col gap-6">
              {mode === 'edit' && originalImageURL && (
                <>
                  <div>
                    <img src={originalImageURL} alt="Original" className="rounded-md max-h-60 w-auto mx-auto" />
                    <button onClick={handleReset} className="text-sm text-blue-400 hover:underline mt-2 w-full text-center">Cambiar imagen o modo</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="prompt" className="font-semibold">2. Describe los cambios</label>
                    <textarea
                      id="prompt"
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder="Ej: mejorar iluminación, cambiar fondo por uno blanco, dar look profesional..."
                      className="w-full h-24 p-2 rounded-md bg-neutral-700 border border-neutral-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-semibold">3. Elige un estilo (opcional)</label>
                    <div className="flex flex-wrap gap-2">
                      {STYLE_OPTIONS.map((style: StyleOption) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedStyle(style.id)}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            selectedStyle === style.id
                              ? 'bg-blue-500 text-white font-semibold'
                              : 'bg-neutral-700 hover:bg-neutral-600'
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleEditGeneration}
                    disabled={isLoading || !userPrompt}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 mt-auto"
                  >
                    {isLoading ? 'Generando...' : 'Aplicar Magia'}
                  </button>
                </>
              )}
              {mode === 'create' && (
                <ImageCreator 
                  onGenerate={handleCreateGeneration}
                  isLoading={isLoading}
                  onReset={handleReset} 
                />
              )}
            </div>
            
            {/* Right Panel (Results) */}
            <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-center">Resultado</h2>
              {isLoading && <Loader />}
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              {!isLoading && !modifiedImageURL && (
                <div className="flex items-center justify-center h-full text-neutral-400">
                  <p>
                    {mode === 'edit' ? 'La imagen modificada aparecerá aquí.' : 'La imagen generada aparecerá aquí.'}
                  </p>
                </div>
              )}
              {modifiedImageURL && (
                <ResultDisplay
                  ref={resultRef}
                  originalImage={originalImageURL}
                  modifiedImage={modifiedImageURL}
                  summary={summary}
                  onExportPDF={handleExportPDF}
                  onReset={handleReset}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
