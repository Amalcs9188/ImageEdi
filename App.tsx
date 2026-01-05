import React, { useState, useEffect } from 'react';
import { CanvasViewer } from './components/CanvasViewer';
import { ChatInterface } from './components/ChatInterface';
import { generateContent } from './services/geminiService';
import { Message } from './types';

import { Download, Share2, Trash2, Sparkles } from 'lucide-react';
import { Button } from './components/Button';

// Mock nanoid for simplicity 
const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'system',
      text: "Welcome to ImageEdi! I'm powered by Gemini. Upload an image to start editing, or describe what you want to generate."
    }
  ]);
  // Chat open state, default true
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string, referenceImage?: string) => {
    // 1. Add user message
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      text,
      referenceImage
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 2. Call Gemini
      // If a reference image is attached in chat, treat it as the primary subject for editing.
      // Otherwise, use the current canvas image.
      const sourceImage = referenceImage || currentImage;

      const result = await generateContent({
        prompt: text,
        currentImage: sourceImage || undefined,
        // If we heavily prioritized the reference image as source, we don't pass it as a secondary reference
        // unless we strictly want 2-image input. For now, we assume "one subject".
        referenceImage: undefined 
      });

      // 3. Handle Result
      const modelMsgId = generateId();
      
      // If we got an image, update main canvas
      if (result.image) {
        setCurrentImage(result.image);
        // On mobile, auto-close chat when a new image is generated so user can see it
        if (window.innerWidth < 768) {
           setIsChatOpen(false);
        }
      }

      // Add model response message
      const modelMsg: Message = {
        id: modelMsgId,
        role: 'model',
        text: result.text || (result.image ? "Here is the result." : "I processed that, but produced no visible output."),
        image: result.image // Optional: Show thumbnail in chat too?
      };

      setMessages(prev => [...prev, modelMsg]);

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: generateId(),
        role: 'model',
        text: "Sorry, I encountered an error processing your request. Please try again.",
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `image-edi-edit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setCurrentImage(null);
    setMessages(prev => [...prev, {
      id: generateId(),
      role: 'system',
      text: "Canvas cleared."
    }]);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-text font-sans">
      {/* Top Bar / Header */}
      <header className="h-14 bg-surface border-b border-border-subtle flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary-light rounded-full" />
           <span className="font-bold text-lg tracking-tight">ImageEdi <span className="font-normal opacity-50">(Gemini)</span></span>
        </div>
        
        <div className="flex items-center gap-2">
          {currentImage && (
            <>
              <Button variant="ghost" size="sm" onClick={handleClear} className="text-text-muted hover:text-danger">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload} className="text-text-muted hover:text-text">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Canvas Area - Clicking here closes chat if open (on mobile mainly) */}
        <div 
          className="flex-1 relative h-full w-full"
          onClick={() => {
            // Close chat if open and screen is mobile, or general click-away behavior desired
             if (isChatOpen && window.innerWidth < 768) setIsChatOpen(false);
          }}
        >
          <CanvasViewer 
            imageUrl={currentImage} 
            isLoading={isLoading}
            onImageDrop={setCurrentImage}
          />
        </div>

        {/* Floating Chat Interface */}
        <ChatInterface 
          messages={messages} 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onImageUpload={setCurrentImage}
          isOpen={isChatOpen}
          setIsOpen={setIsChatOpen}
        />
      </div>
    </div>
  );
}

export default App;