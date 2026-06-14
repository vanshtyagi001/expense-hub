import React, { useState } from 'react';
import { UploadCloud, File, X, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

export default function ImportDropzone() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { groupId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    setError(null);
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !token || !groupId) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/groups/${groupId}/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      navigate(`/groups/${groupId}/import/${data.importSessionId}`);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div 
        className={`border-2 border-dashed rounded-[32px] p-12 text-center transition-colors ${dragActive ? 'border-[#00e013] bg-green-50' : 'border-gray-300 bg-white hover:border-[#00e013] hover:bg-green-50/50'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleChange} 
          className="hidden" 
          id="csv-upload" 
        />
        
        {!file ? (
          <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-white">
              <UploadCloud size={32} />
            </div>
            <div>
              <h3 className="text-xl font-medium">Click to upload or drag and drop</h3>
              <p className="text-gray-500 mt-1">CSV file containing expenses</p>
            </div>
          </label>
        ) : (
          <div className="flex justify-between items-center bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
               <File className="text-[#00e013]" size={24} />
               <span className="font-medium truncate max-w-[200px]">{file.name}</span>
            </div>
            <button onClick={() => setFile(null)} className="text-gray-500 hover:text-black">
               <X size={20} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {file && (
        <Button 
          onClick={handleUpload} 
          disabled={uploading} 
          className="w-full h-14 rounded-full bg-[#00e013] text-black hover:bg-[#00e013]/90 text-lg font-medium shadow-sm transition-all"
        >
          {uploading ? 'Processing File...' : 'Upload & Scan file'}
        </Button>
      )}
    </div>
  );
}
