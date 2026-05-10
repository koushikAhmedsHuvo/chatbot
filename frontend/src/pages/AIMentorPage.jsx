// frontend/src/pages/AIMentorPage.jsx
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { chatWithMentor } from "../lib/api";
import { FaRobot, FaSpinner, FaMicrophone, FaStop, FaTrash, FaCopy, FaCode, FaLanguage, FaCalculator, FaPenFancy } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { MdAutoAwesome } from "react-icons/md";
import toast from "react-hot-toast";

export default function AIMentorPage() {
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: "Hello! I'm your AI Assistant. 🌟\n\nI can help you with:\n• 💻 C Programming & Coding Help\n• 📚 Grammar Corrections\n• 💬 Conversation Practice\n• 📐 Math Problems\n• ✍️ Creative Writing\n\nWhat would you like help with today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [selectedMode, setSelectedMode] = useState("general");
  const [aiProvider, setAiProvider] = useState("auto");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const modes = [
    { id: "general", name: "General", icon: <MdAutoAwesome />, color: "primary" },
    { id: "programming", name: "C Programming", icon: <FaCode />, color: "accent" },
    { id: "language", name: "Language", icon: <FaLanguage />, color: "secondary" },
    { id: "math", name: "Math", icon: <FaCalculator />, color: "info" },
    { id: "creative", name: "Creative", icon: <FaPenFancy />, color: "warning" },
  ];

  const providers = [
    { id: "auto", name: "Auto", color: "primary", icon: "🤖" },
    { id: "gemini", name: "Gemini", color: "success", icon: "🔵" },
    { id: "groq", name: "Groq", color: "accent", icon: "🟢" },
  ];

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => chatWithMentor(data),
    onSuccess: (data, variables) => {
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: data.reply, 
          mode: variables.mode, 
          provider: data.usedProvider || variables.aiProvider,
          timestamp: new Date() 
        },
      ]);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "I'm having trouble connecting right now. Please try again in a moment! 💫",
          timestamp: new Date()
        },
      ]);
      toast.error("Failed to get response");
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        toast.success("Voice captured! 🎤");
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error("Could not recognize speech");
      };
    }
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    
    const messageText = typeof input === 'string' ? input.trim() : String(input || '').trim();
    
    if (!messageText || isPending) return;

    const userMsg = { 
      role: "user", 
      content: messageText, 
      mode: selectedMode, 
      timestamp: new Date() 
    };
    setMessages((prev) => [...prev, userMsg]);
    mutate({ message: messageText, mode: selectedMode, aiProvider });
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const startVoiceInput = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info("Listening... 🎙️");
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const clearChat = () => {
    setMessages([messages[0]]);
    toast.success("Chat cleared");
  };

  const copyLastResponse = () => {
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === "assistant");
    if (lastAssistantMsg) {
      navigator.clipboard.writeText(lastAssistantMsg.content);
      toast.success("Copied to clipboard!");
    }
  };

  const getExamples = () => {
    const examples = {
      general: ["What is machine learning?", "Explain quantum computing", "Tell me a fun fact"],
      programming: ["Write a C program to reverse a string", "Explain pointers in C", "What is malloc?"],
      language: ["Correct: 'I go to school yesterday'", "Difference between 'much' and 'many'", "How to introduce myself?"],
      math: ["Solve: x^2 + 5x + 6 = 0", "What is the derivative of x^2?", "Explain Pythagoras theorem"],
      creative: ["Write a short poem about nature", "Start a mystery story", "Describe a sunset"]
    };
    return examples[selectedMode] || examples.general;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-base-200 to-base-100">
      {/* Header */}
      <div className="p-4 border-b bg-base-100/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-gradient-to-br from-primary to-secondary rounded-full w-12">
                <FaRobot className="size-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-xl flex items-center gap-2">
                AI Assistant
                <span className="badge badge-success badge-sm gap-1">
                  <MdAutoAwesome className="size-3" />
                  Multi-AI
                </span>
              </h1>
              <p className="text-sm opacity-70">Gemini • Groq • C Programming • Grammar • Math</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={copyLastResponse} className="btn btn-ghost btn-sm" title="Copy last response">
              <FaCopy className="size-4" />
            </button>
            <button onClick={clearChat} className="btn btn-ghost btn-sm" title="Clear chat">
              <FaTrash className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Provider Selector */}
      <div className="p-2 border-b bg-base-100/30">
        <div className="flex flex-wrap gap-2 justify-center items-center">
          <span className="text-xs font-medium opacity-70">AI Model:</span>
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setAiProvider(provider.id)}
              className={`btn btn-xs gap-1 transition-all ${
                aiProvider === provider.id 
                  ? `btn-${provider.color} shadow-md` 
                  : "btn-ghost"
              }`}
            >
              <span>{provider.icon}</span>
              {provider.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Selector */}
      <div className="p-3 border-b bg-base-100/50">
        <div className="flex flex-wrap gap-2 justify-center">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`btn btn-sm gap-2 transition-all ${
                selectedMode === mode.id 
                  ? `btn-${mode.color} shadow-md scale-105` 
                  : "btn-ghost"
              }`}
            >
              {mode.icon}
              {mode.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"} animate-fadeIn`}
          >
            <div className="chat-image avatar">
              <div className={`w-8 rounded-full ${msg.role === "user" ? "bg-primary/20" : "bg-secondary/20"} flex items-center justify-center`}>
                {msg.role === "user" ? "👤" : "🤖"}
              </div>
            </div>
            <div className="chat-header text-xs opacity-70 mb-1">
              {msg.role === "user" ? "You" : "AI Assistant"}
              {msg.mode && msg.role === "assistant" && (
                <span className="badge badge-xs ml-1">{msg.mode}</span>
              )}
              {msg.provider && msg.role === "assistant" && (
                <span className="badge badge-xs ml-1 badge-primary">{msg.provider}</span>
              )}
              <time className="text-xs opacity-50 ml-2">
                {msg.timestamp?.toLocaleTimeString() || new Date().toLocaleTimeString()}
              </time>
            </div>
            <div className={`chat-bubble whitespace-pre-wrap ${
              msg.role === "user" 
                ? "chat-bubble-primary bg-gradient-to-r from-primary to-primary-focus" 
                : "chat-bubble-secondary bg-base-200"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isPending && (
          <div className="chat chat-start animate-pulse">
            <div className="chat-image avatar">
              <div className="w-8 rounded-full bg-secondary/20 flex items-center justify-center">🤖</div>
            </div>
            <div className="chat-header text-xs opacity-70 mb-1">AI Assistant</div>
            <div className="chat-bubble chat-bubble-secondary bg-base-200">
              <div className="flex items-center gap-2">
                <FaSpinner className="animate-spin" />
                Thinking using {aiProvider === "auto" ? "best AI" : aiProvider}...
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Topics */}
      <div className="px-4 py-2 border-t border-base-300 bg-base-100/50">
        <div className="flex flex-wrap gap-2 justify-center">
          {getExamples().map((suggestion, i) => (
            <button
              key={i}
              onClick={() => setInput(suggestion)}
              className="badge badge-outline badge-lg hover:badge-primary cursor-pointer transition-all text-xs"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t bg-base-100/80 backdrop-blur-sm">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <textarea
              className="textarea textarea-bordered w-full resize-none pr-12 focus:textarea-primary transition-all"
              rows="2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Ask me about ${modes.find(m => m.id === selectedMode)?.name.toLowerCase()}...`}
              disabled={isPending}
            />
            {recognitionRef.current && (
              <button
                type="button"
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                className={`absolute right-2 bottom-2 btn btn-circle btn-sm ${isListening ? 'btn-error animate-pulse' : 'btn-ghost'}`}
              >
                {isListening ? <FaStop className="size-3" /> : <FaMicrophone className="size-3" />}
              </button>
            )}
          </div>
          <button 
            type="submit" 
            className="btn btn-primary self-end gap-2"
            disabled={!input.trim() || isPending}
          >
            {isPending ? <FaSpinner className="animate-spin" /> : <IoSend />}
            Send
          </button>
        </div>
        <p className="text-xs text-center text-base-content/50 mt-2 flex items-center justify-center gap-1">
          <span>🤖</span>
          <span>Current AI: {providers.find(p => p.id === aiProvider)?.name}</span>
          <span className="mx-1">•</span>
          <span>🎤 Voice input</span>
          <span className="mx-1">•</span>
          <span>💻 C Programming</span>
        </p>
      </form>
    </div>
  );
}