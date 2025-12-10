// src/ui.js
(function () {
    const app = window.drawingApp;
    const state = app.state;
    let cursorBtn,
        arrowBtn,
        lineBtn,
        circleBtn,
        rectangleBtn,
        triangleBtn,
        textBtn,
        selectBtn,
        eraserBtn,
        undoBtn,
        redoBtn,
        penBtn;

    function updateToolStyles() {
        const setBg = (el, active) =>
            el.style.setProperty(
                "background-color",
                active ? "gray" : "white",
                "important"
            );
        setBg(cursorBtn, state.currentTool === null);
        setBg(arrowBtn, state.currentTool === "arrow");
        setBg(lineBtn, state.currentTool === "line");
        setBg(circleBtn, state.currentTool === "circle");
        setBg(rectangleBtn, state.currentTool === "rectangle");
        setBg(triangleBtn, state.currentTool === "triangle");
        setBg(textBtn, state.currentTool === "text");
        setBg(selectBtn, state.currentTool === "select");
        setBg(eraserBtn, state.currentTool === "eraser");
        setBg(penBtn, state.currentTool === "pen");

        if (state.currentTool === "select") {
            document.body.style.cursor = "move";
        } else if (state.currentTool === "eraser") {
            try {
                // This can fail if the extension context is invalidated
                if (chrome.runtime?.id) {
                    document.body.style.cursor = `url("${chrome.runtime.getURL(
                        "./icons/eraser.png"
                    )}") 8 8, auto`;
                }
            } catch (e) {
                document.body.style.cursor = "auto";
                console.warn(
                    "Could not set eraser cursor, context may be invalidated."
                );
            }
        } else if (state.currentTool === "text") {
            document.body.style.cursor = "text";
        } else {
            document.body.style.cursor = "";
        }
    }

    function updateUndoRedoButtons() {
        undoBtn.disabled = state.historyIndex <= 0;
        redoBtn.disabled = state.historyIndex >= state.history.length - 1;
        undoBtn.style.opacity = undoBtn.disabled ? "0.5" : "1";
        redoBtn.style.opacity = redoBtn.disabled ? "0.5" : "1";
    }

    function setTool(newTool) {
        // If switching away from select tool, clear the selection
        if (state.currentTool === 'select' && newTool !== 'select') {
            state.selectedIndex = -1;
            app.renderCanvas();
        }
        state.currentTool = state.currentTool === newTool ? null : newTool;
        updateToolStyles();
    }

    app.showNotification = function (message, duration = 3000) {
        const banner = document.createElement("div");
        banner.className = "notification-banner";
        banner.textContent = message;
        document.body.appendChild(banner);

        if (duration !== null) {
            setTimeout(() => app.hideNotification(banner), duration);
        } else {
            banner.classList.add("persistent");
        }
        return banner;
    };

    app.hideNotification = function (banner) {
        if (banner && banner.parentNode) {
            banner.remove();
        }
    };

    function createSlider({ title, min, max, step, initialValue, onInput, onChange }) {
        const container = document.createElement("div");
        container.className = "slider-container";
        container.title = title;

        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = initialValue;

        const tooltip = document.createElement("div");
        tooltip.className = "slider-tooltip";
        tooltip.textContent = initialValue;

        const updateTooltip = () => {
            const value = slider.value;
            tooltip.textContent = value;
            const percent = (value - min) / (max - min);
            const thumbWidth = 18; // From CSS
            const trackWidth = slider.offsetWidth - thumbWidth;
            const offset = thumbWidth / 2 - thumbWidth * percent;
            tooltip.style.left = `${Math.round(trackWidth * percent) + offset}px`;
        };

        slider.addEventListener("input", (e) => {
            updateTooltip();
            onInput(e);
        });
        slider.addEventListener("change", onChange);

        // Initial position
        setTimeout(updateTooltip, 0);

        container.append(tooltip, slider);
        return { container, slider };
    }

    app.createToolbar = function () {
        const overlay = document.createElement("div");
        overlay.id = "overlay";
        state.overlay = overlay;
        // ... (grabArea and button creation logic remains the same)
        const grabArea = document.createElement("div");
        grabArea.className = "grabArea";
        grabArea.insertAdjacentHTML(
            "afterbegin",
            '<svg width="36" height="12" viewBox="0 0 36 12" xmlns="http://www.w3.org/2000/svg"><g fill="#666">' +
                [...Array(9)]
                    .flatMap((_, i) =>
                        [...Array(3)].map(
                            (_, j) =>
                                `<circle cx="${i * 4 + 2}" cy="${j * 4 + 2}" r="1.5"/>`
                        )
                    )
                    .join("") +
                "</g></svg>"
        );

        let offsetX = 0,
            offsetY = 0,
            isDragging = false;
        grabArea.addEventListener("mousedown", (e) => {
            isDragging = true;
            const rect = tools.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            e.preventDefault();
        });
        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            Object.assign(tools.style, {
                position: "absolute",
                left: `${e.clientX - offsetX}px`,
                top: `${e.clientY - offsetY}px`,
                right: "auto",
            });
        });
        document.addEventListener("mouseup", () => {
            if (isDragging) {
                isDragging = false;
                state.toolbarPos = { left: tools.style.left, top: tools.style.top };
                app.persist("__arrow_toolbar_pos", state.toolbarPos);
            }
        });

        const createButton = (text, title, className, onClick) => {
            const btn = document.createElement("button");
            btn.innerHTML = text;
            btn.title = title;
            btn.className = className;
            btn.addEventListener("click", onClick);
            return btn;
        };

        cursorBtn = createButton("↖", "Cursor", "cursorBtn", () => setTool(null));
        arrowBtn = createButton("⇨", "Arrow", "arrowBtn", () => {
            state.currentTool = state.currentTool === "arrow" ? null : "arrow";
            updateToolStyles();
        });
        lineBtn = createButton("—", "Line", "lineBtn", () => {
            state.currentTool = state.currentTool === "line" ? null : "line";
            updateToolStyles();
        });
        rectangleBtn = createButton("▭", "Rectangle", "rectangleBtn", () => {
            state.currentTool = state.currentTool === "rectangle" ? null : "rectangle";
            updateToolStyles();
        });
        triangleBtn = createButton("△", "Triangle", "triangleBtn", () => {
            state.currentTool = state.currentTool === "triangle" ? null : "triangle";
            updateToolStyles();
        });
        circleBtn = createButton("◯", "Circle", "circleBtn", () => {
            state.currentTool = state.currentTool === "circle" ? null : "circle";
            updateToolStyles();
        });
        textBtn = createButton("⊤", "Text", "textBtn", () => {
            state.currentTool = state.currentTool === "text" ? null : "text";
            updateToolStyles();
        });
        penBtn = createButton("🖊️", "Pen", "penBtn", () => {
            state.currentTool = state.currentTool === "pen" ? null : "pen";
            updateToolStyles();
        });
        selectBtn = createButton("✥", "Select/Move", "selectBtn", () => {
            state.currentTool = state.currentTool === "select" ? null : "select";
            updateToolStyles();
        });
        eraserBtn = createButton(
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z"/></svg>',
            "Eraser",
            "eraserBtn",
            () => {
                state.currentTool = state.currentTool === "eraser" ? null : "eraser";
                updateToolStyles();
            }
        );
        undoBtn = createButton("↶", "Undo (Ctrl+Z)", "undoBtn", () => {
            app.undo();
            app.renderCanvas();
            updateUndoRedoButtons();
        });
        redoBtn = createButton("↷", "Redo (Ctrl+Y)", "redoBtn", () => {
            app.redo();
            app.renderCanvas();
            updateUndoRedoButtons();
        });
        const clearBtn = createButton("🗑", "Clear all", "clearBtn", () => {
            state.shapes = [];
            state.selectedIndex = -1;
            app.saveToHistory();
            app.renderCanvas();
            app.persist("__arrow_shapes", []);
        });
        const saveBtn = createButton("💾", "Save as PNG", "saveBtn", () => {
            const img = state.canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = img;
            a.download = "arrows.png";
            a.click();
        });
        const screenShotBtn = createButton(
            "⎙",
            "Take a Screen Shot",
            "screenShot",
            () => {
                if (state.loadingNotification) return;
                state.loadingNotification = app.showNotification("Capturing...", null);
                try {
                    chrome.runtime.sendMessage({ action: "capture" }, (r) => {
                        if (chrome.runtime.lastError) {
                            console.log(
                                "Extension API failed, using fallback.",
                                chrome.runtime.lastError.message
                            );
                            app.captureWithGetDisplayMedia();
                        }
                    });
                } catch (e) {
                    console.log("Extension API not available, using fallback.", e);
                    app.captureWithGetDisplayMedia();
                }
            }
        );

        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.className = "colorInput";
        colorInput.title = "Color";
        colorInput.value = state.color;
        colorInput.addEventListener("change", (e) => {
            state.color = e.target.value;
        });
        colorInput.addEventListener("input", () => {
            app.persist("__arrow_controls", {
                color: state.color,
                lineWidth: state.lineWidth,
                opacity: state.opacity,
            });
            if (state.selectedIndex >= 0) {
                state.shapes[state.selectedIndex].color = state.color;
                app.saveToHistory();
                app.renderCanvas();
                app.persist("__arrow_shapes", state.shapes);
            }
        });

        const { container: lineWidthContainer, slider: lineWidthSlider } = createSlider({
            title: "Line Width",
            min: 1,
            max: 20,
            step: 1,
            initialValue: state.lineWidth,
            onInput: (e) => {
                state.lineWidth = parseInt(e.target.value, 10);
                app.persist("__arrow_controls", {
                    color: state.color,
                    lineWidth: state.lineWidth,
                    opacity: state.opacity,
                });
                if (state.selectedIndex >= 0) {
                    state.shapes[state.selectedIndex].lineWidth = state.lineWidth;
                    app.renderCanvas();
                }
            },
            onChange: () => {
                if (state.selectedIndex >= 0) {
                    app.saveToHistory();
                    app.persist("__arrow_shapes", state.shapes);
                }
            },
        });

        const { container: opacityContainer, slider: opacitySlider } = createSlider({
            title: "Opacity",
            min: 0,
            max: 1,
            step: 0.05,
            initialValue: state.opacity,
            onInput: (e) => {
                state.opacity = parseFloat(e.target.value);
                app.persist("__arrow_controls", {
                    color: state.color,
                    lineWidth: state.lineWidth,
                    opacity: state.opacity,
                });
                if (state.selectedIndex >= 0) {
                    state.shapes[state.selectedIndex].opacity = state.opacity;
                    app.renderCanvas();
                }
            },
            onChange: () => {
                if (state.selectedIndex >= 0) {
                    app.saveToHistory();
                    app.persist("__arrow_shapes", state.shapes);
                }
            },
        });
        const tools = document.createElement("div");
        tools.id = "tools";
        state.tools = tools;

        tools.append(
            grabArea,
            cursorBtn,
            colorInput,
            lineWidthContainer,
            opacityContainer,
            penBtn,
            lineBtn,
            arrowBtn,
            circleBtn,
            rectangleBtn,
            triangleBtn,
            textBtn,
            selectBtn,
            eraserBtn,
            clearBtn,
            undoBtn,
            redoBtn,
            saveBtn,
            screenShotBtn
        );
        overlay.append(tools);
        document.body.append(overlay);

        updateToolStyles();
        updateUndoRedoButtons();
        app.updateUndoRedoButtons = updateUndoRedoButtons;

        return { tools, colorInput, lineWidthSlider, opacitySlider };
    };
})();
