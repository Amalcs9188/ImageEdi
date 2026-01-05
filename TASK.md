# Task: Implement "Quick Actions" Toolbar

## Objective
Enhance the user experience by adding a "Quick Actions" toolbar to the chat interface. This toolbar will provide users with one-click access to common image editing prompts, making it easier to discover capabilities and get quick results.

## Context
The application is a React-based image editor powered by Gemini. The `ChatInterface` component currently handles user input. We want to insert a new component just above the input area that displays a list of clickable action chips.

## Requirements

### 1. Create `QuickActions` Component
**File:** Create a new file `src/components/QuickActions.tsx`.

**UI Design:**
-   **Layout:** A horizontal list of buttons.
-   **Styling:** 
    -   Use a "chip" or "pill" style (rounded-full).
    -   Background: `bg-surface-elevated` or `bg-surface-highlight`.
    -   Text: `text-xs` or `text-sm`, `text-text-muted` (hovering should make it `text-text`).
    -   Border: `border border-border`.
    -   Hover Effect: Slight background change (e.g., `hover:bg-primary/10` or `hover:border-primary-light`).
-   **Responsiveness:** If the chips overflow, the container should be scrollable horizontally (`overflow-x-auto`) with the scrollbar hidden (`scrollbar-hide`).

**Props Interface:**
```typescript
interface QuickActionsProps {
  onAction: (prompt: string) => void;
  disabled?: boolean;
}
```

### 2. Define Actions
Inside the component, define the following list of actions. Each action has a short `label` (for the button) and a longer `prompt` (to be sent to the AI).

| Label | Prompt to Pass |
| :--- | :--- |
| **Sketch** | "Convert this image into a pencil sketch." |
| **Cyberpunk** | "Apply a cyberpunk aesthetic with neon lights and dark tones." |
| **Enhance** | "Enhance the details and clarity of this image." |
| **Oil Painting** | "Transform this image into a classic oil painting style." |
| **Surprise Me** | "Make a creative and random artistic change to this image." |

### 3. Integrate into `ChatInterface`
**File:** `src/components/ChatInterface.tsx`

**Placement:**
-   Import the `QuickActions` component.
-   Place it **inside** the main chat container, immediately **above** the `<form>` (input area) and **below** the message list (or reference preview area).
-   Pass the `onSendMessage` function (or a wrapper around it) to the `onAction` prop.
    -   *Note:* The `onAction` callback should trigger the message sending immediately, just like typing a message and hitting enter.

## Implementation Steps
1.  **Create** `src/components/QuickActions.tsx` with the defined props and UI.
2.  **Define** the array of action objects (label + prompt) within the component.
3.  **Map** over these actions to render the buttons.
4.  **Open** `src/components/ChatInterface.tsx`.
5.  **Insert** `<QuickActions />` above the input form.
6.  **Connect** the `onAction` prop to `onSendMessage`. Ensure you handle the second argument of `onSendMessage` (which is `referenceImage` - you can pass `undefined` or the current `referenceImage` state if you want it to apply to the reference).

## Definition of Done
-   A row of chips appears above the chat input.
-   Clicking a chip immediately sends the corresponding prompt to the chat.
-   The buttons allow for horizontal scrolling if they don't fit.
-   The buttons are disabled when the chat is `isLoading`.
