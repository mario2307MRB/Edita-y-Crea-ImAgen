
import React, { useState } from 'react';
import type { StyleOption, AspectRatioOption } from '../types';
import { STYLE_OPTIONS, ASPECT_RATIO_OPTIONS } from '../constants';

interface ImageCreatorProps {
  onGenerate: (prompt: string, style: string, aspectRatio: string) => void;
  isLoading: boolean;
  onReset: () => void;
}

const ImageCreator: React.FC<ImageCreatorProps> = ({ onGenerate, isLoading, onReset }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLE_OPTIONS[0].id);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>(ASPECT_RATIO_OPTIONS[0].id);
  
  const handleSubmit = () => {
    if (prompt) {
      onGenerate(prompt, selectedStyle, selectedAspectRatio);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Crear Imagen desde Texto</h2>
        <button onClick={onReset} className="text-sm text-blue-400 hover:underline">Volver al inicio</button>
      </div>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="prompt-create" className="font-semibold">1. Describe la imagen que quieres crear</label>
        <textarea
          id="prompt-create"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ej: Un astronauta montando a caballo en Marte, estilo fotorrealista..."
          className="w-full h-32 p-2 rounded-md bg-neutral-700 border border-neutral-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold">2. Elige un estilo</label>
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

      <div className="flex flex-col gap-2">
        <label htmlFor="aspect-ratio" className="font-semibold">3. Elige la relación de aspecto</label>
        <select
          id="aspect-ratio"
          value={selectedAspectRatio}
          onChange={(e) => setSelectedAspectRatio(e.target.value)}
          className="w-full p-2 rounded-md bg-neutral-700 border border-neutral-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {ASPECT_RATIO_OPTIONS.map((res: AspectRatioOption) => (
            <option key={res.id} value={res.id}>{res.label}</option>
          ))}
        </select>
      </div>
      
      <div className="mt-auto">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !prompt}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
        >
          {isLoading ? 'Generando...' : 'Crear Imagen'}
        </button>
      </div>
    </div>
  );
};

export default ImageCreator;
