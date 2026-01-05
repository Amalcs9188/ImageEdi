import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Paperclip, MessageSquare, ChevronDown, ChevronRight, Loader2, Sparkles, Mic, MicOff, Wand2 } from 'lucide-react';
import { Message } from '../types';
import { Button } from './Button';
import { fileToBase64 } from '../utils';
import { QuickActionsToolbar } from './QuickActionsToolbar';
import { enhancePrompt } from '../services/geminiService';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string, referenceImage?: string) => void;
  isLoading: boolean;
  onImageUpload: (base64: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading,
  onImageUpload,
  isOpen,
  setIsOpen
}) => {
  const [inputValue, setInputValue] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleEnhance = async () => {
    if (!inputValue.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(inputValue);
      setInputValue(enhanced);
    } catch (error) {
       console.error("Enhancement failed", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 400)}px`;
    }
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && !referenceImage) || isLoading) return;
    
    onSendMessage(inputValue, referenceImage || undefined);
    setInputValue('');
    setReferenceImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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
        className={`absolute top-4 right-4 z-50 transition-all duration-300 ${isOpen ? 'opacity-0 pointer-events-none translate-x-10' : 'opacity-100 translate-x-0'}`}
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-text rounded-lg shadow-xl transition-transform hover:scale-105"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium text-sm">Open Chat</span>
        </button>
      </div>

      {/* Docked Sidebar Panel */}
      <div 
        className={`
          fixed md:relative inset-y-0 right-0 h-full bg-surface border-l border-border shadow-2xl z-40 transition-[width] duration-300 ease-in-out flex flex-col shrink-0 overflow-hidden
          ${isOpen ? 'w-full md:w-[400px]' : 'w-0 border-l-0'}
        `}
      >
        <div className="w-[100vw] md:w-[400px] h-full flex flex-col">
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
                       <div 
                         className="mt-2 rounded-lg overflow-hidden border border-border-light cursor-pointer active:scale-95 transition-transform"
                         onClick={() => {
                           if (window.innerWidth < 768) setIsOpen(false);
                         }}
                       >
                         <img src={msg.image} alt="Generated result" className="w-full h-auto" />
                         <div className="p-1 bg-surface/80 text-[10px] text-center text-text-muted">Generated Preview (Tap to View)</div>
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
            <form onSubmit={handleSubmit} className="p-4 pt-0 w-full max-w-4xl mx-auto">
               {/* Hidden File Input */}
               <input 
                  type="file" 
                  ref={referenceInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleReferenceUpload}
                />

               {/* Main Input Container */}
               <div className="relative flex flex-col bg-surface-elevated/50 border border-white/5 focus-within:bg-surface-elevated focus-within:border-primary/20 hover:border-white/10 rounded-[24px] transition-all shadow-lg overflow-hidden backdrop-blur-md">
                  
                  {/* Text Area */}
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if ((inputValue.trim() || referenceImage) && !isLoading) {
                           onSendMessage(inputValue, referenceImage || undefined);
                           setInputValue('');
                           setReferenceImage(null);
                        }
                      }
                    }}
                    placeholder="Ask ImageEdi to..."
                    rows={1}
                    className="w-full min-h-[44px] max-h-[400px] bg-transparent border-none py-3 pl-5 pr-4 text-[15px] text-text placeholder-text-dim/50 focus:ring-0 focus:outline-none resize-none scrollbar-hide leading-relaxed"
                    disabled={isLoading}
                  />
                  {/* Bottom Toolbar */}
                  <div className="flex items-center justify-between px-3 pb-2">
                    
                    {/* Left Actions */}
                    <div className="flex items-center gap-2">
                      <button 
                         type="button" 
                         onClick={() => referenceInputRef.current?.click()}
                         className="p-2 text-text-muted hover:text-text hover:bg-surface-highlight rounded-full transition-colors"
                         title="Attach Reference Image"
                      >
                         <Paperclip className="w-5 h-5" />
                      </button>

                      {/* Enhance Button - appearing next to attach when needed */}
                      {inputValue.trim().length > 2 && (
                         <button
                           type="button"
                           onClick={handleEnhance}
                           disabled={isEnhancing}
                           className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-medium ${
                               isEnhancing 
                               ? 'bg-primary/20 text-primary animate-pulse'
                               : 'bg-surface-highlight text-text-muted hover:text-primary hover:bg-surface-highlight/80'
                           }`}
                         >
                           {isEnhancing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                           <span>Enhance</span>
                         </button>
                      )}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                       <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-2 rounded-full transition-all ${
                          isListening 
                            ? 'bg-danger/20 text-danger animate-pulse' 
                            : 'text-text-muted hover:text-text hover:bg-surface-highlight'
                        }`}
                        title={isListening ? "Stop Listening" : "Voice Input"}
                      >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>

                       <button 
                        type="submit" 
                        disabled={isLoading || (!inputValue.trim() && !referenceImage)}
                        className={`p-2 rounded-full transition-all flex items-center justify-center ${
                           inputValue.trim() || referenceImage
                           ? 'bg-primary text-white hover:bg-primary-hover shadow-md transform hover:scale-105'
                           : 'text-text-dim cursor-not-allowed hover:bg-transparent'
                        }`}
                      >
                        <Send className="w-5 h-5 ml-0.5" />
                      </button>
                    </div>

                  </div>
               </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};