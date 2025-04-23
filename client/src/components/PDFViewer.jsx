import { useState, useEffect } from 'react';

export function PDFViewer({ pdfUrl, fileName }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pdfUrl) {
      setLoading(false);
    }
  }, [pdfUrl]);

  if (!pdfUrl) {
    return null;
  }

  return (
    <div className="mb-4 rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-gray-700 truncate">{fileName}</h3>
      </div>
      <div className="w-full h-96 bg-gray-50">
        {loading ? (
          <div className="flex h-full justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0`}
            className="w-full h-full"
            title="PDF Viewer"
          />
        )}
      </div>
    </div>
  );
}