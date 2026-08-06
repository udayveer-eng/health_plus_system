"use client";

import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, File, X } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
}

export function FileUpload({ onFilesSelected, maxFiles = 5, accept = "*/*" }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFiles = (newFiles: FileList | File[]) => {
    const filesArray = Array.from(newFiles);
    setSelectedFiles(prev => {
      const combined = [...prev, ...filesArray].slice(0, maxFiles);
      onFilesSelected(combined);
      return combined;
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [maxFiles, onFilesSelected]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      onFilesSelected(updated);
      return updated;
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 bg-gray-900 hover:bg-gray-800'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept={accept}
          onChange={handleFileChange}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-gray-800 rounded-full shadow-inner">
            <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-blue-400' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-200">
              Drag & drop files or{' '}
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 transition-colors focus:outline-none"
                onClick={() => fileInputRef.current?.click()}
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Supports any file up to 10MB
            </p>
          </div>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Selected Files ({selectedFiles.length}/{maxFiles})
          </h4>
          <ul className="space-y-2">
            {selectedFiles.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded-lg group"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <File className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300 truncate">{file.name}</span>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="p-1 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
