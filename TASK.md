# Task: Implement "Quick Actions" Toolbar

## Objective
Enhance the user experience by adding a "Quick Actions" toolbar to the chat interface. This toolbar will provide users with one-click access to common image editing prompts, making it easier to discover capabilities and get quick results.

## Requirements

### 1. Component Architecture
Create a new, reusable component for the toolbar. It should be designed to handle a list of actions and emit an event when one is selected.

### 2. User Interface (UI)
*   **Layout:** Display a horizontal list of buttons.
*   **Style:** match the application's current "Dark Mode" aesthetic.
    *   Use a "chip" or "pill" style (rounded).
    *   Ensure appropriate hover states and feedback.
*   **Responsiveness:** The toolbar must handle overflow gracefully (e.g., horizontal scrolling) if the actions exceed the container width.

### 3. Functionality
*   The component should render a set of predefined actions.
*   Clicking an action should immediately trigger the chat message submission with a specific prompt.
*   The actions should be disabled if the application is currently processing a request.

### 4. Integration
Integrate this new component into the existing Chat Interface. It should be positioned for easy access, ideally just above the text input area.

## Defined Actions
Implement the following actions. Each action has a label (displayed on the button) and a corresponding prompt (sent to the AI).

| Label | Prompt to Pass |
| :--- | :--- |
| **Sketch** | "Convert this image into a pencil sketch." |
| **Cyberpunk** | "Apply a cyberpunk aesthetic with neon lights and dark tones." |
| **Enhance** | "Enhance the details and clarity of this image." |
| **Oil Painting** | "Transform this image into a classic oil painting style." |
| **Surprise Me** | "Make a creative and random artistic change to this image." |

## Definition of Done
*   A row of action chips appears in the chat interface.
*   Clicking a chip immediately sends the corresponding prompt to the chat.
*   The layout is responsive and handles overflow.
*   The UI matches the existing design system.
