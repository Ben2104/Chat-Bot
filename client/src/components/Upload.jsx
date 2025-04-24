import React, { useState, useRef } from 'react';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';

const PdfUpload = ({ onPdfUploaded }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        setPdfFile(null);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        setPdfFile(null);
        return;
      }
      
      setError('');
      setPdfFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        return;
      }
      
      setError('');
      setPdfFile(file);
    }
  };

  const uploadPdf = async () => {
    if (!pdfFile) return;
    
    setIsUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    
    try {
      const response = await fetch('http://localhost:8000/upload-pdf', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Call the callback with uploaded PDF information
        onPdfUploaded({
          name: data.fileName,
          path: `http://localhost:8000${data.filePath}`
        });
        setPdfFile(null); // Reset the file input
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setError('Connection error. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelectedFile = () => {
    setPdfFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Upload area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${error ? 'border-red-400 bg-red-50' : 'border-blue-300 hover:bg-blue-50 hover:border-blue-400'}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        
        <div className="flex flex-col items-center justify-center py-3">
          <FiUpload className="text-2xl mb-2 text-gray-500" />
          <p className="text-sm text-gray-600 font-medium">
            {pdfFile ? pdfFile.name : 'Click or drag a PDF here to upload'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Max file size: 5MB
          </p>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="text-red-500 text-xs mt-1 pl-1">
          {error}
        </div>
      )}
      
      {/* Selected file and action buttons */}
      {pdfFile && (
        <div className="mt-3 flex items-center justify-between p-2 bg-gray-50 rounded-md">
          <div className="flex items-center">
            <FiFile className="text-blue-500 mr-2" />
            <span className="text-sm font-medium truncate max-w-[200px]">
              {pdfFile.name}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={clearSelectedFile}
              type="button"
              className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-200"
            >
              <FiX className="text-lg" />
            </button>
            
            <button
              onClick={uploadPdf}
              disabled={isUploading || !pdfFile}
              className={`px-3 py-1 rounded text-sm font-medium text-white ${
                isUploading || !pdfFile
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfUpload;