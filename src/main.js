(function () {
    if (window.drawingAppInstance) {
        window.drawingAppInstance.destroy();
        return;
    }

    const app = window.drawingApp;
    const state = app.state;

    app.showNotification("Drawer Activated");

    const { tools, colorInput, lineWidthSlider, opacitySlider } = app.createToolbar();

    const canvas = document.createElement("canvas");
    canvas.id = "__arrow-canvas";
    document.body.append(canvas);
    state.canvas = canvas;
    state.ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
        const ratio = Math.max(1, window.devicePixelRatio || 1);
        state.pixelRatio = ratio;
        const w = window.innerWidth, h = window.innerHeight;
        canvas.width = Math.floor(w * ratio);
        canvas.height = Math.floor(h * ratio);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        state.ctx.setTransform(1, 0, 0, 1, 0, 0);
        state.ctx.scale(ratio, ratio);
        app.renderCanvas();
    };

    window.addEventListener("resize", resizeCanvas);

    const restoredShapes = app.restore("__arrow_shapes", []);
    state.shapes = Array.isArray(restoredShapes) ? restoredShapes : [];
    const restoredControls = app.restore("__arrow_controls", { color: state.color, lineWidth: state.lineWidth, opacity: state.opacity });
    state.color = restoredControls.color ?? state.color;
    state.lineWidth = restoredControls.lineWidth ?? state.lineWidth;
    state.opacity = restoredControls.opacity ?? state.opacity;
    colorInput.value = state.color;
    lineWidthSlider.value = state.lineWidth;
    opacitySlider.value = state.opacity;
    
    const restoredPos = app.restore("__arrow_toolbar_pos");
    if (restoredPos && restoredPos.left && restoredPos.top) {
        Object.assign(tools.style, { position: "absolute", left: restoredPos.left, top: restoredPos.top, right: "auto" });
    }

    resizeCanvas();
    app.saveToHistory();

    const messageListener = (message, sender, sendResponse) => {
        if (message.action === "imageCaptured" && message.imageUri) {
            app.hideNotification(state.loadingNotification);
            state.loadingNotification = null;
            try {
                const link = document.createElement("a");
                link.href = message.imageUri;
                link.download = "Screen_Shot.png";
                link.click();
            } catch (error) {
                console.error("Failed to download screenshot, falling back.", error);
                app.captureWithGetDisplayMedia();
            }
        }
        return true;
    };

    const destroy = () => {
        app.showNotification("Drawer Deactivated");
        try {
            document.body.style.cursor = "auto";
            state.canvas?.remove();
            state.overlay?.remove();
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mousedown", app.handleMouseDown);
            window.removeEventListener("mousemove", app.handleMouseMove);
            window.removeEventListener("mouseup", app.handleMouseUp);
            window.removeEventListener("keydown", app.keydownHandler);
            if (chrome.runtime?.id) {
                chrome.runtime.onMessage.removeListener(messageListener);
            }
            delete window.drawingAppInstance;
        } catch (e) { console.error("Error during cleanup:", e); }
    };
    
    state.destroy = destroy;

    window.addEventListener("mousedown", app.handleMouseDown);
    window.addEventListener("mousemove", app.handleMouseMove);
    window.addEventListener("mouseup", app.handleMouseUp);
    window.addEventListener("keydown", app.keydownHandler);
    chrome.runtime.onMessage.addListener(messageListener);

    window.drawingAppInstance = { destroy };

    console.log("%c[ArrowPointer] Activated", "font-size:20px; color:#00ff00;");
})();