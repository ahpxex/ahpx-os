# ahpx-os

This is an OS-alike web app serving as my personal homepage/portfolio.

## 1. Overview

- **Concept:** A "Web OS" interface running in the browser.
- **Layout:** macOS-inspired (Top Bar + Desktop Icons + Window Management).
- **Aesthetic:** "Light Neo-Brutalism". Inspired by PostHog's homepage but cleaner.
  - **Keywords:** High contrast, hard borders, raw materials, playful but professional.
  - **Vibe:** Retro-modern, functional, "Geeky".

## 2. Technical Stack (The "Hard" Rules)

- **Framework:** React 19 + Vite
- **Router:** tan stack router
- **State Management:** `Jotai'
- **Utils:** `date-fns` (for Top Bar time formatting).
- **Styling:** Tailwind CSS
- **Icons:** OpenMoji (SVG format)

## 3. Architecture & Data Model

### Global Store (`useOS`)

The entire OS state must be centralized.

- **`windows`**: Array of objects.
  ```typescript
  interface WindowState {
    id: string;
    title: string;
    icon: string; // Path to OpenMoji
    component: Component; // The content inside
    isOpen: boolean;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
  }
  ```
- **`activeWindowId`**: string (The window currently on top).
- **`theme`**: 'light' | 'dark' (Optional, default to light/beige).

### Z-Index Strategy

- **Base Desktop:** z-0
- **Icons:** z-10
- **Windows:** z-100 to z-999 (Dynamic, clicking a window brings it to `max(zIndexes) + 1`).
- **Top Bar:** z-1000 (Always on top).
- **Context Menus/Modals:** z-2000.

## 4. Design System (Neo-Brutalism Guidelines)

### Colors & Backgrounds

- **Wallpaper:** A subtle noise texture or a warm beige (`#f3f4f6` or PostHog's `#fbf7f0`).
- **Window Background:** Pure White (`#ffffff`).
- **Accent Color:** A strong Orange or Blue for active states (PostHog style).

### Borders & Shadows (The "Brutalist" Touch)

- **Borders:** All windows and buttons must have a **1px or 2px solid black border** (`border-black` or `border-neutral-900`). No soft gray borders.
- **Shadows:** **Hard shadows** only. No blur.
  - _Tailwind Class:_ `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
  - _Interaction:_ On click/active, translate the element `4px` down-right and remove shadow to simulate a physical button press.

### Typography

- **Font:** System UI font or a monospaced font for code vibes (e.g., `JetBrains Mono` or `Inter`).
- **Headings:** Bold, high contrast.

## 5. Component Breakdown

### `Desktop`

- Renders a grid of `DesktopIcon` components.
- Handles background clicks (to deselect windows).

### `TopBar`

- **Left:** Apple Logo equivalent (Home/About).
- **Center:** (Optional) Current App Name.
- **Right:** System Tray (Clock, Volume, Wifi - static or simulated).

### `WindowFrame` (The Wrapper)

- Wraps every "App" content.
- Contains the **TitleBar**:
  - Must handle `onMouseDown` for dragging.
  - Contains "Traffic Lights" (Close/Minimize/Maximize) - styled as simple circles with black borders.
- Handles the **Resize** handles (corners).

### `Dock` / `Taskbar`

- Don't need
