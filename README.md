# Shapes drawer

Draw shapes on any webpage with this browser extension.

## Features

-   **Drawing Tools**:
    -   Pen for free-form drawing
    -   Lines
    -   Arrows
    -   Circles
    -   Rectangles
    -   Triangles
    -   Text
-   **Editing Tools**:
    -   Select and move shapes
    -   Eraser
    -   Undo (Ctrl+Z) and Redo (Ctrl+Y)
    -   Clear all drawings from the page
-   **Customization**:
    -   Choose the color of your shapes
    -   Adjust the line width
    -   Set the opacity of shapes
-   **Actions**:
    -   Save your drawing as a PNG file
    -   Take a screenshot of the current page

## How to Use

1.  **Installation**:
    -   Clone or download this repository.
    -   Open Chrome and navigate to `chrome://extensions`.
    -   Enable "Developer mode".
    -   Click on "Load unpacked" and select the directory where you cloned/downloaded the repository.
2.  **Usage**:
    -   Click the extension icon in the browser toolbar to activate the drawing tools on the current page.
    -   A toolbar will appear with all the available tools. You can drag the toolbar to move it around.
    -   Select a tool and start drawing on the page.
    -   Use the editing tools to modify your drawings.
    -   Your drawings are saved as you make them, and will be restored if you reload the page.
    -   Click the extension icon again to deactivate the drawing tools.

## File Structure

-   `manifest.json`: The manifest file for the Chrome extension.
-   `index.html`: The main HTML file that contains the canvas.
-   `background.js`: The service worker for the extension.
-   `src/`: This directory contains the main JavaScript files for the application.
    -   `main.js`: Initializes the application and ties everything together.
    -   `ui.js`: Creates the toolbar and UI components.
    -   `canvas.js`: Handles the drawing on the canvas.
    -   `events.js`: Manages mouse and keyboard events.
    -   `state.js`: Contains the application's state.
    -   `screenshot.js`: Logic for taking screenshots.
-   `icons/`: Contains the icons for the extension.
-   `arrows.css`: Contains the styling for the application.
-   `arrows.js`: Contains logic for drawing arrows.
