window.drawingApp = {
    state: {
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
        selectedIndex: -1,
        dragMode: null,
        dragStart: null,
        toolbarPos: null,
        pixelRatio: 1,
        lineWidth: 2,
        opacity: 1,
        curveStage: 0,
        destroy: null,
    },

    saveToHistory: function () {
        const { state } = window.drawingApp;
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push(JSON.parse(JSON.stringify(state.shapes)));
        state.historyIndex++;

        if (state.history.length > 50) {
            state.history.shift();
            state.historyIndex--;
        }
        if (window.drawingApp.updateUndoRedoButtons) {
            window.drawingApp.updateUndoRedoButtons();
        }
    },

    undo: function () {
        const { state } = window.drawingApp;
        if (state.historyIndex > 0) {
            state.historyIndex--;
            state.shapes = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        }
        if (window.drawingApp.updateUndoRedoButtons) {
            window.drawingApp.updateUndoRedoButtons();
        }
    },

    redo: function () {
        const { state } = window.drawingApp;
        if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            state.shapes = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        }
        if (window.drawingApp.updateUndoRedoButtons) {
            window.drawingApp.updateUndoRedoButtons();
        }
    },

    moveShapeToTop: function () {
        const { state } = window.drawingApp;
        if (state.selectedIndex < 0) return;
        const shapes = state.shapes;
        const index = state.selectedIndex;
        const [shape] = shapes.splice(index, 1);
        shapes.push(shape);
        state.selectedIndex = shapes.length - 1;
    },

    moveShapeToBottom: function () {
        const { state } = window.drawingApp;
        if (state.selectedIndex < 0) return;
        const shapes = state.shapes;
        const index = state.selectedIndex;
        const [shape] = shapes.splice(index, 1);
        shapes.unshift(shape);
        state.selectedIndex = 0;
    },

    moveShapeUp: function () {
        const { state } = window.drawingApp;
        if (state.selectedIndex < 0 || state.selectedIndex >= state.shapes.length - 1)
            return;
        const shapes = state.shapes;
        const index = state.selectedIndex;
        [shapes[index], shapes[index + 1]] = [shapes[index + 1], shapes[index]];
        state.selectedIndex = index + 1;
    },

    moveShapeDown: function () {
        const { state } = window.drawingApp;
        if (state.selectedIndex <= 0) return;
        const shapes = state.shapes;
        const index = state.selectedIndex;
        [shapes[index], shapes[index - 1]] = [shapes[index - 1], shapes[index]];
        state.selectedIndex = index - 1;
    },

    persist: function (key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (_) {}
    },

    restore: function (key, fallback) {
        try {
            const v = localStorage.getItem(key);
            return v ? JSON.parse(v) : fallback;
        } catch (_) {
            return fallback;
        }
    },
};
