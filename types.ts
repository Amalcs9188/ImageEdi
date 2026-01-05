export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text?: string;
  image?: string; // Base64 string for generated images shown in chat
  referenceImage?: string; // Base64 string if user attached a reference
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface CanvasState {
  scale: number;
  position: { x: number; y: number };
}

export type EditorMode = 'view' | 'edit';
