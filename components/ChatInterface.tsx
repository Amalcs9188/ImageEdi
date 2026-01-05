import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Paperclip, MessageSquare, ChevronDown, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { Message } from '../types';
import { Button } from './Button';
import { fileToBase64 } from '../utils';
import { QuickActionsToolbar } from './QuickActionsToolbar';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string, referenceImage?: string) => void;
  isLoading: boolean;
  onImageUpload: (base64: string) => void; // To set the main canvas image if user uploads directly
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading,
  onImageUpload
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && !referenceImage) || isLoading) return;
    
    onSendMessage(inputValue, referenceImage || undefined);
    setInputValue('');
    setReferenceImage(null);
  };

  const handleReferenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setReferenceImage(base64);
      } catch (err) {
        console.error("Failed to load reference image", err);
      }
    }
    // Reset value so same file can be selected again
    if (referenceInputRef.current) referenceInputRef.current.value = '';
  };

  const handleMainUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        onImageUpload(base64);
      } catch (err) {
        console.error("Failed to load main image", err);
      }
    }
  };

  const handleQuickAction = (prompt: string) => {
    onSendMessage(prompt, referenceImage || undefined);
    setInputValue('');
    setReferenceImage(null);
  };



  return (
    <>
      {/* Floating Toggle Button (Visible when closed) */}
      <div 
        className={`absolute top-4 right-4 z-30 transition-all duration-300 ${isOpen ? 'opacity-0 pointer-events-none translate-x-10' : 'opacity-100 translate-x-0'}`}
      >
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-text rounded-lg shadow-xl transition-transform hover:scale-105"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium text-sm">Open Chat</span>
        </button>
      </div>

      {/* Docked Sidebar Panel */}
      <div 
        className={`
          relative h-full bg-surface border-l border-border shadow-2xl z-20 transition-[width] duration-300 ease-in-out flex flex-col shrink-0 overflow-hidden
          ${isOpen ? 'w-[400px]' : 'w-0 border-l-0'}
        `}
      >
        <div className="w-[400px] h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-surface shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-text font-bold">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text text-sm">ImageEdi</h3>
                <p className="text-xs text-text-muted">Powered by Gemini 2.5</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
               <Button variant="icon" size="sm" onClick={() => fileInputRef.current?.click()} title="Upload Main Image">
                  <ImageIcon className="w-4 h-4" />
               </Button>
               {/* Collapse Button */}
               <Button variant="icon" size="sm" onClick={() => setIsOpen(false)} title="Close Sidebar">
                 <ChevronRight className="w-5 h-5" /> 
               </Button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleMainUpload}
            />
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide min-h-0">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-text-dim space-y-2 mt-8">
                <Sparkles className="w-12 h-12 opacity-20" />
                <p className="text-sm">Start by asking for an image or upload one to edit.</p>
                <div className="grid grid-cols-2 gap-2 w-full mt-4">
                   <button onClick={() => handleQuickAction("Generate a futuristic cyberpunk city")} className="text-xs bg-surface-highlight hover:bg-border-light p-2 rounded text-left transition-colors text-text-muted">"Generate a futuristic city"</button>
                   <button onClick={() => handleQuickAction("Make the image look like a sketch")} className="text-xs bg-surface-highlight hover:bg-border-light p-2 rounded text-left transition-colors text-text-muted">"Make it look like a sketch"</button>
                </div>
              </div>
            )}
            
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`
                    max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-surface-elevated text-text-muted rounded-bl-none border border-border'}
                    ${msg.isError ? 'bg-danger-bg border-danger text-danger' : ''}
                  `}
                >
                  {/* Reference Image Thumbnail in Message */}
                  {msg.referenceImage && (
                    <div className="mb-2 rounded-lg overflow-hidden border border-white/20">
                      <img src={msg.referenceImage} alt="Reference" className="w-full h-32 object-cover" />
                      <div className="bg-black/50 p-1 text-[10px] text-center text-white/80">Reference</div>
                    </div>
                  )}
                  
                  {msg.text && <div className="whitespace-pre-wrap">{msg.text}</div>}
                  
                  {msg.image && (
                     <div className="mt-2 rounded-lg overflow-hidden border border-border-light">
                       <img src={msg.image} alt="Generated result" className="w-full h-auto" />
                       <div className="p-1 bg-surface/80 text-[10px] text-center text-text-muted">Generated Preview</div>
                     </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-elevated rounded-2xl rounded-bl-none px-4 py-3 border border-border">
                   <div className="flex items-center gap-2">
                     <Loader2 className="w-4 h-4 animate-spin text-primary-light" />
                     <span className="text-xs text-text-muted">ImageEdi is thinking...</span>
                   </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Area */}
          <div className="flex flex-col shrink-0 bg-surface border-t border-border z-10">
            {/* Contextual Top Area */}
            {referenceImage ? (
              <div className="flex flex-col">
                {/* Reference Header */}
                <div className="px-3 py-2 bg-surface-highlight/30 flex items-center justify-between border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <img src={referenceImage} alt="Ref" className="w-10 h-10 rounded object-cover border border-border" />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-text">Reference Image</span>
                      <span className="text-[10px] text-text-muted">Will be used as structure</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setReferenceImage(null)}
                    className="p-1 hover:bg-surface rounded-full text-text-muted hover:text-text transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Quick Actions for Ref */}
                <QuickActionsToolbar 
                  onActionSelect={handleQuickAction} 
                  disabled={isLoading} 
                />
              </div>
            ) : (
              /* Quick Actions for Standard */
              <QuickActionsToolbar 
                onActionSelect={handleQuickAction} 
                disabled={isLoading} 
              />
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-3 pt-0">
              <div className="flex gap-2">
                <input 
                  type="file" 
                  ref={referenceInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleReferenceUpload}
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="px-2.5" 
                  onClick={() => referenceInputRef.current?.click()}
                  title="Attach Reference Image"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask to..."
                    className="w-full h-full bg-surface-highlight border border-border rounded-lg pl-3 pr-10 py-2 text-sm text-text placeholder-text-dim focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-all"
                    disabled={isLoading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading || (!inputValue.trim() && !referenceImage)}
                  className="px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};