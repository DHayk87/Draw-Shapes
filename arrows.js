(() => {
    if (window.__arrowController) {
        window.__arrowController.destroy();
        delete window.__arrowController;
        let style = "font-size:20px; color:#ff0000;";
        console.log("%c[ArrowPointer] Deactivated", style);
    } else {
        const CTRL = {
            isDrawing: false,
            currentTool: null,
            overlay: null,
            tools: null,
            canvas: null,
            ctx: null,
            color: "#c885ff",
            shapes: [],
            history: [],
            historyIndex: -1,
            currentCord: null,
            handleMouseDown: null,
            handleMouseMove: null,
            handleMouseUp: null,
            destroy() {
                try {
                    if (CTRL.canvas && CTRL.canvas.parentNode) CTRL.canvas.remove();
                    if (CTRL.overlay && CTRL.overlay.parentNode) CTRL.overlay.remove();
                    window.removeEventListener("mousedown", CTRL.handleMouseDown);
                    window.removeEventListener("mousemove", CTRL.handleMouseMove);
                    window.removeEventListener("mouseup", CTRL.handleMouseUp);
                    window.removeEventListener("keydown", CTRL.__keyHandler);
                } catch (e) {}
            },
        };

        const overlay = document.createElement("div");
        overlay.id = "overlay";
        CTRL.overlay = overlay;

        const tools = document.createElement("div");
        tools.id = "tools";
        tools.draggable = true;
        CTRL.tools = tools;

        const grabArea = document.createElement("div");
        grabArea.className = "grabArea";

        let svg = `
            <svg width="36" height="12" viewBox="0 0 36 12" xmlns="http://www.w3.org/2000/svg">
            <g fill="#666">`;
        for (let i = 2; i < 36; i += 4) {
            for (let j = 2; j <= 10; j += 4) {
                svg += `<circle cx="${i}" cy="${j}" r="1.5"/> `;
            }
        }

        svg += `</g></svg>`;
        grabArea.insertAdjacentHTML("afterbegin", svg);

        let offsetX = 0;
        let offsetY = 0;
        let isDraggingTools = false;

        grabArea.addEventListener("mousedown", (e) => {
            document.body.style.cursor = "grabbing";
            document.body.style.userSelect = "none";
            grabArea.style.cursor = "grabbing";
            isDraggingTools = true;
            const rect = tools.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            e.preventDefault();
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDraggingTools) return;
            tools.style.position = "absolute";
            tools.style.left = `${e.clientX - offsetX}px`;
            tools.style.top = `${e.clientY - offsetY}px`;
            tools.style.right = `auto`;
        });

        document.addEventListener("mouseup", () => {
            isDraggingTools = false;
            document.body.style.cursor = "";
            grabArea.style.cursor = "grab";
            document.body.style.userSelect = "";
            if (tools.style.position === "absolute") {
                CTRL.toolbarPos = { left: tools.style.left, top: tools.style.top };
                try {
                    localStorage.setItem(
                        "__arrow_toolbar_pos",
                        JSON.stringify(CTRL.toolbarPos)
                    );
                } catch (_) {}
            }
        });
        const cursorBtn = document.createElement("button");
        cursorBtn.textContent = "↖";
        cursorBtn.className = "cursorBtn";
        cursorBtn.title = "Cursor (do nothing)";
        cursorBtn.addEventListener("click", () => {
            CTRL.currentTool = null;
            updateToolStyles();
        });

        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.className = "colorInput";
        colorInput.title = "Color";
        colorInput.value = "#ff0000";
        CTRL.color = colorInput.value;
        colorInput.addEventListener("change", (e) => {
            CTRL.color = e.target.value;
        });

        const arrowBtn = document.createElement("button");
        arrowBtn.textContent = "⇨";
        arrowBtn.className = "arrowBtn";
        arrowBtn.title = "Arrow";
        arrowBtn.addEventListener("click", () => {
            CTRL.currentTool = CTRL.currentTool === "arrow" ? null : "arrow";
            updateToolStyles();
        });

        const rectangleBtn = document.createElement("button");
        rectangleBtn.textContent = "▭";
        rectangleBtn.className = "rectangleBtn";
        rectangleBtn.title = "Rectangle";
        rectangleBtn.addEventListener("click", () => {
            CTRL.currentTool = CTRL.currentTool === "rectangle" ? null : "rectangle";
            updateToolStyles();
        });

        const circleBtn = document.createElement("button");
        circleBtn.textContent = "◯";
        circleBtn.className = "circleBtn";
        circleBtn.title = "Circle";
        circleBtn.addEventListener("click", () => {
            CTRL.currentTool = CTRL.currentTool === "circle" ? null : "circle";
            updateToolStyles();
        });

        const textBtn = document.createElement("button");
        textBtn.textContent = "⊤";
        textBtn.className = "textBtn";
        textBtn.title = "Text";

        textBtn.addEventListener("click", () => {
            CTRL.currentTool = CTRL.currentTool === "text" ? null : "text";
            updateToolStyles();
        });

        const selectBtn = document.createElement("button");
        selectBtn.textContent = "✥";
        selectBtn.className = "selectBtn";
        selectBtn.title = "Select/Move";
        selectBtn.addEventListener("click", () => {
            CTRL.currentTool = CTRL.currentTool === "select" ? null : "select";
            updateToolStyles();
        });

        const eraserBtn = document.createElement("button");
        eraserBtn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z"/></svg>';
        eraserBtn.className = "eraserBtn";
        eraserBtn.title = "Eraser (click shape to delete)";
        eraserBtn.addEventListener("click", () => {
            CTRL.currentTool = CTRL.currentTool === "eraser" ? null : "eraser";
            updateToolStyles();
        });

        // persist color changes
        colorInput.addEventListener("input", () => {
            try {
                localStorage.setItem(
                    "__arrow_controls",
                    JSON.stringify({ color: CTRL.color })
                );
            } catch (_) {}
            if (CTRL.selectedIndex >= 0) {
                const s = CTRL.shapes[CTRL.selectedIndex];
                s.color = CTRL.color;
                saveToHistory();
                renderCanvas();
                try {
                    localStorage.setItem("__arrow_shapes", JSON.stringify(CTRL.shapes));
                } catch (_) {}
            }
        });

        const undoBtn = document.createElement("button");
        undoBtn.textContent = "↶";
        undoBtn.className = "undoBtn";
        undoBtn.title = "Undo (Ctrl+Z)";
        undoBtn.addEventListener("click", () => {
            undo();
        });

        const redoBtn = document.createElement("button");
        redoBtn.textContent = "↷";
        redoBtn.className = "redoBtn";
        redoBtn.title = "Redo (Ctrl+Y)";
        redoBtn.addEventListener("click", () => {
            redo();
        });

        const clearBtn = document.createElement("button");
        clearBtn.textContent = "🗑";
        clearBtn.className = "clearBtn";
        clearBtn.title = "Clear all (remove all shapes)";
        clearBtn.addEventListener("click", () => {
            CTRL.shapes = [];
            CTRL.selectedIndex = -1;
            saveToHistory();
            renderCanvas();
            try {
                localStorage.setItem("__arrow_shapes", JSON.stringify(CTRL.shapes));
            } catch (_) {}
        });

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "💾";
        saveBtn.className = "saveBtn";
        saveBtn.title = "Save as PNG";
        saveBtn.addEventListener("click", () => {
            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = "arrows.png";
            link.click();
        });

        tools.append(
            grabArea,
            cursorBtn,
            colorInput,
            arrowBtn,
            circleBtn,
            rectangleBtn,
            textBtn,
            selectBtn,
            eraserBtn,
            undoBtn,
            redoBtn,
            clearBtn,
            saveBtn
        );
        overlay.append(tools);
        document.body.append(overlay);

        const canvas = document.createElement("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.id = "__arrow-canvas";
        document.body.append(canvas);

        const ctx = canvas.getContext("2d");
        CTRL.canvas = canvas;
        CTRL.ctx = ctx;
        CTRL.shapes = [];
        CTRL.history = [];
        CTRL.historyIndex = -1;
        CTRL.lineWidth = 2;
        CTRL.selectedIndex = -1;
        CTRL.dragMode = null;
        CTRL.dragStart = null;
        CTRL.toolbarPos = null;
        CTRL.pixelRatio = Math.max(1, Math.floor(window.devicePixelRatio || 1));

        function persist(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (_) {}
        }
        function restore(key, fallback) {
            try {
                const v = localStorage.getItem(key);
                return v ? JSON.parse(v) : fallback;
            } catch (_) {
                return fallback;
            }
        }

        const MIN_DRAG_PX = 5;

        function resizeCanvas() {
            const ratio = Math.max(1, window.devicePixelRatio || 1);
            CTRL.pixelRatio = ratio;
            const w = window.innerWidth;
            const h = window.innerHeight;
            canvas.width = Math.floor(w * ratio);
            canvas.height = Math.floor(h * ratio);
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(ratio, ratio);
            renderCanvas();
        }

        window.addEventListener("resize", resizeCanvas);

        const restored = restore("__arrow_shapes", []);
        const restoredControls = restore("__arrow_controls", { color: CTRL.color });
        CTRL.shapes = Array.isArray(restored) ? restored : [];
        CTRL.color = restoredControls.color ?? CTRL.color;
        const restoredPos = restore("__arrow_toolbar_pos", null);
        if (restoredPos && restoredPos.left && restoredPos.top) {
            tools.style.position = "absolute";
            tools.style.left = restoredPos.left;
            tools.style.top = restoredPos.top;
            tools.style.right = "auto";
        }
        colorInput.value = CTRL.color;

        resizeCanvas();

        saveToHistory();

        function updateToolStyles() {
            const setBg = (el, active) => {
                if (!el) return;
                el.style.setProperty(
                    "background-color",
                    active ? "gray" : "white",
                    "important"
                );
            };
            setBg(cursorBtn, CTRL.currentTool === null);
            setBg(arrowBtn, CTRL.currentTool === "arrow");
            setBg(circleBtn, CTRL.currentTool === "circle");
            setBg(rectangleBtn, CTRL.currentTool === "rectangle");
            setBg(textBtn, CTRL.currentTool === "text");
            setBg(selectBtn, CTRL.currentTool === "select");
            setBg(eraserBtn, CTRL.currentTool === "eraser");

            if (CTRL.currentTool === "select") {
                document.body.style.cursor = "move";
            } else if (CTRL.currentTool === "eraser") {
                const url = chrome.runtime.getURL("./icons/eraser.png");
                document.body.style.cursor = `url("${url}") 8 8, auto`;
            } else if (CTRL.currentTool === "text") {
                document.body.style.cursor = "text";
            } else {
                document.body.style.cursor = "";
            }
        }

        function saveToHistory() {
            CTRL.history = CTRL.history.slice(0, CTRL.historyIndex + 1);

            CTRL.history.push(JSON.parse(JSON.stringify(CTRL.shapes)));
            CTRL.historyIndex++;

            if (CTRL.history.length > 50) {
                CTRL.history.shift();
                CTRL.historyIndex--;
            }

            updateUndoRedoButtons();
        }

        function undo() {
            if (CTRL.historyIndex > 0) {
                CTRL.historyIndex--;
                CTRL.shapes = JSON.parse(JSON.stringify(CTRL.history[CTRL.historyIndex]));
                renderCanvas();
                updateUndoRedoButtons();
            }
        }

        function redo() {
            if (CTRL.historyIndex < CTRL.history.length - 1) {
                CTRL.historyIndex++;
                CTRL.shapes = JSON.parse(JSON.stringify(CTRL.history[CTRL.historyIndex]));
                renderCanvas();
                updateUndoRedoButtons();
            }
        }

        function updateUndoRedoButtons() {
            undoBtn.disabled = CTRL.historyIndex <= 0;
            redoBtn.disabled = CTRL.historyIndex >= CTRL.history.length - 1;

            undoBtn.style.opacity = undoBtn.disabled ? "0.5" : "1";
            redoBtn.style.opacity = redoBtn.disabled ? "0.5" : "1";
        }

        function drawArrow({
            fromX,
            fromY,
            toX,
            toY,
            color,
            lineWidth = CTRL.lineWidth,
            rotation = 0,
        }) {
            const ctx = CTRL.ctx;
            ctx.save();

            if (rotation !== 0) {
                const centerX = (fromX + toX) / 2;
                const centerY = (fromY + toY) / 2;
                ctx.translate(centerX, centerY);
                ctx.rotate(rotation);
                ctx.translate(-centerX, -centerY);
            }

            const headLength = 10;
            const dx = toX - fromX;
            const dy = toY - fromY;
            const angle = Math.atan2(dy, dx);

            const lineEndX = toX - headLength * Math.cos(angle);
            const lineEndY = toY - headLength * Math.sin(angle);

            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(lineEndX, lineEndY);
            ctx.strokeStyle = "white";
            ctx.lineWidth = Math.max(1, lineWidth) + 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(lineEndX, lineEndY);
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1, lineWidth);
            ctx.stroke();

            const tipX = toX;
            const tipY = toY;
            const leftX = toX - headLength * Math.cos(angle - Math.PI / 6);
            const leftY = toY - headLength * Math.sin(angle - Math.PI / 6);
            const rightX = toX - headLength * Math.cos(angle + Math.PI / 6);
            const rightY = toY - headLength * Math.sin(angle + Math.PI / 6);

            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(leftX, leftY);
            ctx.lineTo(rightX, rightY);
            ctx.closePath();
            ctx.lineWidth = Math.max(1, lineWidth) + 2;
            ctx.strokeStyle = "white";
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(leftX, leftY);
            ctx.lineTo(rightX, rightY);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            ctx.restore();
        }

        function drawCircle({
            fromX,
            fromY,
            toX,
            toY,
            color,
            lineWidth = CTRL.lineWidth,
        }) {
            const ctx = CTRL.ctx;
            const centerX = (fromX + toX) / 2;
            const centerY = (fromY + toY) / 2;
            const radius = Math.abs(toX - fromX) / 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.strokeStyle = "white";
            ctx.fill();
            ctx.lineWidth = Math.max(1, lineWidth);
            ctx.stroke();
        }

        function drawRectangle({
            fromX,
            fromY,
            toX,
            toY,
            color,
            lineWidth = CTRL.lineWidth,
            rotation = 0,
        }) {
            const ctx = CTRL.ctx;
            ctx.save();

            if (rotation !== 0) {
                const centerX = (fromX + toX) / 2;
                const centerY = (fromY + toY) / 2;
                ctx.translate(centerX, centerY);
                ctx.rotate(rotation);
                ctx.translate(-centerX, -centerY);
            }

            const width = toX - fromX;
            const height = toY - fromY;
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.strokeStyle = "white";
            ctx.fillRect(fromX, fromY, width, height);
            ctx.lineWidth = Math.max(1, lineWidth);
            ctx.strokeRect(fromX, fromY, width, height);

            ctx.restore();
        }

        function drawText({
            x,
            y,
            color,
            text,
            lineWidth = CTRL.lineWidth,
            rotation = 0,
        }) {
            const ctx = CTRL.ctx;
            ctx.save();

            ctx.font = "20px Arial";
            ctx.textBaseline = "top";
            const metrics = ctx.measureText(text);
            const textWidth = metrics.width;
            const textHeight = 24;

            const centerX = x + textWidth / 2 + 6;
            const centerY = y - 14 + textHeight / 2;

            ctx.translate(centerX, centerY);
            ctx.rotate(rotation);
            ctx.translate(-centerX, -centerY);

            ctx.lineWidth = Math.max(1, lineWidth) + 2;
            ctx.strokeStyle = "white";
            ctx.strokeText(text, x + 6, y - 14);
            ctx.fillStyle = color;
            ctx.fillText(text, x + 6, y - 14);

            ctx.restore();
        }

        function renderCanvas() {
            const ctx = CTRL.ctx;
            const canvas = CTRL.canvas;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            CTRL.shapes.forEach((cord, idx) => {
                if (cord.type === "arrow") drawArrow(cord);
                else if (cord.type === "circle") drawCircle(cord);
                else if (cord.type === "rectangle") drawRectangle(cord);
                else if (cord.type === "text") drawText(cord);
                if (idx === CTRL.selectedIndex) drawSelectionOutline(cord);
            });
        }

        function drawSelectionOutline(shape) {
            const ctx = CTRL.ctx;
            ctx.save();
            ctx.setLineDash([4, 3]);
            ctx.strokeStyle = "#00aaff";
            ctx.lineWidth = 1;
            const bbox = getShapeBBox(shape);
            if (!bbox) {
                ctx.restore();
                return;
            }
            ctx.strokeRect(bbox.x, bbox.y, bbox.w, bbox.h);

            if (
                shape.type === "arrow" ||
                shape.type === "rectangle" ||
                shape.type === "text"
            ) {
                const centerX = bbox.x + bbox.w / 2;
                const centerY = bbox.y + bbox.h / 2;
                const handleY = bbox.y - 20;
                const handleX = centerX;

                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.moveTo(centerX, bbox.y);
                ctx.lineTo(handleX, handleY);
                ctx.stroke();

                ctx.beginPath();
                ctx.fillStyle = "#00aaff";
                ctx.arc(handleX, handleY, 8, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.strokeStyle = "white";
                ctx.lineWidth = 2;
                ctx.arc(handleX, handleY, 8, 0, Math.PI * 2);
                ctx.stroke();

                ctx.fillStyle = "white";
                ctx.font = "12px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("R", handleX, handleY);
            }

            ctx.restore();
        }

        function getShapeBBox(shape) {
            if (
                shape.type === "rectangle" ||
                shape.type === "circle" ||
                shape.type === "arrow"
            ) {
                const x = Math.min(shape.fromX, shape.toX);
                const y = Math.min(shape.fromY, shape.toY);
                const w = Math.abs(shape.toX - shape.fromX);
                const h = Math.abs(shape.toY - shape.fromY);
                return { x, y, w, h };
            }
            if (shape.type === "text") {
                const ctx = CTRL.ctx;
                ctx.font = "20px Arial";
                const width = ctx.measureText(shape.text || "").width;
                const x = shape.x;
                const y = shape.y - 14;
                const h = 24;
                const w = Math.max(10, width + 6);
                return { x, y, w, h };
            }
            return null;
        }

        function getShapeCenter(shape) {
            if (shape.type === "text") {
                const b = getShapeBBox(shape);
                return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
            }
            return {
                x: (shape.fromX + shape.toX) / 2,
                y: (shape.fromY + shape.toY) / 2,
            };
        }

        function isOnRotateHandle(shape, x, y) {
            if (
                shape.type !== "arrow" &&
                shape.type !== "rectangle" &&
                shape.type !== "text"
            ) {
                return false;
            }

            const bbox = getShapeBBox(shape);
            if (!bbox) return false;

            const centerX = bbox.x + bbox.w / 2;
            const handleY = bbox.y - 20;
            const handleX = centerX;
            const dx = x - handleX;
            const dy = y - handleY;
            const distance = dx * dx + dy * dy;
            const isHit = distance <= 64;

            console.log("Rotation handle check:", {
                shapeType: shape.type,
                clickPos: { x, y },
                handlePos: { x: handleX, y: handleY },
                distance: Math.sqrt(distance),
                isHit,
            });

            return isHit;
        }

        function distanceToSegment(px, py, x1, y1, x2, y2) {
            const A = px - x1;
            const B = py - y1;
            const C = x2 - x1;
            const D = y2 - y1;
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            let param = -1;
            if (lenSq !== 0) param = dot / lenSq;
            let xx, yy;
            if (param < 0) {
                xx = x1;
                yy = y1;
            } else if (param > 1) {
                xx = x2;
                yy = y2;
            } else {
                xx = x1 + param * C;
                yy = y1 + param * D;
            }
            const dx = px - xx;
            const dy = py - yy;
            return Math.sqrt(dx * dx + dy * dy);
        }

        function hitTest(x, y) {
            if (CTRL.selectedIndex >= 0) {
                const selectedShape = CTRL.shapes[CTRL.selectedIndex];
                if (isOnRotateHandle(selectedShape, x, y)) {
                    return CTRL.selectedIndex;
                }
            }

            for (let i = CTRL.shapes.length - 1; i >= 0; i--) {
                const s = CTRL.shapes[i];
                if (s.type === "rectangle" || s.type === "circle") {
                    const b = getShapeBBox(s);
                    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h)
                        return i;
                } else if (s.type === "arrow") {
                    const dist = distanceToSegment(x, y, s.fromX, s.fromY, s.toX, s.toY);
                    if (dist <= Math.max(6, (s.lineWidth || CTRL.lineWidth) + 4))
                        return i;
                } else if (s.type === "text") {
                    const b = getShapeBBox(s);
                    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h)
                        return i;
                }
            }
            return -1;
        }

        CTRL.handleMouseDown = (e) => {
            if (e.target.id !== "overlay" || !CTRL.currentTool) return;
            if (CTRL.currentTool === "select") {
                const idx = hitTest(e.clientX, e.clientY);
                console.log("Hit test result:", idx, "at", e.clientX, e.clientY);

                if (
                    idx >= 0 &&
                    CTRL.selectedIndex >= 0 &&
                    isOnRotateHandle(
                        CTRL.shapes[CTRL.selectedIndex],
                        e.clientX,
                        e.clientY
                    )
                ) {
                    console.log(
                        "Starting rotation for shape:",
                        CTRL.shapes[CTRL.selectedIndex].type
                    );
                    const s = CTRL.shapes[CTRL.selectedIndex];
                    const c = getShapeCenter(s);
                    CTRL.dragMode = "rotate";
                    CTRL.dragStart = {
                        x: e.clientX,
                        y: e.clientY,
                        centerX: c.x,
                        centerY: c.y,
                        startAngle: Math.atan2(e.clientY - c.y, e.clientX - c.x),
                        initialRotation: s.rotation || 0,
                    };
                } else {
                    CTRL.selectedIndex = idx;
                    CTRL.dragStart = idx >= 0 ? { x: e.clientX, y: e.clientY } : null;
                    CTRL.dragMode = idx >= 0 ? "move" : null;
                }
                renderCanvas();
                return;
            }
            if (CTRL.currentTool === "eraser") {
                const idx = hitTest(e.clientX, e.clientY);
                if (idx >= 0) {
                    CTRL.shapes.splice(idx, 1);
                    CTRL.selectedIndex = -1;
                    saveToHistory();
                    renderCanvas();
                    try {
                        localStorage.setItem(
                            "__arrow_shapes",
                            JSON.stringify(CTRL.shapes)
                        );
                    } catch (_) {}
                }
                return;
            }
            if (CTRL.currentTool !== "text") {
                CTRL.isDrawing = true;
                CTRL.currentCord = {
                    fromX: e.clientX,
                    fromY: e.clientY,
                    toX: e.clientX,
                    toY: e.clientY,
                    type: CTRL.currentTool,
                    color: CTRL.color,
                    lineWidth: CTRL.lineWidth,
                };
            }

            if (CTRL.currentTool === "text") {
                const x = e.clientX;
                const y = e.clientY;

                const input = document.createElement("input");
                input.type = "text";
                input.placeholder = "Write your text";
                input.style.position = "fixed";
                input.style.left = `${x}px`;
                input.style.top = `${y}px`;
                input.style.font = "20px Arial";
                input.style.padding = "2px 4px";
                input.style.border = "1px solid #ccc";
                input.style.borderRadius = "4px";
                input.style.zIndex = 10000;
                input.style.color = CTRL.color;
                input.style.background = "white";
                input.style.outline = "none";
                input.style.minWidth = "100px";

                overlay.appendChild(input);

                requestAnimationFrame(() => {
                    input.focus();

                    let submitted = false;

                    const submitText = () => {
                        if (submitted) return;
                        submitted = true;

                        const text = input.value.trim();
                        if (text) {
                            const textShape = {
                                type: "text",
                                x,
                                y: y + 20,
                                color: CTRL.color,
                                lineWidth: CTRL.lineWidth,
                                text,
                            };
                            CTRL.shapes.push(textShape);
                            saveToHistory();
                            renderCanvas();
                            try {
                                localStorage.setItem(
                                    "__arrow_shapes",
                                    JSON.stringify(CTRL.shapes)
                                );
                            } catch (_) {}
                        }
                        if (input.parentNode) input.remove();
                    };

                    input.addEventListener("keydown", (e) => {
                        e.stopImmediatePropagation();
                        if (e.key === "Enter") {
                            e.preventDefault();
                            submitText();
                        } else if (e.key === "Escape") {
                            e.preventDefault();
                            input.remove();
                        }
                    });

                    input.addEventListener("blur", () => {
                        submitText();
                    });
                });

                console.log(CTRL.shapes);
                return;
            }
        };

        CTRL.handleMouseMove = (e) => {
            if (CTRL.isDrawing && CTRL.currentCord) {
                CTRL.currentCord.toX = e.clientX;
                CTRL.currentCord.toY = e.clientY;
                CTRL.currentCord.color = CTRL.color;
                CTRL.currentCord.lineWidth = CTRL.lineWidth;
                renderCanvas();
                if (CTRL.currentTool === "arrow") drawArrow(CTRL.currentCord);
                else if (CTRL.currentTool === "circle") drawCircle(CTRL.currentCord);
                else if (CTRL.currentTool === "rectangle")
                    drawRectangle(CTRL.currentCord);
                else if (CTRL.currentTool === "text") drawText(CTRL.currentCord);
                return;
            }
            if (
                CTRL.currentTool === "select" &&
                CTRL.selectedIndex >= 0 &&
                CTRL.dragStart
            ) {
                const s = CTRL.shapes[CTRL.selectedIndex];
                if (CTRL.dragMode === "move") {
                    const dx = e.clientX - CTRL.dragStart.x;
                    const dy = e.clientY - CTRL.dragStart.y;
                    CTRL.dragStart = { x: e.clientX, y: e.clientY };
                    if (s.type === "rectangle" || s.type === "circle") {
                        s.fromX += dx;
                        s.toX += dx;
                        s.fromY += dy;
                        s.toY += dy;
                    } else if (s.type === "arrow") {
                        s.fromX += dx;
                        s.toX += dx;
                        s.fromY += dy;
                        s.toY += dy;
                    } else if (s.type === "text") {
                        s.x += dx;
                        s.y += dy;
                    }
                } else if (CTRL.dragMode === "rotate") {
                    const c = { x: CTRL.dragStart.centerX, y: CTRL.dragStart.centerY };
                    const angleNow = Math.atan2(e.clientY - c.y, e.clientX - c.x);
                    const delta = angleNow - CTRL.dragStart.startAngle;
                    s.rotation = CTRL.dragStart.initialRotation + delta;
                }
                renderCanvas();
            }
        };

        CTRL.handleMouseUp = (e) => {
            if (CTRL.isDrawing && CTRL.currentCord) {
                CTRL.isDrawing = false;
                CTRL.currentCord.toX = e.clientX;
                CTRL.currentCord.toY = e.clientY;
                const dx = CTRL.currentCord.toX - CTRL.currentCord.fromX;
                const dy = CTRL.currentCord.toY - CTRL.currentCord.fromY;
                const movedEnough =
                    Math.abs(dx) >= MIN_DRAG_PX || Math.abs(dy) >= MIN_DRAG_PX;
                if (movedEnough) {
                    CTRL.shapes.push({ ...CTRL.currentCord });
                    CTRL.currentCord = null;
                    saveToHistory();
                    renderCanvas();
                    try {
                        localStorage.setItem(
                            "__arrow_shapes",
                            JSON.stringify(CTRL.shapes)
                        );
                    } catch (_) {}
                } else {
                    CTRL.currentCord = null;
                    renderCanvas();
                }
                return;
            }
            if (
                CTRL.currentTool === "select" &&
                (CTRL.dragMode === "move" || CTRL.dragMode === "rotate")
            ) {
                CTRL.dragMode = null;
                CTRL.dragStart = null;
                saveToHistory();
                renderCanvas();
                try {
                    localStorage.setItem("__arrow_shapes", JSON.stringify(CTRL.shapes));
                } catch (_) {}
            }
            updateToolStyles();
        };

        window.addEventListener("mousedown", CTRL.handleMouseDown);
        window.addEventListener("mousemove", CTRL.handleMouseMove);
        window.addEventListener("mouseup", CTRL.handleMouseUp);

        CTRL.__keyHandler = (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === "z" && !e.shiftKey) {
                    e.preventDefault();
                    undo();
                } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
                    e.preventDefault();
                    redo();
                }
                persist("__arrow_shapes", CTRL.shapes);
            } else if (e.key === "Delete" || e.key === "Backspace") {
                if (CTRL.selectedIndex >= 0) {
                    CTRL.shapes.splice(CTRL.selectedIndex, 1);
                    CTRL.selectedIndex = -1;
                    saveToHistory();
                    renderCanvas();
                    persist("__arrow_shapes", CTRL.shapes);
                }
            }
        };
        window.addEventListener("keydown", CTRL.__keyHandler);

        window.__arrowController = CTRL;

        let style = "font-size:20px; color:#00ff00;";
        console.log("%c[ArrowPointer] Activated", style);
    }
})();
