import { useState } from 'react';

export function FileUpload({ onFileUpload, language }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleFileSelection = async (file) => {
    if (file.type !== 'application/pdf') {
      alert(language === 'en' ? 'Please upload a PDF file' : 'Vui lòng tải lên tệp PDF');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('http://localhost:8000/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        onFileUpload(data);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(language === 'en' ? 'Failed to upload PDF' : 'Không thể tải lên PDF');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="space-y-2">
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-gray-600">
          {language === 'en' 
            ? 'Drag and drop a PDF file here, or' 
            : 'Kéo và thả tệp PDF vào đây, hoặc'}
        </p>
        <label className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600">
          <span>
            {uploading 
              ? (language === 'en' ? 'Uploading...' : 'Đang tải lên...') 
              : (language === 'en' ? 'Browse files' : 'Chọn tệp')}
          </span>
          <input 
            type="file" 
            className="hidden" 
            accept="application/pdf" 
            onChange={handleFileInput} 
            disabled={uploading} 
          />
        </label>
      </div>
    </div>
  );
}