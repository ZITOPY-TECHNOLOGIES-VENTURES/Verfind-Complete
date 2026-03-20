import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, MessageRole } from '../types';
import { User, Bot, Loader2, Link2, ExternalLink, BrainCircuit } from 'lucide-react';

interface MessageListProps {
  messages: ChatMessage[];
  isGenerating: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isGenerating }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-60">
          <div className="w-20 h-20 bg-gradient-to-tr from-[var(--color-primary)] to-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
             <Bot size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Verifind Assistant</h2>
          <p className="text-sm text-center max-w-xs">Ask about Abuja districts, property prices, or our verification process.</p>
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-4 ${msg.role === MessageRole.USER ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
             msg.role === MessageRole.MODEL 
              ? 'bg-gradient-to-tr from-blue-600 to-emerald-500 text-white' 
              : 'bg-gradient-to-tr from-slate-200 to-slate-300 text-slate-600 dark:from-slate-700 dark:to-slate-600 dark:text-slate-300'
          }`}>
            {msg.role === MessageRole.MODEL ? <Bot size={20} /> : <User size={20} />}
          </div>

          {/* Message Bubble */}
          <div className="flex flex-col max-w-[80%] md:max-w-[70%]">
            <div
              className={`rounded-2xl p-5 shadow-sm relative ${
                msg.role === MessageRole.USER
                  ? 'bg-[var(--color-primary)] text-white rounded-tr-none'
                  : 'glass-card text-[var(--text-primary)] rounded-tl-none border-0'
              }`}
            >
              {/* Thinking Indicator */}
              {msg.role === MessageRole.MODEL && msg.isThinking && !msg.text && !msg.generatedImage && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-primary)] animate-pulse">
                  <BrainCircuit size={14} />
                  <span>Analyzing market data...</span>
                </div>
              )}

              {/* Generated Image */}
              {msg.generatedImage && (
                <div className="mb-4 rounded-xl overflow-hidden shadow-md transition-transform hover:scale-[1.01] duration-300">
                  <img 
                    src={`data:image/png;base64,${msg.generatedImage}`} 
                    alt="Generated content" 
                    className="w-full h-auto object-cover max-h-96"
                  />
                </div>
              )}

              {/* Image Attachments (User) */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap justify-end">
                  {msg.attachments.map((att, idx) => (
                    <img
                      key={idx}
                      src={`data:${att.mimeType};base64,${att.data}`}
                      alt="attachment"
                      className="w-20 h-20 object-cover rounded-xl border-2 border-white/20 shadow-sm"
                    />
                  ))}
                </div>
              )}

              {/* Text Content */}
              <div className={`prose prose-sm max-w-none break-words leading-relaxed ${
                msg.role === MessageRole.USER ? 'prose-invert text-white' : 'text-[var(--text-primary)] dark:prose-invert'
              }`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>

              {/* Grounding Sources */}
              {msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
                  <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-2 flex items-center gap-1">
                    <Link2 size={12} /> Sources
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingSources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-app)] hover:bg-[var(--bg-surface-solid)] border border-[var(--border-color)] rounded-lg text-xs font-medium text-[var(--color-primary)] transition-all truncate max-w-[200px] shadow-sm hover:shadow"
                      >
                        <span className="truncate">{source.title}</span>
                        <ExternalLink size={10} className="flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {isGenerating && (
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md text-white">
            <Bot size={20} />
          </div>
           <div className="glass-card px-6 py-4 rounded-2xl rounded-tl-none flex items-center gap-3">
              <Loader2 className="animate-spin text-[var(--color-primary)]" size={18} />
              <span className="text-sm font-medium text-[var(--text-secondary)]">Verifind AI is typing...</span>
           </div>
        </div>
      )}

      <div ref={bottomRef} className="h-4" />
    </div>
  );
};