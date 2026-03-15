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
        penBtn,
        highlighterBtn,
        curveBtn,
        polygonBtn,
        forwardBtn,
        backwardBtn;

    function updateToolStyles() {
        const setBg = (el, active) => {
            if (!el) return;
            el.style.setProperty(
                "background-color",
                active ? "gray" : "white",
                "important",
            );
        };
        setBg(cursorBtn, state.currentTool === null);
        setBg(arrowBtn, state.currentTool === "arrow");
        setBg(lineBtn, state.currentTool === "line");
        setBg(circleBtn, state.currentTool === "circle");
        setBg(rectangleBtn, state.currentTool === "rectangle");
        setBg(triangleBtn, state.currentTool === "triangle");
        setBg(textBtn, state.currentTool === "text");
        setBg(highlighterBtn, state.currentTool === "highlighter");
        setBg(selectBtn, state.currentTool === "select");
        setBg(eraserBtn, state.currentTool === "eraser");
        setBg(penBtn, state.currentTool === "pen");
        setBg(curveBtn, state.currentTool === "curve");
        setBg(polygonBtn, state.currentTool === "polygon");

        const shouldShowLayering =
            state.currentTool === "select" && state.selectedIndex >= 0;

        if (forwardBtn) {
            forwardBtn.style.display = shouldShowLayering ? "flex" : "none";
            forwardBtn.disabled = state.selectedIndex >= state.shapes.length - 1;
            forwardBtn.style.opacity = forwardBtn.disabled ? "0.3" : "1";
        }
        if (backwardBtn) {
            backwardBtn.style.display = shouldShowLayering ? "flex" : "none";
            backwardBtn.disabled = state.selectedIndex <= 0;
            backwardBtn.style.opacity = backwardBtn.disabled ? "0.3" : "1";
        }

        if (state.overlay) {
            state.overlay.style.pointerEvents = state.currentTool ? "auto" : "none";
        }
        if (state.canvas) {
            state.canvas.style.pointerEvents = state.currentTool ? "auto" : "none";
        }

        if (state.currentTool === "select") {
            document.body.style.cursor = "move";
        } else if (state.currentTool === "eraser") {
            try {
                if (chrome.runtime?.id) {
                    document.body.style.cursor = `url("${chrome.runtime.getURL(
                        "./icons/eraser.png",
                    )}") 8 8, auto`;
                }
            } catch (e) {
                document.body.style.cursor = "auto";
                console.warn("Could not set eraser cursor, context may be invalidated.");
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
        if (state.currentTool === "select" && newTool !== "select") {
            state.selectedIndex = -1;
            app.renderCanvas();
        }
        state.currentTool = state.currentTool === newTool ? null : newTool;
        updateToolStyles();
    }

    app.showNotification = function (message, duration = 3000) {
        const banner = document.createElement("div");
        banner.className = "___draw_it_notification-banner";
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

    app.showConfirm = function ({ title, message, onConfirm, onCancel }) {
        const overlay = document.createElement("div");
        overlay.className = "___draw_it_modal-overlay";

        const modal = document.createElement("div");
        modal.className = "___draw_it_modal-content";

        const h3 = document.createElement("h3");
        h3.textContent = title;

        const p = document.createElement("p");
        p.textContent = message;

        const actions = document.createElement("div");
        actions.className = "___draw_it_modal-actions";

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "___draw_it_modal-btn-cancel";
        cancelBtn.textContent = "Cancel";
        cancelBtn.onclick = () => {
            overlay.classList.add("closing");
            setTimeout(() => overlay.remove(), 200);
            if (onCancel) onCancel();
        };

        const confirmBtn = document.createElement("button");
        confirmBtn.className = "___draw_it_modal-btn-confirm";
        confirmBtn.textContent = "Clear All";
        confirmBtn.onclick = () => {
            overlay.classList.add("closing");
            setTimeout(() => overlay.remove(), 200);
            if (onConfirm) onConfirm();
        };

        actions.append(cancelBtn, confirmBtn);
        modal.append(h3, p, actions);
        overlay.append(modal);
        document.body.append(overlay);

        // Focus confirm for keyboard usability
        confirmBtn.focus();
    };

    function createSlider({ title, min, max, step, initialValue, onInput, onChange }) {
        const container = document.createElement("div");
        container.className = "___draw_it_slider-container";
        container.title = title;

        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = initialValue;

        const tooltip = document.createElement("div");
        tooltip.className = "___draw_it_slider-tooltip";
        tooltip.textContent = initialValue;

        const updateTooltip = () => {
            const value = slider.value;
            tooltip.textContent = value;
            const percent = (value - min) / (max - min);
            const thumbWidth = 14;
            const percentWidth = percent * 100;
            const offset = thumbWidth / 2 - thumbWidth * percent;
            tooltip.style.left = `calc(${percentWidth}% + ${offset}px)`;
        };

        slider.addEventListener("input", (e) => {
            updateTooltip();
            onInput(e);
        });
        slider.addEventListener("change", onChange);

        setTimeout(updateTooltip, 0);

        container.append(tooltip, slider);
        return { container, slider };
    }

    const ICONS = {
        cursor: '<svg viewBox="0 0 24 24"><path d="M7,2l12,11.2l-5.8,0.5l3.3,7.3l-2.2,1l-3.2-7.4L7,19V2z"/></svg>',
        arrow: '<svg viewBox="0 0 24 24"><path d="M16.01,11H4v2h12.01v3L20,12l-3.99-4V11z"/></svg>',
        line: '<svg viewBox="0 0 24 24"><path d="M21,13H3v-2h18V13z"/></svg>',
        circle: '<svg viewBox="0 0 24 24"><path d="M12,2C6.47,2,2,6.47,2,12s4.47,10,10,10s10-4.47,10-10S17.53,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8 S16.41,20,12,20z"/></svg>',
        rectangle:
            '<svg viewBox="0 0 24 24"><path d="M4,6v13h16V6H4z M18,17H6V8h12V17z"/></svg>',
        triangle:
            '<svg viewBox="0 0 24 24"><path d="M12,2L1,21h22L12,2z M12,6l7.53,13H4.47L12,6z"/></svg>',
        curve: '<svg viewBox="0 0 24 24"><path d="M4.17 17.5a1 1 0 0 1-.7-1.71 11 11 0 0 1 15.06 0 1 1 0 0 1-.69 1.71 11 11 0 0 0-13.67 0zM12 2a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"/></svg>',
        polygon:
            '<svg viewBox="0 0 24 24"><path d="M22,13.52V19a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V5A2,2,0,0,1,4,3H9.48a1,1,0,0,1,.71.29l2,2A1,1,0,0,0,12.9,5.58L16.32,9a1,1,0,0,0,.71.29H20a2,2,0,0,1,2,2s0,0.48,0,0.48a1,1,0,0,1,1,1v0.74A1,1,0,0,1,22,13.52Z"/></svg>',
        text: '<svg viewBox="0 0 24 24"><path d="M5,4v3h5.5v12h3V7H19V4H5z"/></svg>',
        highlighter:
            '<svg viewBox="0 0 24 24"><path d="M20.71,5.63l-2.34-2.34c-0.39-0.39-1.02-0.39-1.41,0l-3.12,3.12L12,5.12c-0.78-0.78-2.05-0.78-2.83,0l-7.07,7.07 c-0.78,0.78-0.78,2.05,0,2.83l2.12,2.12l-1.41,1.41l1.41,1.41l1.41-1.41l2.12,2.12c0.78,0.78,2.05,0.78,2.83,0l7.07-7.07 c0.78-0.78,0.78-2.05,0-2.83l-1.29-1.29l3.12-3.12C21.1,6.65,21.1,6.02,20.71,5.63z M11.29,17.88L6.34,12.93l2.12-2.12l4.95,4.95 L11.29,17.88z"/></svg>',
        pen: '<svg viewBox="0 0 24 24"><path d="M3,17.25V21h3.75L17.81,9.94l-3.75-3.75L3,17.25z M20.71,7.04c0.39-0.39,0.39-1.02,0-1.41l-2.34-2.34 c-0.39-0.39-1.02-0.39-1.41,0l-1.83,1.83l3.75,3.75L20.71,7.04z"/></svg>',
        select: '<svg viewBox="0 0 24 24"><path d="M13,5.5V11h5.5l-6.5,6.5L5.5,11H11V5.5L13,5.5z M13,2H11v3.5H5.5V11H2v2h3.5v5.5H11V22h2v-3.5h5.5V13H22v-2h-3.5V5.5H13V2z"/></svg>',
        undo: '<svg viewBox="0 0 24 24"><path d="M12.5,8C9.85,8,7.45,9,5.6,10.6L2,7v9h9l-3.38-3.38C8.95,11.53,10.63,11,12.5,11c3.54,0,6.55,2.31,7.6,5.5l2.37-0.78 C21.08,11.03,17.25,8,12.5,8z"/></svg>',
        redo: '<svg viewBox="0 0 24 24"><path d="M18.4,10.6C16.55,9,14.15,8,11.5,8c-4.75,0-8.58,3.03-9.97,7.22l2.37,0.78C4.95,12.81,7.96,10.5,11.5,10.5 c1.87,0,3.55,0.53,4.88,1.62L13,15.5h9V6.5L18.4,10.6z"/></svg>',
        clear: '<svg viewBox="0 0 24 24"><path d="M6,19c0,1.1,0.9,2,2,2h8c1.1,0,2-0.9,2-2V7H6V19z M19,4h-3.5l-1-1h-5l-1,1H5v2h14V4z"/></svg>',
        save: '<svg viewBox="0 0 24 24"><path d="M17,3H5C3.89,3,3,3.9,3,5v14c0,1.1,0.89,2,2,2h14c1.1,0,2-0.9,2-2V7L17,3z M12,19c-1.66,0-3-1.34-3-3s1.34-3,3-3s3,1.34,3,3 S13.66,19,12,19z M15,9H5V5h10V9z"/></svg>',
        screenshot:
            '<svg viewBox="0 0 24 24"><path d="M21,19V5c0-1.1-0.9-2-2-2H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14C20.1,21,21,20.1,21,19z M8.5,13.5l2.5,3.01L14.5,12l4.5,6H5 L8.5,13.5z"/></svg>',
        toFront:
            '<svg viewBox="0 0 24 24"><path d="M19 7h-8L11 3h8v4zm0 10h-8l0-4h8v4zM7 7H3V3h4v4zm0 10l-4 0v-4h4v4zM3 11h18v2H3v-2z" fill="currentColor"/></svg>',
        toBack: '<svg viewBox="0 0 24 24"><path d="M11 7h8L19 3h-8v4zm0 10h8l0-4h-8v4zM3 7h4V3H3v4zm0 10l4 0v-4H3v4zM3 11h18v2H3v-2z" opacity=".3" fill="currentColor"/></svg>',
        forward:
            '<svg viewBox="0 0 24 24"><path d="M5 9l1.41 1.41L11 5.83V22h2V5.83l4.59 4.59L19 9l-7-7-7 7z"/></svg>',
        backward:
            '<svg viewBox="0 0 24 24"><path d="M19 15l-1.41-1.41L13 18.17V2h-2v16.17l-4.59-4.59L5 15l7 7 7-7z"/></svg>',
    };

    app.createToolbar = function () {
        const overlay = document.createElement("div");
        overlay.id = "___draw_it_overlay";
        state.overlay = overlay;

        const tools = document.createElement("div");
        tools.id = "___draw_it_tools";
        state.tools = tools;

        const grabArea = document.createElement("div");
        grabArea.className = "___draw_it_grabArea";
        grabArea.innerHTML =
            '<div class="___draw_it_grabHandle"></div>' +
            '<span class="___draw_it_grabTitle">Shapes Drawer</span>';

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
        let rafId = null;
        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                const rect = tools.getBoundingClientRect();
                let left = e.clientX - offsetX;
                let top = e.clientY - offsetY;

                // Stay within viewport
                left = Math.max(0, Math.min(left, window.innerWidth - rect.width));
                top = Math.max(0, Math.min(top, window.innerHeight - rect.height));

                Object.assign(tools.style, {
                    position: "absolute",
                    left: `${left}px`,
                    top: `${top}px`,
                    right: "auto",
                });
                rafId = null;
            });
        });
        document.addEventListener("mouseup", () => {
            if (isDragging) {
                isDragging = false;
                state.toolbarPos = { left: tools.style.left, top: tools.style.top };
                app.persist("__arrow_toolbar_pos", state.toolbarPos);
            }
        });

        const createButton = (iconKey, title, className, onClick) => {
            const btn = document.createElement("button");
            btn.innerHTML = ICONS[iconKey];
            btn.title = title;
            btn.className = className;
            btn.addEventListener("click", onClick);
            return btn;
        };

        cursorBtn = createButton("cursor", "Cursor (V)", "___draw_it_cursorBtn", () =>
            setTool(null),
        );
        arrowBtn = createButton("arrow", "Arrow (A)", "___draw_it_arrowBtn", () =>
            setTool("arrow"),
        );
        lineBtn = createButton("line", "Line (L)", "___draw_it_lineBtn", () =>
            setTool("line"),
        );
        rectangleBtn = createButton(
            "rectangle",
            "Rectangle (R)",
            "___draw_it_rectangleBtn",
            () => setTool("rectangle"),
        );
        triangleBtn = createButton(
            "triangle",
            "Triangle (T)",
            "___draw_it_triangleBtn",
            () => setTool("triangle"),
        );
        circleBtn = createButton("circle", "Circle (C)", "___draw_it_circleBtn", () =>
            setTool("circle"),
        );
        textBtn = createButton("text", "Text (W)", "___draw_it_textBtn", () =>
            setTool("text"),
        );
        curveBtn = createButton("curve", "Curve (U)", "___draw_it_curveBtn", () =>
            setTool("curve"),
        );
        polygonBtn = createButton("polygon", "Polygon (N)", "___draw_it_polygonBtn", () =>
            setTool("polygon"),
        );
        forwardBtn = createButton(
            "forward",
            "Bring Forward (])",
            "___draw_it_forwardBtn",
            () => {
                app.moveShapeUp();
                app.saveToHistory();
                app.renderCanvas();
                updateToolStyles();
            },
        );
        backwardBtn = createButton(
            "backward",
            "Send Backward ([)",
            "___draw_it_backwardBtn",
            () => {
                app.moveShapeDown();
                app.saveToHistory();
                app.renderCanvas();
                updateToolStyles();
            },
        );
        penBtn = createButton("pen", "Pen (P)", "___draw_it_penBtn", () =>
            setTool("pen"),
        );
        highlighterBtn = createButton(
            "highlighter",
            "Highlighter (H)",
            "___draw_it_highlighterBtn",
            () => setTool("highlighter"),
        );
        selectBtn = createButton(
            "select",
            "Select/Move (M)",
            "___draw_it_selectBtn",
            () => setTool("select"),
        );

        eraserBtn = createButton("clear", "Eraser (E)", "___draw_it_eraserBtn", () =>
            setTool("eraser"),
        );
        eraserBtn.innerHTML =
            '<svg viewBox="0 0 24 24"><path d="M16.24,3.56L21.19,8.51c0.78,0.78,0.78,2.05,0,2.83l-8.48,8.48c-0.78,0.78-2.05,0.78-2.83,0l-4.95-4.95 c-0.78-0.78-0.78-2.05,0-2.83l8.48-8.48C14.19,2.78,15.46,2.78,16.24,3.56z M7.06,14.88l4.95,4.95L19.07,12.8l-4.95-4.95L7.06,14.88z"/></svg>';

        undoBtn = createButton("undo", "Undo (Ctrl+Z)", "___draw_it_undoBtn", () => {
            app.undo();
            app.renderCanvas();
            updateUndoRedoButtons();
        });
        redoBtn = createButton("redo", "Redo (Ctrl+Y)", "___draw_it_redoBtn", () => {
            app.redo();
            app.renderCanvas();
            updateUndoRedoButtons();
        });

        const clearBtn = createButton(
            "clear",
            "Clear all (D)",
            "___draw_it_clearBtn",
            () => {
                app.showConfirm({
                    title: "Clear Canvas?",
                    message: "This will permanently delete all your drawings.",
                    onConfirm: () => {
                        state.shapes = [];
                        state.selectedIndex = -1;
                        app.saveToHistory();
                        app.renderCanvas();
                        app.persist("__arrow_shapes", []);
                    },
                });
            },
        );
        const saveBtn = createButton(
            "save",
            "Save as PNG (S)",
            "___draw_it_saveBtn",
            () => {
                const img = state.canvas.toDataURL("image/png");
                const a = document.createElement("a");
                a.href = img;
                a.download = "drawing.png";
                a.click();
            },
        );

        const screenShotBtn = createButton(
            "screenshot",
            "Take Screenshot",
            "___draw_it_screenShot",
            () => {
                if (state.loadingNotification) return;
                state.loadingNotification = app.showNotification("Capturing...", null);
                try {
                    chrome.runtime.sendMessage({ action: "capture" }, (r) => {
                        if (chrome.runtime.lastError) {
                            app.captureWithGetDisplayMedia();
                        }
                    });
                } catch (e) {
                    app.captureWithGetDisplayMedia();
                }
            },
        );

        const colorPickerContainer = document.createElement("div");
        colorPickerContainer.className = "___draw_it_colorPickerContainer";
        colorPickerContainer.title = "Colors (X to swap)";

        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.className = "___draw_it_colorInput ___draw_it_primaryColor";
        colorInput.title = "Primary Color";
        colorInput.value = state.color;
        colorInput.addEventListener("input", (e) => {
            state.color = e.target.value;
            app.persist("__arrow_controls", {
                color: state.color,
                secondaryColor: state.secondaryColor,
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

        const secondaryColorInput = document.createElement("input");
        secondaryColorInput.type = "color";
        secondaryColorInput.className = "___draw_it_colorInput ___draw_it_secondaryColor";
        secondaryColorInput.title = "Secondary Color";
        secondaryColorInput.value = state.secondaryColor;
        secondaryColorInput.addEventListener("input", (e) => {
            state.secondaryColor = e.target.value;
            app.persist("__arrow_controls", {
                color: state.color,
                secondaryColor: state.secondaryColor,
                lineWidth: state.lineWidth,
                opacity: state.opacity,
            });
        });

        const swapBtn = document.createElement("button");
        swapBtn.className = "___draw_it_swapColorsBtn";
        swapBtn.title = "Swap Colors (X)";
        swapBtn.innerHTML =
            '<svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H9.5l4 4 3.5-.5zm-10 3V17c0 .55.45 1 1 1h6.5l-4-4-3.5.5z"/></svg>';

        swapBtn.addEventListener("click", () => {
            const temp = state.color;
            state.color = state.secondaryColor;
            state.secondaryColor = temp;
            colorInput.value = state.color;
            secondaryColorInput.value = state.secondaryColor;

            app.persist("__arrow_controls", {
                color: state.color,
                secondaryColor: state.secondaryColor,
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

        colorPickerContainer.append(secondaryColorInput, colorInput, swapBtn);

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
                    secondaryColor: state.secondaryColor,
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
                    secondaryColor: state.secondaryColor,
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

        tools.append(
            grabArea,
            cursorBtn,
            colorPickerContainer,
            lineWidthContainer,
            opacityContainer,
            penBtn,
            highlighterBtn,
            lineBtn,
            arrowBtn,
            circleBtn,
            rectangleBtn,
            triangleBtn,
            textBtn,
            curveBtn,
            polygonBtn,
            forwardBtn,
            backwardBtn,
            selectBtn,
            eraserBtn,
            clearBtn,
            undoBtn,
            redoBtn,
            saveBtn,
            screenShotBtn,
        );
        overlay.append(tools);
        document.body.append(overlay);

        updateToolStyles();
        updateUndoRedoButtons();
        app.updateUndoRedoButtons = updateUndoRedoButtons;
        app.updateToolStyles = updateToolStyles;

        return { tools, colorInput, secondaryColorInput, lineWidthSlider, opacitySlider };
    };
})();
