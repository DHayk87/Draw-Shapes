(function () {
    const app = window.drawingApp;
    const state = app.state;

    function hexToRgba(hex, alpha) {
        if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            return hex;
        }
        let c = hex.substring(1).split("");
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = "0x" + c.join("");
        return `rgba(${(c >> 16) & 255}, ${(c >> 8) & 255}, ${c & 255}, ${alpha})`;
    }

    function drawArrow({
        fromX,
        fromY,
        toX,
        toY,
        color,
        lineWidth = state.lineWidth,
        rotation = 0,
        opacity = state.opacity,
    }) {
        const ctx = state.ctx;
        const rgbaColor = hexToRgba(color, opacity);
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
        ctx.strokeStyle = rgbaColor;
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
        ctx.fillStyle = rgbaColor;
        ctx.fill();
        ctx.restore();
    }

    function drawCircle({
        fromX,
        fromY,
        toX,
        toY,
        color,
        lineWidth = state.lineWidth,
        opacity = state.opacity,
    }) {
        const ctx = state.ctx;
        const rgbaColor = hexToRgba(color, opacity);
        const centerX = (fromX + toX) / 2;
        const centerY = (fromY + toY) / 2;
        const radius = Math.abs(toX - fromX) / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = rgbaColor;
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
        lineWidth = state.lineWidth,
        rotation = 0,
        opacity = state.opacity,
    }) {
        const ctx = state.ctx;
        const rgbaColor = hexToRgba(color, opacity);
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
        ctx.fillStyle = rgbaColor;
        ctx.strokeStyle = "white";
        ctx.fillRect(fromX, fromY, width, height);
        ctx.lineWidth = Math.max(1, lineWidth);
        ctx.strokeRect(fromX, fromY, width, height);
        ctx.restore();
    }

    function drawTriangle({
        fromX,
        fromY,
        toX,
        toY,
        color,
        lineWidth = state.lineWidth,
        rotation = 0,
        opacity = state.opacity,
    }) {
        const ctx = state.ctx;
        const rgbaColor = hexToRgba(color, opacity);
        ctx.save();
        if (rotation !== 0) {
            const centerX = (fromX + toX) / 2;
            const centerY = (fromY + toY) / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(rotation);
            ctx.translate(-centerX, -centerY);
        }

        const x1 = fromX;
        const y1 = toY;
        const x2 = (fromX + toX) / 2;
        const y2 = fromY;
        const x3 = toX;
        const y3 = toY;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();

        ctx.fillStyle = rgbaColor;
        ctx.strokeStyle = "white";
        ctx.lineWidth = Math.max(1, lineWidth);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    function drawLine({
        fromX,
        fromY,
        toX,
        toY,
        color,
        lineWidth = state.lineWidth,
        opacity = state.opacity,
    }) {
        const ctx = state.ctx;
        const rgbaColor = hexToRgba(color, opacity);
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.strokeStyle = "white";
        ctx.lineWidth = Math.max(1, lineWidth) + 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.strokeStyle = rgbaColor;
        ctx.lineWidth = Math.max(1, lineWidth);
        ctx.stroke();
    }

    function drawPen({
        points,
        color,
        lineWidth = state.lineWidth,
        opacity = state.opacity,
    }) {
        if (points.length < 2) return;
        const ctx = state.ctx;
        const rgbaColor = hexToRgba(color, opacity);
        ctx.strokeStyle = rgbaColor;
        ctx.lineWidth = Math.max(1, lineWidth);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length - 2; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }

        // For the last 2 points
        if (points.length > 2) {
            ctx.quadraticCurveTo(
                points[points.length - 2].x,
                points[points.length - 2].y,
                points[points.length - 1].x,
                points[points.length - 1].y,
            );
        } else {
            ctx.lineTo(points[1].x, points[1].y);
        }
        ctx.stroke();
    }

    function drawText({
        x,
        y,
        color,
        text,
        lineWidth = state.lineWidth,
        rotation = 0,
        opacity = state.opacity,
    }) {
        const ctx = state.ctx;
        const rgbaColor = hexToRgba(color, opacity);
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
        ctx.fillStyle = rgbaColor;
        ctx.fillText(text, x + 6, y - 14);
        ctx.restore();
    }

    function drawSelectionOutline(shape) {
        const ctx = state.ctx;
        ctx.save();
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = "#00aaff";
        ctx.lineWidth = 1;
        const bbox = app.getShapeBBox(shape);
        if (!bbox) {
            ctx.restore();
            return;
        }
        ctx.strokeRect(bbox.x, bbox.y, bbox.w, bbox.h);

        if (
            shape.type === "arrow" ||
            shape.type === "rectangle" ||
            shape.type === "text" ||
            shape.type === "triangle"
        ) {
            const centerX = bbox.x + bbox.w / 2;
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

    app.getShapeBBox = function (shape) {
        if (
            shape.type === "rectangle" ||
            shape.type === "circle" ||
            shape.type === "arrow" ||
            shape.type === "line" ||
            shape.type === "triangle"
        ) {
            const x = Math.min(shape.fromX, shape.toX);
            const y = Math.min(shape.fromY, shape.toY);
            const w = Math.abs(shape.toX - shape.fromX);
            const h = Math.abs(shape.toY - shape.fromY);
            return { x, y, w, h };
        }
        if (shape.type === "pen") {
            if (shape.points.length === 0) return null;
            let minX = shape.points[0].x,
                maxX = shape.points[0].x;
            let minY = shape.points[0].y,
                maxY = shape.points[0].y;
            for (let i = 1; i < shape.points.length; i++) {
                minX = Math.min(minX, shape.points[i].x);
                maxX = Math.max(maxX, shape.points[i].x);
                minY = Math.min(minY, shape.points[i].y);
                maxY = Math.max(maxY, shape.points[i].y);
            }
            return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
        }
        if (shape.type === "text") {
            const ctx = state.ctx;
            ctx.font = "20px Arial";
            const width = ctx.measureText(shape.text || "").width;
            return { x: shape.x, y: shape.y - 14, w: Math.max(10, width + 6), h: 24 };
        }
        return null;
    };

    app.renderCanvas = function () {
        const ctx = state.ctx;
        const canvas = state.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const drawShape = (cord, idx) => {
            if (cord.type === "arrow") drawArrow(cord);
            else if (cord.type === "line") drawLine(cord);
            else if (cord.type === "circle") drawCircle(cord);
            else if (cord.type === "rectangle") drawRectangle(cord);
            else if (cord.type === "triangle") drawTriangle(cord);
            else if (cord.type === "pen" || cord.type === "highlighter") drawPen(cord);
            else if (cord.type === "text") drawText(cord);
            if (idx === state.selectedIndex) drawSelectionOutline(cord);
        };

        // Pass 1: Draw Highlighters
        state.shapes.forEach((s, i) => {
            if (s.type === "highlighter") drawShape(s, i);
        });

        // Pass 2: Draw everything else
        state.shapes.forEach((s, i) => {
            if (s.type !== "highlighter") drawShape(s, i);
        });
    };

    app.drawCurrentShape = function () {
        if (!state.currentCord) return;
        if (state.currentTool === "arrow") drawArrow(state.currentCord);
        else if (state.currentTool === "line") drawLine(state.currentCord);
        else if (state.currentTool === "circle") drawCircle(state.currentCord);
        else if (state.currentTool === "rectangle") drawRectangle(state.currentCord);
        else if (state.currentTool === "triangle") drawTriangle(state.currentCord);
        else if (state.currentTool === "pen" || state.currentTool === "highlighter")
            drawPen(state.currentCord);
    };
})();
