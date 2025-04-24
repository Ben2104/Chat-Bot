import { useState, useRef, useEffect } from "react";
import { InputBox } from "../components/InputBox";
import { ChatBubble } from "../components/ChatBubble";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { Banner } from "../components/Banner";
import { FiUpload, FiFile, FiX, FiExternalLink } from "react-icons/fi";

export function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [language, setLanguage] = useState("en");
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetPdf(file);
    }
  };

  const validateAndSetPdf = (file) => {
    setUploadError("");
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadError(language === "en" 
        ? "Only PDF files are allowed" 
        : "Chỉ chấp nhận file PDF");
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(language === "en" 
        ? "File size exceeds 5MB limit" 
        : "Kích thước file vượt quá giới hạn 5MB");
      return;
    }
    
    setPdfFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetPdf(e.dataTransfer.files[0]);
    }
  };

  const clearSelectedFile = () => {
    setPdfFile(null);
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePDFUpload = async () => {
    if (!pdfFile) return;

    const formData = new FormData();
    formData.append("pdf", pdfFile); // Changed from "file" to "pdf" to match backend

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/upload-pdf", { // Updated endpoint
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        setPdfUrl(`http://localhost:8000${data.filePath}`);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: language === "en"
              ? `PDF "${data.fileName}" uploaded successfully. You can now view it below.`
              : `PDF "${data.fileName}" đã được tải lên thành công. Bạn có thể xem nó bên dưới.`,
          },
        ]);
        clearSelectedFile();
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading PDF:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: language === "en"
            ? `An error occurred while uploading the PDF: ${error.message}`
            : `Đã xảy ra lỗi khi tải lên PDF: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex">
            <button className="py-4 px-6 border-b-2 text-blue-600 border-blue-500">
              {language === "en" ? "Chat" : "Trò chuyện"}
            </button>
            <div className="ml-auto flex items-center">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-sm p-1 bg-gray-100 rounded border border-gray-300"
              >
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {showBanner && (
            <Banner
              title={language === "en" ? "Chat Interaction" : "Tương tác trò chuyện"}
              description={language === "en" 
                ? "Upload a PDF to view its content and interact with it."
                : "Tải lên một PDF để xem nội dung và tương tác với nó."
              }
              onClose={() => setShowBanner(false)}
            />
          )}

          {messages.map((msg, index) => (
            <ChatBubble key={index} {...msg} />
          ))}

          {loading && <LoadingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* PDF Upload Area */}
          <div className="w-full">
            <div 
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                ${uploadError ? 'border-red-400 bg-red-50' : 'border-blue-300 hover:bg-blue-50 hover:border-blue-400'}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="flex flex-col items-center justify-center py-3">
                <FiUpload className="text-2xl mb-2 text-gray-500" />
                <p className="text-sm text-gray-600 font-medium">
                  {pdfFile 
                    ? pdfFile.name 
                    : language === "en"
                      ? "Click or drag a PDF here to upload"
                      : "Nhấp hoặc kéo PDF vào đây để tải lên"
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {language === "en" ? "Max file size: 5MB" : "Kích thước tối đa: 5MB"}
                </p>
              </div>
            </div>
            
            {/* Error message */}
            {uploadError && (
              <div className="text-red-500 text-xs mt-1 pl-1">
                {uploadError}
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
                    onClick={handlePDFUpload}
                    disabled={loading || !pdfFile}
                    className={`px-3 py-1 rounded text-sm font-medium text-white ${
                      loading || !pdfFile
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {loading ? 
                      (language === "en" ? 'Uploading...' : 'Đang tải lên...') : 
                      (language === "en" ? 'Upload' : 'Tải lên')
                    }
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PDF Viewer */}
          {pdfUrl && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mt-4">
              <div className="bg-gray-100 border-b p-3 flex justify-between items-center">
                <div className="text-sm font-medium text-gray-700 truncate">
                  {language === "en" ? "Uploaded PDF" : "PDF đã tải lên"}
                </div>
                <a 
                  href={pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 flex items-center"
                >
                  <span className="text-sm mr-1">
                    {language === "en" ? "Open" : "Mở"}
                  </span>
                  <FiExternalLink size={16} />
                </a>
              </div>
              
              <iframe
                src={pdfUrl}
                title="Uploaded PDF"
                className="w-full h-96 border-none"
              />
            </div>
          )}
          
          {/* Chat Input */}
          <InputBox
            input={input}
            setInput={setInput}
            onSend={() => {}}
            placeholder={
              language === "en"
                ? "Type your message, or upload a PDF to interact with it."
                : "Nhập tin nhắn của bạn, hoặc tải lên một PDF để tương tác với nó."
            }
          />
        </div>
      </div>
    </div>
  );
}