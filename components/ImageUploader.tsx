
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (['image/jpeg', 'image/png'].includes(file.type)) {
        onImageUpload(file);
      } else {
        alert('Por favor, sube un archivo JPG o PNG.');
      }
    }
  };

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, [onImageUpload]);

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-lg p-12 transition-colors duration-300 ${isDragging ? 'border-blue-500 bg-neutral-700/50' : 'border-neutral-600 bg-neutral-800'}`}
      >
        <div className="flex flex-col items-center gap-4 text-neutral-400">
          <UploadIcon className="w-12 h-12" />
          <p className="text-lg font-semibold">Arrastra y suelta tu imagen aquí</p>
          <p>o</p>
          <label htmlFor="file-upload" className="cursor-pointer bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Seleccionar archivo
          </label>
          <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e.target.files)} />
          <p className="text-sm mt-2">Soporta JPG y PNG</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
