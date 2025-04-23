// Add this to your InputBox.jsx component if it doesn't have proper event handling

import React from 'react';

export function InputBox({ input, setInput, onSend, placeholder }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid newline
      if (input.trim()) {
        onSend();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form submission default behavior
    if (input.trim()) {
      onSend();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="border-t border-gray-300 p-4 bg-white"
    >
      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-blue-300"
        >
          Send
        </button>
      </div>
    </form>
  );
}