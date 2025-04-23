// filepath: /Users/kaydee/Desktop/Desktop - Kaydee's Macbook/githubclone/Chat-Bot/client/src/pages/Chat.jsx
import { useState, useRef, useEffect } from "react";
import { InputBox } from "../components/InputBox";
import { ChatBubble } from "../components/ChatBubble";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { Banner } from "../components/Banner";

export function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // Each message: { role, content }
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [language, setLanguage] = useState("en"); // 'en' for English, 'vi' for Vietnamese
  const [pdfUrl, setPdfUrl] = useState(null); // Store the uploaded PDF URL
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handlePDFUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/uploadPDF", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setPdfUrl(data.filePath); // Store the uploaded PDF URL
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: language === "en"
            ? "PDF uploaded successfully. You can now view it below."
            : "PDF đã được tải lên thành công. Bạn có thể xem nó bên dưới.",
        },
      ]);
    } catch (error) {
      console.error("Error uploading PDF:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: language === "en"
            ? "An error occurred while uploading the PDF."
            : "Đã xảy ra lỗi khi tải lên PDF.",
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
            <button
              className={`py-4 px-6 border-b-2 ${
                "text-blue-600 border-blue-500"
              }`}
            >
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
              description={`Upload a PDF to view its content and interact with it.`}
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
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePDFUpload}
            className="mb-4"
          />
          {pdfUrl && (
            <iframe
              src={`http://localhost:8000${pdfUrl}`}
              title="Uploaded PDF"
              className="w-full h-96 border"
            />
          )}
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