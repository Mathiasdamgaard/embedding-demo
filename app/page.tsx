"use client";

import { useState } from "react";
import SemanticSearch from "./components/semantic-search";
import ChatUI from "./components/chat-ui";
import MaterialMatcher from "./components/material-matcher";

type View = "chat" | "search" | "matcher";

export default function AppWrapper() {
  const [view, setView] = useState<View>("chat");

  const getButtonClasses = (isActive: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-full transition-colors ${
      isActive
        ? "bg-indigo-600 text-white shadow-lg"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }`;

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
        🛍️ Hackathon Shop Agent
      </h1>

      {/* View Toggle Tabs */}
      <div className="flex justify-center mb-6 space-x-2">
        <button
          onClick={() => setView("chat")}
          className={getButtonClasses(view === "chat")}
        >
          🤖 Chat
        </button>
        <button
          onClick={() => setView("search")}
          className={getButtonClasses(view === "search")}
        >
          ⚡ Search
        </button>
        <button
          onClick={() => setView("matcher")}
          className={getButtonClasses(view === "matcher")}
        >
          👷 Akkord+ PoV
        </button>
      </div>

      {/* Conditional Content */}
      <div className="flex flex-col grow overflow-hidden">
        {view === "chat" && <ChatUI />}
        {view === "search" && <SemanticSearch />}
        {view === "matcher" && <MaterialMatcher />}
      </div>
    </div>
  );
}
