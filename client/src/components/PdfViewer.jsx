import React from 'react';
import { FiExternalLink } from 'react-icons/fi';

const PdfViewer = ({ pdfUrl, fileName }) => {
  return (
    <div className="pdf-viewer bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gray-100 border-b p-3 flex justify-between items-center">
        <div className="text-sm font-medium text-gray-700 truncate">
          {fileName || 'PDF Document'}
        </div>
        <a 
          href={pdfUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 flex items-center"
        >
          <span className="text-sm mr-1">Open</span>
          <FiExternalLink size={16} />
        </a>
      </div>
      
      <iframe
        src={pdfUrl}
        title={fileName || 'PDF Document'}
        className="w-full h-96 border-none"
      />
    </div>
  );
};

export default PdfViewer;