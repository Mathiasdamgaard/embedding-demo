"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { TextContentRenderer } from "./text-content-renderer";

export default function ChatUI() {
  const [input, setInput] = useState("");
  
  const { messages, sendMessage, status, error } = useChat({
    onError: (err) => {
      console.error("Chat error:", err);
    },
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      sendMessage({
        role: "user",
        parts: [{ type: "text", text: input }],
      });
      setInput("");
    } catch (err) {
      console.error("Failed to send:", err);
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200 mb-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            Ask me anything. We&apos;ll use the LLM to provide context-aware
            answers.
          </div>
        )}
        
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">
                {m.parts ? (
                  m.parts.map((part, i) => {
                    if (part.type === "text") {
                      return <TextContentRenderer key={i} text={part.text} />;
                    }
                    return null;
                  })
                ) : (
                  <TextContentRenderer text={"what"} />
                )}
              </div>
            </div>
          </div>
        ))}

        {/* High Contrast Loading Indicator */}
        {status === "submitted" && (
          <div className="flex justify-start mt-4">
             <div className="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-tl-none text-sm flex items-center gap-2 shadow-sm">
               <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
               <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
               <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
               <span className="ml-1 font-medium">Thinking...</span>
             </div>
          </div>
        )}
        
        {/* Error Message UI */}
        {error && (
           <div className="p-4 bg-red-50 text-red-500 rounded-lg text-sm text-center mt-2">
             Unable to get response: {error.message}
           </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about products..."
          disabled={status === "streaming" || status === "submitted"}
        />
        <button
          type="submit"
          disabled={status === "streaming" || status === "submitted"}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </>
  );
}