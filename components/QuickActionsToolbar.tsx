import React from 'react';
import { Sparkles, Palette, Zap, Cpu, HelpCircle } from 'lucide-react';

interface QuickAction {
  label: string;
  prompt: string;
  icon: React.ReactNode;
}

interface QuickActionsToolbarProps {
  onActionSelect: (prompt: string) => void;
  disabled?: boolean;
}

export const QuickActionsToolbar: React.FC<QuickActionsToolbarProps> = ({ onActionSelect, disabled = false }) => {
  const actions: QuickAction[] = [
    { 
      label: 'Sketch', 
      prompt: 'Convert this image into a pencil sketch.',
      icon: <Palette className="w-3 h-3" />
    },
    { 
      label: 'Cyberpunk', 
      prompt: 'Apply a cyberpunk aesthetic with neon lights and dark tones.',
      icon: <Cpu className="w-3 h-3" />
    },
    { 
      label: 'Enhance', 
      prompt: 'Enhance the details and clarity of this image.',
      icon: <Zap className="w-3 h-3" />
    },
    { 
      label: 'Oil Painting', 
      prompt: 'Transform this image into a classic oil painting style.',
      icon: <Sparkles className="w-3 h-3" />
    },
    { 
      label: 'Surprise Me', 
      prompt: 'Make a creative and random artistic change to this image.',
      icon: <HelpCircle className="w-3 h-3" />
    },
  ];

  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-2 px-1">
      <div className="flex items-center gap-2 min-w-max">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => onActionSelect(action.prompt)}
            disabled={disabled}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
              ${disabled 
                ? 'bg-surface border-border text-text-muted opacity-50 cursor-not-allowed' 
                : 'bg-surface border-border text-text-muted hover:text-text hover:bg-surface-highlight hover:border-text-dim active:scale-95'
              }
            `}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};
