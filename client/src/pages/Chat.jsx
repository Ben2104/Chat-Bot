import { useState, useRef, useEffect } from "react";
import { InputBox } from "../components/InputBox";
import { ChatBubble } from "../components/ChatBubble";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { Banner } from "../components/Banner";
import { FileUpload } from "../components/FileUpload";
import { PDFViewer } from "../components/PDFViewer";

export function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // Each message: { role, content }
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [language, setLanguage] = useState("en"); // 'en' for English, 'vi' for Vietnamese
  const messagesEndRef = useRef(null);
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' or 'pdf'
  const [activePDF, setActivePDF] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      setShowBanner(false);
    }
  }, [messages]);

  const parseAndHandleInput = async (trimmedInput) => {
    // Check if it's a language change command
    if (trimmedInput.match(/^\/lang(uage)?\s+(en|vi|english|vietnamese)$/i)) {
      const langCode = trimmedInput.match(/^\/lang(uage)?\s+(en|vi|english|vietnamese)$/i)[2].toLowerCase();
      const newLang = langCode === 'english' ? 'en' : langCode === 'vietnamese' ? 'vi' : langCode;
      setLanguage(newLang);
      return {
        role: "assistant",
        content: newLang === 'en'
          ? "Language switched to English."
          : "Đã chuyển sang tiếng Việt."
      };
    }
    // Check if it's a summarize URL command
    else if (trimmedInput.match(/^\/sum(marize)?\s+https?:\/\/.+/i)) {
      const url = trimmedInput.replace(/^\/sum(marize)?\s+/i, '').trim();
      return handleSummarizeURL(url);
    }
    // If there's an active PDF, treat it as a PDF query
    else if (activePDF) {
      return handlePDFQuery(trimmedInput, activePDF.id);
    }
    // Regular chat message
    else {
      return handleRegularChat(trimmedInput);
    }
  };

  const handleRegularChat = async (trimmedInput) => {
    try {
      const res = await fetch("http://localhost:8000/sendText", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: trimmedInput,
          language: language
        }),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      return {
        role: "assistant",
        content: language === 'en'
          ? "An error occurred while sending your message."
          : "Đã xảy ra lỗi khi gửi tin nhắn của bạn."
      };
    }
  };

  const handlePDFQuery = async (query, pdfId) => {
    try {
      const res = await fetch("http://localhost:8000/query-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          pdfId,
          language
        }),
      });
      const data = await res.json();
      return {
        role: "assistant",
        content: data.answer || (language === 'en' 
          ? "I couldn't find an answer to your question in the PDF."
          : "Tôi không thể tìm thấy câu trả lời cho câu hỏi của bạn trong PDF.")
      };
    } catch (error) {
      console.error("Error querying PDF:", error);
      return {
        role: "assistant",
        content: language === 'en'
          ? "An error occurred while processing your query."
          : "Đã xảy ra lỗi khi xử lý truy vấn của bạn."
      };
    }
  };

  const handleSummarizeURL = async (url) => {
    try {
      const res = await fetch("http://localhost:8000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          language
        }),
      });
      const data = await res.json();

      const summaryTitle = language === 'en'
        ? `**Summary of [${url}](${url})**\n\n`
        : `**Tóm tắt của [${url}](${url})**\n\n`;

      return {
        role: "assistant",
        content: summaryTitle + data.content
      };
    } catch (error) {
      console.error("Error summarizing URL:", error);
      return {
        role: "assistant",
        content: language === 'en'
          ? `Failed to summarize the URL: ${url}. Please check if the URL is valid and try again.`
          : `Không thể tóm tắt URL: ${url}. Vui lòng kiểm tra xem URL có hợp lệ không và thử lại.`
      };
    }
  };

  const handleFileUpload = (pdfData) => {
    setActivePDF(pdfData);
    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
        content: language === 'en' 
          ? `I've processed your PDF: **${pdfData.fileName}**. You can now ask me questions about its content.`
          : `Tôi đã xử lý PDF của bạn: **${pdfData.fileName}**. Bây giờ bạn có thể hỏi tôi về nội dung của nó.`
      }
    ]);
    setActiveTab("chat");
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (showBanner) setShowBanner(false);

    // Create a copy of the input before clearing it
    const currentInput = trimmed;

    const userMessage = { role: "user", content: currentInput };
    setMessages(prev => [...prev, userMessage]);
    setInput(""); // Clear the input field
    setLoading(true);

    try {
      // Parse the input and handle accordingly using the saved copy
      const response = await parseAndHandleInput(currentInput);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant", content: language === 'en'
            ? "An error occurred while processing your message."
            : "Đã xảy ra lỗi khi xử lý tin nhắn của bạn."
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Get the banner text based on current language
  const getBannerDescription = () => {
    if (language === 'en') {
      return `Interact with the AI in real-time. Simply type your message and receive an immediate response.
      
Special commands:
- /summarize [url] - Summarize content from a URL
- /language [en|vi] - Switch between English and Vietnamese
- Upload a PDF to ask questions about its content`;
    } else {
      return `Tương tác với AI trong thời gian thực. Chỉ cần nhập tin nhắn của bạn và nhận phản hồi ngay lập tức.
      
Các lệnh đặc biệt:
- /summarize [url] - Tóm tắt nội dung từ một URL
- /language [en|vi] - Chuyển đổi giữa tiếng Anh và tiếng Việt
- Tải lên PDF để hỏi về nội dung của nó`;
    }
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex">
            <button
              className={`py-4 px-6 ${activeTab === 'chat' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('chat')}
            >
              {language === 'en' ? 'Chat' : 'Trò chuyện'}
            </button>
            <button
              className={`py-4 px-6 ${activeTab === 'pdf' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('pdf')}
            >
              {language === 'en' ? 'PDF Upload' : 'Tải lên PDF'}
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
        {activeTab === 'chat' ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {showBanner && (
              <Banner
                title={language === 'en' ? "Chat Interaction" : "Tương tác trò chuyện"}
                description={getBannerDescription()}
              />
            )}

            {activePDF && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-blue-800">
                    {language === 'en' ? 'Active PDF: ' : 'PDF đang hoạt động: '}
                    {activePDF.fileName}
                  </span>
                  <button 
                    className="ml-auto text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => setActivePDF(null)}
                  >
                    {language === 'en' ? 'Clear' : 'Xóa'}
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <ChatBubble key={index} {...msg} />
            ))}

            {loading && <LoadingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                {language === 'en' ? 'Upload a PDF' : 'Tải lên tệp PDF'}
              </h2>
              <p className="text-gray-600 mb-4">
                {language === 'en' 
                  ? 'Upload a PDF document to ask questions about its content.' 
                  : 'Tải lên tài liệu PDF để đặt câu hỏi về nội dung của nó.'}
              </p>
              <FileUpload onFileUpload={handleFileUpload} language={language} />
            </div>
            
            {activePDF && (
              <PDFViewer pdfUrl={activePDF.url} fileName={activePDF.fileName} />
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto">
          <InputBox
            input={input}
            setInput={setInput}
            onSend={sendMessage}
            placeholder={language === 'en'
              ? activePDF ? "Ask a question about the PDF..." : "Type your message, or use /summarize [url]"
              : activePDF ? "Đặt câu hỏi về tệp PDF..." : "Nhập tin nhắn của bạn, hoặc sử dụng /summarize [url]"}
          />
        </div>
      </div>
    </div>
  );
}