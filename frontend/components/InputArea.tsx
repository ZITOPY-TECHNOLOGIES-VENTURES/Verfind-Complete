import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { Send, Paperclip, X, Image as ImageIcon } from 'lucide-react';
import { Attachment } from '../types';

interface InputAreaProps {
  onSend: (text: string, attachments: Attachment[]) => void;
  disabled: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || disabled) return;
    onSend(text, attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments: Attachment[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = (event) => {
            if (event.target?.result) {
              const base64String = (event.target.result as string).split(',')[1];
              newAttachments.push({ mimeType: file.type, data: base64String });
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
      setAttachments([...attachments, ...newAttachments]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="p-5 bg-[var(--bg-surface)] backdrop-blur-md border-t border-[var(--border-color)]">
      <div className="max-w-4xl mx-auto">
        {attachments.length > 0 && (
          <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative group shrink-0 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-xl border border-[var(--border-color)] overflow-hidden bg-[var(--bg-app)] flex items-center justify-center">
                  {att.mimeType.startsWith('image/') ? (
                    <img src={`data:${att.mimeType};base64,${att.data}`} className="w-full h-full object-cover" alt="preview" />
                  ) : <Paperclip className="text-[var(--text-secondary)]" />}
                </div>
                <button onClick={() => removeAttachment(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative flex items-end gap-3 glass p-2 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-[var(--color-primary)]/30 transition-shadow">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--bg-app)] rounded-xl transition-colors"
            disabled={disabled}
          >
            <ImageIcon size={22} />
          </button>
          <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
          
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent border-0 focus:ring-0 text-[var(--text-primary)] placeholder-[var(--text-secondary)] py-3 px-2 resize-none max-h-[150px] overflow-y-auto leading-relaxed"
            rows={1}
            disabled={disabled}
          />
          
          <button
            onClick={handleSend}
            disabled={(!text.trim() && attachments.length === 0) || disabled}
            className={`p-3 rounded-xl transition-all duration-300 ${
              (!text.trim() && attachments.length === 0) || disabled
                ? 'bg-[var(--bg-app)] text-[var(--text-secondary)]'
                : 'bg-[var(--color-primary)] text-white shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
        <div className="text-center mt-3">
           <p className="text-[10px] text-[var(--text-secondary)] font-medium tracking-wide opacity-70">
             AI can make mistakes. Review generated information.
           </p>
        </div>
      </div>
    </div>
  );
};