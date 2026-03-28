import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface UploadZoneProps {
  onUploadSuccess: (data: any) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      onUploadSuccess(data);
    } catch (err) {
      setError('Could not connect to backend. Ensure FastAPI is running.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  return (
    <div 
      className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
        ${isDragging ? 'border-primary bg-primary/5' : 'border-slate-700 hover:border-slate-500 bg-panel/50'}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input 
        id="fileInput"
        type="file" 
        className="hidden" 
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      
      {isUploading ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-slate-400 animate-pulse">Processing 3D Volume...</p>
        </div>
      ) : (
        <>
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Upload className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">Upload CT Scan</h3>
          <p className="text-slate-400 text-center max-w-xs mb-4">
            Drag and drop your DICOM, MHD, or NIfTI file here, or click to browse.
          </p>
          <div className="flex gap-4 text-xs text-slate-500 uppercase tracking-widest font-bold">
            <span>DICOM</span>
            <span>MHD/RAW</span>
            <span>NIFTI</span>
          </div>
        </>
      )}

      {error && (
        <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};

export default UploadZone;
