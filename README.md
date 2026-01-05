# ImageEdi (Gemini)

ImageEdi is a sleek, AI-powered image editor and generator built with React and Google's Gemini 2.5 Flash Image model. It features a floating chat interface for natural language editing, drag-and-drop canvas support, and multimodal capabilities (text + image + reference image).

## Features

- **AI Image Generation**: Generate images from text prompts.
- **Conversational Editing**: Chat with the AI to edit existing images (e.g., "Make the background snowy", "Turn this into a sketch").
- **Reference Images**: Upload a reference image to guide the style or structure of the generation.
- **Interactive Canvas**: Pan, zoom, and inspect images.
- **Drag & Drop**: Drag images directly onto the canvas to start editing.
- **Theming**: Sleek dark mode UI with CSS variable-based theming.

## Prerequisites

- Node.js (v18 or higher)
- A Google Cloud Project with the Gemini API enabled.
- A Gemini API Key.

## Setup & Installation

1.  **Clone the repository** (or download the source files).

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    You must configure your API key. Create a `.env` file in the root directory:

    ```env
    API_KEY=your_google_gemini_api_key_here
    ```

    *Note: The application uses `process.env.API_KEY` to authenticate with the Google GenAI SDK.*

4.  **Run the application**:
    ```bash
    npm run dev
    ```

## Usage

1.  **Start**: Open the app in your browser.
2.  **Generate**: Type a prompt in the chat (e.g., "A futuristic city with neon lights") and hit send.
3.  **Edit**:
    *   Drag and drop an image onto the canvas (or use the upload icon in the chat).
    *   Ask for changes (e.g., "Add a flying car").
4.  **Reference**: Click the paperclip icon in the chat to attach a reference image (e.g., a style reference) alongside your text prompt.
5.  **Download**: Click the download icon in the header to save your creation.

## Technologies

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS, CSS Variables
- **AI SDK**: `@google/genai`
- **Icons**: Lucide React
