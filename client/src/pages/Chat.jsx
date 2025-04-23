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
  const messagesEndRef = useRef(null);

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
    // Check if it's a summarize URL command (starts with /summarize or /sum)
    else if (trimmedInput.match(/^\/sum(marize)?\s+https?:\/\/.+/i)) {
      const url = trimmedInput.replace(/^\/sum(marize)?\s+/i, '').trim();
      return handleSummarizeURL(url);
    }
    // Check if it's a search command (starts with /search)
    else if (trimmedInput.match(/^\/search\s+.+/i)) {
      const query = trimmedInput.replace(/^\/search\s+/i, '').trim();
      // Return an explanation that search is no longer available
      return {
        role: "assistant",
        content: language === 'en'
          ? "The search function is no longer available."
          : "Chức năng tìm kiếm không còn khả dụng."
      };
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
          language: language // Send the current language preference
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

  const handleSummarizeURL = async (url) => {
    try {
      const res = await fetch("http://localhost:8000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          language: language // Send the current language preference 
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
- /language [en|vi] - Switch between English and Vietnamese`;
    } else {
      return `Tương tác với AI trong thời gian thực. Chỉ cần nhập tin nhắn của bạn và nhận phản hồi ngay lập tức.
      
Các lệnh đặc biệt:
- /summarize [url] - Tóm tắt nội dung từ một URL
- /language [en|vi] - Chuyển đổi giữa tiếng Anh và tiếng Việt`;
    }
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {showBanner && (
          <Banner
            title={language === 'en' ? "Chat Interaction" : "Tương tác trò chuyện"}
            description={getBannerDescription()}
          />
        )}

        <div className="flex justify-end mb-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm p-1 bg-gray-100 rounded border border-gray-300"
          >
            <option value="en">English</option>
            <option value="vi">Tiếng Việt</option>
          </select>
        </div>

        {messages.map((msg, index) => (
          <ChatBubble key={index} {...msg} />
        ))}

        {loading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <InputBox
        input={input}
        setInput={setInput}
        onSend={sendMessage}
        placeholder={language === 'en'
          ? "Type your message, or use /summarize [url]"
          : "Nhập tin nhắn của bạn, hoặc sử dụng /summarize [url]"}
      />
    </div>
  );
}