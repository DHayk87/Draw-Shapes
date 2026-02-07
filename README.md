# 🎨 Shapes Drawer (Premium v2.0)

A modern, high-performance browser extension that turns any webpage into a collaborative canvas. Features a premium glassmorphic UI, smooth drawing physics, and a full suite of professional annotation tools.

![Extension Preview](icons/icon_128x128.png)

## ✨ Features

- **💎 Premium UI**: Beautiful glassmorphic toolbar with smooth animations and intuitive controls.
- **🖊️ Precision Tools**:
    - **Pen**: Smooth, quadratic-curve freehand drawing.
    - **Highlighter**: Broad, translucent strokes that render behind other shapes.
    - **Shapes**: Lines, Arrows, Circles, Rectangles, and Triangles.
    - **Text**: Modern, on-page text annotation.
- **🛠️ Advanced Editing**:
    - **Select/Move**: Intuitively reposition and rotate any drawn shape.
    - **Eraser**: Targeted removal of specific shapes with a custom cursor.
    - **Undo/Redo**: Full history support (`Ctrl+Z` / `Ctrl+Y`).
- **📥 Export & Capture**:
    - **Save as PNG**: Export your canvas drawings directly.
    - **Screenshot**: Capture the entire page with your annotations.
- **🚀 Performance**: Optimized with `requestAnimationFrame` for stutter-free dragging and drawing.

## ⌨️ Keyboard Shortcuts

Speed up your workflow with industry-standard hotkeys:

| Key   | Action           | Key                | Action            |
| :---- | :--------------- | :----------------- | :---------------- |
| **V** | Cursor (Neutral) | **E**              | Eraser            |
| **P** | Pen Tool         | **M**              | Select/Move       |
| **H** | Highlighter      | **D**              | Clear All         |
| **A** | Arrow            | **S** / **Ctrl+S** | Save as PNG       |
| **L** | Line             | **Ctrl + Z**       | Undo              |
| **R** | Rectangle        | **Ctrl + Y**       | Redo              |
| **C** | Circle           | **Delete**         | Remove Selected   |
| **T** | Triangle         | **Esc**            | Cancel / Deselect |
| **X** | Text             |                    |                   |

## 🚀 Installation

1.  Download or clone the repository.
2.  Open Chrome and navigate to `chrome://extensions`.
3.  Enable **Developer mode** (top right).
4.  Click **Load unpacked** and select the root directory of this project.

## 📂 Project Structure

- `manifest.json`: Extension configuration and permissions.
- `src/`: Modular core logic.
    - `state.js`: Centralized application state.
    - `canvas.js`: Core rendering engine & two-pass highlighter logic.
    - `ui.js`: Glassmorphic UI, custom modals, and toolbar management.
    - `events.js`: Global event handling and keyboard shortcuts.
    - `screenshot.js`: Page capture and fallbacks.
    - `styles.css`: Modern design system and animations.
- `icons/`: Extension assets.

---

_Created with ❤️ for better web annotations._
