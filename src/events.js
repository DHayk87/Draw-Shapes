(function () {
    const app = window.drawingApp;
    const state = app.state;
    const MIN_DRAG_PX = 5;
    let rafId = null;

    function drawLoop() {
        app.renderCanvas();
        if (state.isDrawing) {
            app.drawCurrentShape();
        }
        rafId = requestAnimationFrame(drawLoop);
    }

    function startLoop() {
        if (!rafId) {
            rafId = requestAnimationFrame(drawLoop);
        }
    }

    function stopLoop() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    function distanceToSegment(px, py, x1, y1, x2, y2) {
        const A = px - x1,
            B = py - y1,
            C = x2 - x1,
            D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = lenSq === 0 ? -1 : dot / lenSq;
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
        const dx = px - xx,
            dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function getShapeCenter(shape) {
        if (shape.type === "text") {
            const b = app.getShapeBBox(shape);
            return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
        }
        return { x: (shape.fromX + shape.toX) / 2, y: (shape.fromY + shape.toY) / 2 };
    }

    function isOnRotateHandle(shape, x, y) {
        if (
            shape.type !== "arrow" &&
            shape.type !== "rectangle" &&
            shape.type !== "text" &&
            shape.type !== "triangle"
        )
            return false;
        const bbox = app.getShapeBBox(shape);
        if (!bbox) return false;
        const handleX = bbox.x + bbox.w / 2,
            handleY = bbox.y - 20;
        const dx = x - handleX,
            dy = y - handleY;
        return dx * dx + dy * dy <= 64;
    }

    function hitTest(x, y) {
        if (
            state.selectedIndex >= 0 &&
            isOnRotateHandle(state.shapes[state.selectedIndex], x, y)
        ) {
            return state.selectedIndex;
        }
        for (let i = state.shapes.length - 1; i >= 0; i--) {
            const s = state.shapes[i];
            const b = app.getShapeBBox(s);
            if (!b) continue;
            if (
                s.type === "rectangle" ||
                s.type === "circle" ||
                s.type === "text" ||
                s.type === "pen" ||
                s.type === "triangle" ||
                s.type === "curve"
            ) {
                if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return i;
            } else if (s.type === "arrow" || s.type === "line") {
                return i;
            }
        }
        return -1;
    }

    app.handleMouseDown = (e) => {
        if (!state.currentTool) return;

        // Don't start drawing if clicking on buttons or sliders
        if (
            e.target.closest("#tools") ||
            e.target.closest(".slider-container") ||
            e.target.closest(".notification-banner")
        ) {
            return;
        }

        if (state.currentTool === "select") {
            const idx = hitTest(e.clientX, e.clientY);
            if (
                idx >= 0 &&
                state.selectedIndex === idx &&
                isOnRotateHandle(state.shapes[idx], e.clientX, e.clientY)
            ) {
                const s = state.shapes[idx],
                    c = getShapeCenter(s);
                state.dragMode = "rotate";
                state.dragStart = {
                    x: e.clientX,
                    y: e.clientY,
                    centerX: c.x,
                    centerY: c.y,
                    startAngle: Math.atan2(e.clientY - c.y, e.clientX - c.x),
                    initialRotation: s.rotation || 0,
                };
            } else {
                state.selectedIndex = idx;
                state.dragStart = idx >= 0 ? { x: e.clientX, y: e.clientY } : null;
                state.dragMode = idx >= 0 ? "move" : null;
            }
            if (state.dragMode) startLoop();
            else app.renderCanvas();
            if (typeof app.updateToolStyles === "function") app.updateToolStyles();
            return;
        }

        if (state.currentTool === "eraser") {
            const idx = hitTest(e.clientX, e.clientY);
            if (idx >= 0) {
                state.shapes.splice(idx, 1);
                state.selectedIndex = -1;
                app.saveToHistory();
                app.renderCanvas();
                app.persist("__arrow_shapes", state.shapes);
            }
            return;
        }

        if (state.currentTool === "text") {
            e.preventDefault();
            e.stopPropagation();

            setTimeout(() => {
                const x = e.clientX,
                    y = e.clientY;
                const input = document.createElement("input");
                Object.assign(input, { type: "text", placeholder: "Write text" });
                Object.assign(input.style, {
                    position: "fixed",
                    left: `${x}px`,
                    top: `${y}px`,
                    font: "20px Arial",
                    zIndex: 10000000,
                    color: "black",
                    background: "white",
                    border: "1px solid #ccc",
                    padding: "4px",
                    outline: "none",
                });
                document.body.appendChild(input);
                input.focus();
                let isCleaningUp = false;
                const cleanup = () => {
                    if (isCleaningUp) return;
                    isCleaningUp = true;
                    if (input.parentNode) {
                        input.remove();
                    }
                };

                const submit = () => {
                    const text = input.value.trim();
                    if (text) {
                        state.shapes.push({
                            type: "text",
                            x,
                            y: y + 20,
                            color: state.color,
                            lineWidth: state.lineWidth,
                            opacity: state.opacity,
                            text,
                        });
                        app.saveToHistory();
                        app.renderCanvas();
                        app.persist("__arrow_shapes", state.shapes);
                    }
                    cleanup();
                };

                input.onkeydown = (ev) => {
                    ev.stopImmediatePropagation();
                    if (ev.key === "Enter") {
                        submit();
                    } else if (ev.key === "Escape") {
                        cleanup();
                    }
                };
                input.onblur = submit;
            }, 0);
            return;
        }

        if (state.currentTool === "curve") {
            if (state.curveStage === 1) {
                // Finish stage 2
                state.isDrawing = false;
                state.curveStage = 0;
                state.shapes.push({ ...state.currentCord });
                state.currentCord = null;
                app.saveToHistory();
                app.renderCanvas();
                app.persist("__arrow_shapes", state.shapes);
                stopLoop();
                return;
            }
            state.isDrawing = true;
            state.curveStage = 0; // Stage 0: defining Start/End
            state.currentCord = {
                type: "curve",
                fromX: e.clientX,
                fromY: e.clientY,
                toX: e.clientX,
                toY: e.clientY,
                controlX: e.clientX,
                controlY: e.clientY,
                color: state.color,
                lineWidth: state.lineWidth,
                opacity: state.opacity,
            };
        } else if (state.currentTool === "polygon") {
            const x = e.clientX;
            const y = e.clientY;
            if (state.isDrawing && state.currentCord?.type === "polygon") {
                // Check if clicking near the first point to close
                const p0 = state.currentCord.points[0];
                const distSq = (x - p0.x) ** 2 + (y - p0.y) ** 2;
                if (distSq < 100) {
                    // 10px radius
                    app.handleDblClick(e);
                    return;
                }
                // Otherwise add a point
                state.currentCord.points[state.currentCord.points.length - 1] = { x, y };
                state.currentCord.points.push({ x, y }); // New preview point
                return;
            }
            state.isDrawing = true;
            state.currentCord = {
                type: "polygon",
                points: [
                    { x, y },
                    { x, y },
                ], // Initial point and preview point
                color: state.color,
                lineWidth: state.lineWidth,
                opacity: state.opacity,
                isClosed: false,
            };
        } else {
            state.isDrawing = true;
            if (state.currentTool === "pen" || state.currentTool === "highlighter") {
                state.currentCord = {
                    type: state.currentTool,
                    points: [{ x: e.clientX, y: e.clientY }],
                    color: state.color,
                    lineWidth: state.currentTool === "highlighter" ? 20 : state.lineWidth,
                    opacity: state.currentTool === "highlighter" ? 0.4 : state.opacity,
                };
            } else {
                state.currentCord = {
                    fromX: e.clientX,
                    fromY: e.clientY,
                    toX: e.clientX,
                    toY: e.clientY,
                    type: state.currentTool,
                    color: state.color,
                    lineWidth: state.lineWidth,
                    opacity: state.opacity,
                };
            }
        }
        startLoop();
    };

    app.handleMouseMove = (e) => {
        if (state.isDrawing && state.currentCord) {
            if (state.currentTool === "pen" || state.currentTool === "highlighter") {
                state.currentCord.points.push({ x: e.clientX, y: e.clientY });
            } else if (state.currentTool === "curve") {
                if (state.curveStage === 1) {
                    state.currentCord.controlX = e.clientX;
                    state.currentCord.controlY = e.clientY;
                } else {
                    state.currentCord.toX = e.clientX;
                    state.currentCord.toY = e.clientY;
                    // Keep control point at center during stage 0
                    state.currentCord.controlX =
                        (state.currentCord.fromX + e.clientX) / 2;
                    state.currentCord.controlY =
                        (state.currentCord.fromY + e.clientY) / 2;
                }
            } else if (state.currentTool === "polygon") {
                state.currentCord.points[state.currentCord.points.length - 1] = {
                    x: e.clientX,
                    y: e.clientY,
                };
            } else {
                state.currentCord.toX = e.clientX;
                state.currentCord.toY = e.clientY;
            }
            if (state.currentCord.type !== "highlighter") {
                state.currentCord.lineWidth = state.lineWidth;
                state.currentCord.opacity = state.opacity;
            }
            return;
        }

        if (
            state.currentTool === "select" &&
            state.selectedIndex >= 0 &&
            state.dragStart
        ) {
            const s = state.shapes[state.selectedIndex];
            if (state.dragMode === "move") {
                const dx = e.clientX - state.dragStart.x,
                    dy = e.clientY - state.dragStart.y;
                state.dragStart = { x: e.clientX, y: e.clientY };
                if (s.type === "text") {
                    s.x += dx;
                    s.y += dy;
                } else if (s.type === "pen" || s.type === "highlighter") {
                    for (const point of s.points) {
                        point.x += dx;
                        point.y += dy;
                    }
                } else if (s.type === "curve") {
                    s.fromX += dx;
                    s.toX += dx;
                    s.fromY += dy;
                    s.toY += dy;
                    s.controlX += dx;
                    s.controlY += dy;
                } else {
                    s.fromX += dx;
                    s.toX += dx;
                    s.fromY += dy;
                    s.toY += dy;
                }
            } else if (state.dragMode === "rotate") {
                const c = { x: state.dragStart.centerX, y: state.dragStart.centerY };
                const angleNow = Math.atan2(e.clientY - c.y, e.clientX - c.x);
                s.rotation =
                    state.dragStart.initialRotation +
                    angleNow -
                    state.dragStart.startAngle;
            }
        }
    };

    app.handleMouseUp = (e) => {
        if (state.isDrawing && state.currentCord) {
            if (state.currentTool === "curve") {
                if (state.curveStage === 0) {
                    const { fromX, fromY, toX, toY } = state.currentCord;
                    if (
                        Math.abs(toX - fromX) >= MIN_DRAG_PX ||
                        Math.abs(toY - fromY) >= MIN_DRAG_PX
                    ) {
                        state.curveStage = 1; // Move to Stage 1: defining Control Point
                        // Keep loop running for preview
                        return;
                    } else {
                        state.isDrawing = false;
                        state.currentCord = null;
                        stopLoop();
                    }
                }
                return;
            } else if (state.currentTool === "polygon") {
                // Polygons stay in drawing mode until closed or double-clicked
                return;
            }

            stopLoop();
            state.isDrawing = false;
            if (state.currentTool === "pen" || state.currentTool === "highlighter") {
                if (state.currentCord.points.length > 1) {
                    state.shapes.push({ ...state.currentCord });
                    app.saveToHistory();
                    app.persist("__arrow_shapes", state.shapes);
                }
            } else if (state.currentTool === "curve") {
                // Handled above for transition
                return;
            } else {
                const { fromX, fromY, toX, toY } = state.currentCord;
                if (
                    Math.abs(toX - fromX) >= MIN_DRAG_PX ||
                    Math.abs(toY - fromY) >= MIN_DRAG_PX
                ) {
                    state.shapes.push({ ...state.currentCord });
                    app.saveToHistory();
                    app.persist("__arrow_shapes", state.shapes);
                }
            }
            state.currentCord = null;
            app.renderCanvas();
            return;
        }

        if (state.currentTool === "select" && state.dragMode) {
            stopLoop();
            state.dragMode = null;
            state.dragStart = null;
            app.saveToHistory();
            app.persist("__arrow_shapes", state.shapes);
            app.renderCanvas();
        }
    };

    app.keydownHandler = (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === "z") {
                e.preventDefault();
                (e.shiftKey ? app.redo : app.undo)();
                app.renderCanvas();
                app.persist("__arrow_shapes", state.shapes);
            } else if (e.key === "y") {
                e.preventDefault();
                app.redo();
                app.renderCanvas();
                app.persist("__arrow_shapes", state.shapes);
            } else if (e.key === "s") {
                e.preventDefault();
                const saveBtn = document.querySelector(".saveBtn");
                if (saveBtn) saveBtn.click();
            }
        } else if (e.key === "Delete" || e.key === "Backspace") {
            if (state.selectedIndex >= 0) {
                state.shapes.splice(state.selectedIndex, 1);
                state.selectedIndex = -1;
                app.saveToHistory();
                app.renderCanvas();
                app.persist("__arrow_shapes", state.shapes);
            }
        } else if (e.key === "Escape") {
            if (state.isDrawing) {
                state.isDrawing = false;
                state.currentCord = null;
                state.curveStage = 0;
            }
            state.selectedIndex = -1;
            state.currentTool = null;
            app.renderCanvas();
            if (typeof app.updateToolStyles === "function") app.updateToolStyles();
        } else if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            const key = e.key.toLowerCase();

            if (state.selectedIndex >= 0) {
                if (e.key === "[") {
                    e.preventDefault();
                    if (e.shiftKey) app.moveShapeToBottom();
                    else app.moveShapeDown();
                    app.saveToHistory();
                    app.renderCanvas();
                    if (typeof app.updateToolStyles === "function")
                        app.updateToolStyles();
                    return;
                }
                if (e.key === "]") {
                    e.preventDefault();
                    if (e.shiftKey) app.moveShapeToTop();
                    else app.moveShapeUp();
                    app.saveToHistory();
                    app.renderCanvas();
                    if (typeof app.updateToolStyles === "function")
                        app.updateToolStyles();
                    return;
                }
            }

            const tools = {
                v: null,
                a: "arrow",
                l: "line",
                n: "polygon",
                c: "circle",
                r: "rectangle",
                t: "triangle",
                u: "curve",
                x: "text",
                h: "highlighter",
                p: "pen",
                m: "select",
                e: "eraser",
                d: "clear",
            };

            if (key in tools) {
                if (tools[key] === "clear") {
                    const clearBtn = document.querySelector(".clearBtn");
                    if (clearBtn) clearBtn.click();
                } else {
                    state.currentTool = tools[key];
                    if (typeof app.updateToolStyles === "function")
                        app.updateToolStyles();
                }
            }
        }
    };
    app.handleDblClick = (e) => {
        if (state.isDrawing && state.currentCord?.type === "polygon") {
            state.isDrawing = false;
            // Remove the last point which followed the cursor
            if (state.currentCord.points.length > 2) {
                state.currentCord.points.pop();
            }
            state.currentCord.isClosed = true;
            state.shapes.push({ ...state.currentCord });
            state.currentCord = null;
            app.saveToHistory();
            app.renderCanvas();
            app.persist("__arrow_shapes", state.shapes);
            stopLoop();
        }
    };
})();
