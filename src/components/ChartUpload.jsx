import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export const ChartUpload = ({ label, timeframe, image, onUpload, onClear }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {timeframe} Chart
      </label>
      
      <div 
        {...getRootProps()} 
        className={`relative aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
          ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}
          ${image ? "border-solid border-primary/20" : ""}
        `}
      >
        <input {...getInputProps()} />
        
        {image ? (
          <>
            <img 
              src={URL.createObjectURL(image)} 
              alt={timeframe} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="p-2 bg-destructive text-destructive-foreground rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4">
            <Upload className="w-8 h-8 mb-2" />
            <p className="text-sm text-center">Drag & drop or click to upload</p>
          </div>
        )}
      </div>
    </div>
  );
};
