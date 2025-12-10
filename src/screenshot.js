(function() {
    const app = window.drawingApp;
    const state = app.state;
    let screenshotInProgress = false;

    function hideLoadingNotification() {
        if (state.loadingNotification) {
            app.hideNotification(state.loadingNotification);
            state.loadingNotification = null;
        }
    }

    function captureCanvasOnly() {
        try {
            const image = state.canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = "Canvas_Only.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to capture canvas:", error);
            alert("Screenshot failed.");
        } finally {
            screenshotInProgress = false;
            hideLoadingNotification();
        }
    }

    function createPageComposite() {
        try {
            const compositeCanvas = document.createElement("canvas");
            const ctx = compositeCanvas.getContext("2d");
            compositeCanvas.width = window.innerWidth;
            compositeCanvas.height = window.innerHeight;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);
            const textContent = document.body.innerText || document.body.textContent || "";
            if (textContent) {
                ctx.fillStyle = "black";
                ctx.font = "14px Arial";
                ctx.textBaseline = "top";
                const lines = textContent.split("\n");
                let y = 20;
                for (let i = 0; i < Math.min(lines.length, 50); i++) {
                    ctx.fillText(lines[i].substring(0, 100), 20, y);
                    y += 20;
                    if (y > compositeCanvas.height - 40) break;
                }
            }
            ctx.drawImage(state.canvas, 0, 0);
            const link = document.createElement("a");
            link.href = compositeCanvas.toDataURL("image/png");
            link.download = "Screen_Shot_Composite.png";
            link.click();
        } catch (error) {
            console.error("Failed to create composite:", error);
            captureCanvasOnly();
        } finally {
            screenshotInProgress = false;
            hideLoadingNotification();
        }
    }

    app.captureWithGetDisplayMedia = function() {
        if (screenshotInProgress) return;
        screenshotInProgress = true;

        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices
                .getDisplayMedia({ video: { mediaSource: "screen" } })
                .then(stream => {
                    const video = document.createElement("video");
                    video.srcObject = stream;
                    video.onloadedmetadata = () => {
                        video.play();
                        const canvas = document.createElement("canvas");
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(video, 0, 0);
                        stream.getTracks().forEach(track => track.stop());
                        const link = document.createElement("a");
                        link.href = canvas.toDataURL("image/png");
                        link.download = "Screen_Shot.png";
                        link.click();
                        screenshotInProgress = false;
                        hideLoadingNotification();
                    };
                })
                .catch(err => {
                    console.log("getDisplayMedia failed, using fallback.", err);
                    createPageComposite(); 
                });
        } else {
            console.log("getDisplayMedia not supported, using fallback.");
            createPageComposite(); 
        }
    };
})();