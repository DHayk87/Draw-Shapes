# 🎨 Shapes Drawer (Premium v2.1)

A modern, high-performance browser extension that turns any webpage into a professional annotation canvas. Features a premium glassmorphic UI, smooth drawing physics, and a full suite of precision tools.

![Extension Preview](icons/icon_128x128.png)

## ✨ Features

- **💎 Premium UI**: Beautiful glassmorphic toolbar with smooth animations and intuitive controls.
- **🖊️ Precision Tools**:
    - **Pen**: Smooth, quadratic-curve freehand drawing.
    - **Highlighter**: Broad, translucent strokes that render behind other shapes.
    - **Shapes**: Lines, Arrows, Circles, Rectangles, Triangles, Curves, and Polygons.
    - **Text**: Modern, on-page text annotation with real-time editing.
- **🛠️ Advanced Editing**:
    - **Select/Move**: Intuitively reposition and rotate any drawn shape.
    - **Layer Management**: Bring shapes forward, send them backward, or move them to the absolute top/bottom of the stack.
    - **Precision Hit-Testing**: Pixel-perfect selection that follows visual layering order.
    - **Eraser**: Targeted removal of specific shapes with a custom cursor.
    - **Undo/Redo**: Full history support (`Ctrl+Z` / `Ctrl+Y`).
- **📥 Export & Capture**:
    - **Save as PNG**: Export your canvas drawings directly.
    - **Screenshot**: Capture the entire page with your annotations.
- **🚀 Performance**: Optimized with `requestAnimationFrame` for stutter-free dragging and drawing.

## ⌨️ Keyboard Shortcuts

Speed up your workflow with industry-standard hotkeys:

### Tool Selection

| Key   | Tool             | Key   | Tool             |
| :---- | :--------------- | :---- | :--------------- |
| **V** | Cursor (Neutral) | **U** | Curve Tool       |
| **P** | Pen Tool         | **N** | Polygon Tool     |
| **H** | Highlighter      | **X** | Text Tool        |
| **A** | Arrow Tool       | **M** | Select/Move Tool |
| **L** | Line Tool        | **E** | Eraser Tool      |
| **R** | Rectangle Tool   | **D** | Clear All Canvas |
| **C** | Circle Tool      | **S** | Save as PNG      |
| **T** | Triangle Tool    |       |                  |

### Editing & Layering

| Key           | Action                |
| :------------ | :-------------------- |
| **[**         | Send Backward         |
| **]**         | Bring Forward         |
| **Shift + [** | Send to Absolute Back |
| **Shift + ]** | Bring to Absolute Top |
| **Ctrl + Z**  | Undo                  |
| **Ctrl + Y**  | Redo                  |
| **Delete**    | Remove Selected Shape |
| **Esc**       | Cancel / Deselect     |

## 🚀 Installation

1.  Download or clone the repository.
2.  Open Chrome and navigate to `chrome://extensions`.
3.  Enable **Developer mode** (top right).
4.  Click **Load unpacked** and select the root directory of this project.

## 📂 Project Structure

- `manifest.json`: Extension configuration and permissions.
- `src/`: Modular core logic.
    - `state.js`: Centralized application state and layering logic.
    - `canvas.js`: Core rendering engine with two-pass highlighter logic.
    - `ui.js`: Glassmorphic UI, custom modals, and toolbar management.
    - `events.js`: Global event handling, keyboard shortcuts, and precision hit-testing.
    - `screenshot.js`: Page capture and fallbacks.
    - `styles.css`: Modern design system and animations.
- `icons/`: Extension assets.

---

_Created with ❤️ for better web annotations._
