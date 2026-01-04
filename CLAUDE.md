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
- **State Management:** `Jotai`
- **Utils:** `date-fns` (for Top Bar time formatting).
- **Styling:** Tailwind CSS
- **Icons:** OpenMoji (SVG format)
- **Database:** Supabase - MUST use `@supabase/supabase-js` SDK only. NO ORMs, NO raw SQL queries.

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

- **Wallpaper:** A subtle noise texture or a warm beige (`#fbf7f0`).
- **Window Background:** Pure White (`#ffffff`).
- **Primary Color Theme:**
  - **Primary:** `#FF4F00` (Vibrant Orange-Red)
  - **Primary Light:** `#FF7A33`
  - **Primary Dark:** `#CC3F00`
  - **Primary Background:** `#FFF1EB` (Light tint for backgrounds/hover states)
- Use CSS variables: `var(--color-primary)`, `var(--color-primary-light)`, `var(--color-primary-dark)`, `var(--color-primary-bg)`

### Borders & Shadows (The "Brutalist" Touch)

- **Borders:** Use **1px borders** with the primary color (`border border-[var(--color-border)]`).
- **Border Color:** `#FF4F00` (same as primary) via `var(--color-border)`.
- **Windows:** No drop shadows on window frames (cleaner, more native feel).
- **Buttons/Cards:** Hard shadows optional for interactive elements.

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
- Provides `WindowContextMenuProvider` for right-click context menus.

### Window Context Menu

Use `useWindowContextMenu` hook to add right-click menu to any window:

```tsx
import { useWindowContextMenu } from '@/contexts/WindowContextMenuContext'

function MyApp() {
  const { setContextMenuItems, clearContextMenuItems } = useWindowContextMenu()

  useEffect(() => {
    setContextMenuItems([
      { label: 'Action', onClick: () => {} },
      { label: 'Disabled', onClick: () => {}, disabled: true },
      { divider: true, label: '', onClick: () => {} },
    ])
    return () => clearContextMenuItems()
  }, [])
}
```

### `Dock` / `Taskbar`

- Don't need
