# ahpx-os

This is an OS-alike web app serving as my personal homepage/portfolio.

## 1. Overview

- **Concept:** A "Web OS" interface running in the browser.
- **Layout:** Windows XP-inspired (Desktop Icons + Taskbar + Window Management).
- **Aesthetic:** Windows XP UI (via XP.css), with Tailwind used for layout and positioning.

## 2. Technical Stack (The "Hard" Rules)

- **Framework:** React 19 + Vite
- **Router:** tan stack router
- **State Management:** `Jotai`
- **Utils:** `date-fns` (for Top Bar time formatting).
- **Styling:** `XP.css` for component look + Tailwind CSS for layout
- **Icons:** OpenMoji (SVG format)
- **Storage:** Browser `localStorage` for profiles and blog posts. Keep the app frontend-only unless a future task explicitly adds a backend again.

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
- **Taskbar:** z-2500 (Always on top).
- **Context Menus:** z-2000.
- **Fullscreen Editors:** z-2500.
- **System Dialogs:** z-3000.

## 4. Design System (Windows XP Faithful)

### Colors & Backgrounds

- **Wallpaper:** Classic Windows XP "Bliss" wallpaper (`/xp.png`).
- **Window Background:** Pure White (`#ffffff`).
- **Accent Color Theme (XP Blue):**
  - **Primary:** `#316AC5` (XP selection/highlight blue)
  - **Primary Light:** `#4A86D9`
  - **Primary Dark:** `#245099`
  - **Primary Background:** `#EBF0F9`
- **Border Color:** `#ACA899` (XP classic gray border)
- Use CSS variables: `var(--color-primary)`, `var(--color-primary-light)`, `var(--color-primary-dark)`, `var(--color-primary-bg)`, `var(--color-border)`

### Windows & Components

- **Windows:** Use XP.css for authentic window chrome (title bar gradients, buttons).
- **Taskbar:** Luna blue gradient at the bottom, green Start button.
- **Context Menus:** White background, gray border, blue highlight on hover.

### Desktop Icons

- **No hover effect.** Icons only respond to click/selection.
- **Single click:** Selects the icon (blue tint on image, blue background on text label).
- **Double click:** Opens the associated window/app.
- **Selection box:** Dashed hollow outline (not filled), using `mix-blend-mode: difference`.

### Typography

- **System Font:** `Tahoma, Verdana, Arial, sans-serif` (authentic XP system font).
- **Desktop icon labels:** 11px Tahoma, white text with dark shadow, blue background when selected.
- **Anti-aliasing:** Disabled (`-webkit-font-smoothing: none`) for authentic XP pixel rendering.

### Borders & Shadows

- **Borders:** Use XP classic gray borders (`var(--color-border)`) for most UI elements.
- **Windows:** XP.css handles window borders and title bar styling natively.
- **No neo-brutalism.** No hard shadows, no thick colored borders.

## 5. Component Breakdown

### `Desktop`

- Renders a grid of `DesktopIcon` components.
- Handles background clicks (to deselect windows).

### `TopBar`

Deprecated (Windows XP layout uses a bottom Taskbar).

### `WindowFrame` (The Wrapper)

- Wraps every "App" content.
- Contains the **TitleBar** (XP.css styled with Luna blue gradient):
  - Must handle `onMouseDown` for dragging.
  - Contains Minimize/Maximize/Close buttons (XP.css native styling).
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

### System Dialog

Use `useDialog` hook for confirmation dialogs and alerts (replaces native `window.confirm`/`window.alert`):

```tsx
import { useDialog } from '@/contexts/DialogContext'

function MyComponent() {
  const dialog = useDialog()

  const handleDelete = async () => {
    const confirmed = await dialog.confirm('Delete Item', 'Are you sure?')
    if (confirmed) {
      // proceed with delete
    }
  }

  const showMessage = async () => {
    await dialog.alert('Notice', 'Operation completed.')
  }
}
```

Methods:
- `confirm(title, message)` - Returns `Promise<boolean>`, shows Cancel/Confirm buttons
- `alert(title, message)` - Returns `Promise<void>`, shows OK button
- `showDialog(options)` - Custom dialog with custom actions

### Toast Notifications

Use `useToast` hook for feedback messages:

```tsx
import { useToast } from '@/contexts/ToastContext'

function MyComponent() {
  const toast = useToast()

  toast.success('Saved!')
  toast.error('Failed to save')
  toast.warning('Check your input')
  toast.info('Processing...')
}
```

### `Taskbar`

- Bottom bar with Start button, task buttons for open windows, and system tray (clock).
