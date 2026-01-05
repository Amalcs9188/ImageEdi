# Architecture & Agents Documentation

This document outlines the technical architecture, stack decisions, and the "Agent" workflow used in ImageEdi.

## Tech Stack

*   **Core**: React 19 (Component-based UI).
*   **Language**: TypeScript (Type safety for API responses and component props).
*   **Styling**: Tailwind CSS (Utility classes) + CSS Variables (Theming).
*   **AI Integration**: Google GenAI SDK (`@google/genai`).
*   **State Management**: React `useState` / `useReducer` (Local state suffices for this scope).

## AI Agent / Model Strategy

The application utilizes a single, powerful multimodal model to act as an intelligent image editor.

### Model: `gemini-2.5-flash-image`

We selected `gemini-2.5-flash-image` (internally referred to as the "Nano Banana" series in some contexts) for its balance of speed (Flash) and multimodal capabilities.

### Agent Workflow (`geminiService.ts`)

The "Agent" is a stateless service designed to handle multimodal context construction. It constructs a prompt payload based on the user's current context:

1.  **Context Assembly**:
    *   **Text Prompt**: The user's explicit instruction.
    *   **Main Image (Optional)**: If an image is currently loaded on the canvas, it is converted to Base64 and sent as `inlineData`. This allows the model to perform "Image-to-Image" or "In-painting" style tasks implicitly based on the text instruction.
    *   **Reference Image (Optional)**: If the user attaches a reference via the chat paperclip, it is sent as a secondary `inlineData` part. This provides style or structural guidance.

2.  **API Call**:
    The service calls `ai.models.generateContent` with the assembled parts.

3.  **Output Parsing**:
    The model response is parsed to handle mixed modalities.
    *   **Image**: Extracted from `inlineData` and returned to update the canvas.
    *   **Text**: Extracted to provide conversational feedback in the chat interface.

## Component Architecture

### 1. `App.tsx` (Orchestrator)
*   Holds the "Source of Truth" for the `currentImage`.
*   Manages the message history (`messages` array).
*   Handles global actions like Clear and Download.
*   Coordinates the API call: `UI Input -> Gemini Service -> State Update`.

### 2. `CanvasViewer.tsx` (Visualizer)
*   **Responsibilities**: Displaying the image, Pan/Zoom interactions, and Drag-and-Drop handling.
*   **State**: Local state for `scale` and `position` (pan offset).
*   **UX**: Provides a grid background and visual feedback (overlays) for drag events and loading states.

### 3. `ChatInterface.tsx` (Interaction Layer)
*   **Responsibilities**: collecting user text input, handling file attachments (reference images), and displaying the conversation history.
*   **UI**: Floating, collapsible panel with glassmorphism effects (`backdrop-blur`).
*   **Logic**: Manages its own input state but delegates the actual "Send" action to the parent `App`.

## Data Flow

1.  **User Action**: User types "Make it night time" and hits send.
2.  **Payload Creation**: `App.tsx` captures the text and the current `currentImage` (if exists).
3.  **Service Request**: `generateContent` in `geminiService.ts` bundles these into a multimodal request.
4.  **AI Processing**: Gemini processes the image + text.
5.  **Response Handling**:
    *   A new image Base64 string is returned.
    *   `App.tsx` updates `currentImage` state.
    *   `CanvasViewer` re-renders with the new image.
    *   A new message is added to `ChatInterface` history.

## Future Extensibility

*   **Tools**: The current architecture allows for adding `tools` (like Google Search or Function Calling) to the `generateContent` config in `geminiService.ts`.
*   **History**: Currently, the image editing is stateless (Image-to-Image). To support multi-turn conversation with memory of *previous* edits, we would simply need to maintain the chat history and pass it to the model, though for image editing, sending the *latest* image as context is usually sufficient.
