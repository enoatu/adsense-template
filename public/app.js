document.addEventListener('DOMContentLoaded', () => {
    // Canvas and Tool Elements
    const canvas = document.getElementById('pixel-canvas');
    const ctx = canvas.getContext('2d');
    const penColorInput = document.getElementById('pen-color');
    const penTool = document.getElementById('pen-tool');
    const eraserTool = document.getElementById('eraser-tool');
    const canvasSizeInput = document.getElementById('canvas-size');
    const clearCanvasButton = document.getElementById('clear-canvas');

    // Animation Elements
    const addFrameButton = document.getElementById('add-frame');
    const frameList = document.getElementById('frame-list');
    const frameRateInput = document.getElementById('frame-rate');
    const frameRateValue = document.getElementById('frame-rate-value');
    const previewCanvas = document.getElementById('preview-canvas');
    const previewCtx = previewCanvas.getContext('2d');

    // Export Elements
    const exportPngButton = document.getElementById('export-png');
    const exportGifButton = document.getElementById('export-gif');

    // State
    let penColor = penColorInput.value;
    let currentTool = 'pen';
    let canvasSize = parseInt(canvasSizeInput.value);
    let pixelSize = 10;
    let isDrawing = false;
    let frames = [];
    let activeFrameIndex = -1;
    let animationInterval;

    // Canvas Functions
    function initializeCanvas() {
        const newPixelSize = 512 / canvasSize;
        canvas.width = canvasSize * newPixelSize;
        canvas.height = canvasSize * newPixelSize;
        pixelSize = newPixelSize;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGrid();
    }

    function drawGrid() {
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        for (let i = 0; i <= canvasSize; i++) {
            ctx.beginPath();
            ctx.moveTo(i * pixelSize, 0);
            ctx.lineTo(i * pixelSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * pixelSize);
            ctx.lineTo(canvas.width, i * pixelSize);
            ctx.stroke();
        }
    }

    function drawPixel(e) {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / pixelSize);
        const y = Math.floor((e.clientY - rect.top) / pixelSize);

        ctx.fillStyle = currentTool === 'pen' ? penColor : 'white';
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        drawGrid();
    }
    
    function loadFrame(index) {
        if (index < 0 || index >= frames.length) return;
        const frameData = frames[index];
        const image = new Image();
        image.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            drawGrid();
        };
        image.src = frameData;
        activeFrameIndex = index;
        updateFrameSelection();
    }

    // Animation Functions
    function addFrame() {
        const frameData = canvas.toDataURL();
        if (activeFrameIndex === -1) {
            frames.push(frameData);
            activeFrameIndex = frames.length - 1;
        } else {
            frames.splice(activeFrameIndex + 1, 0, frameData);
            activeFrameIndex++;
        }
        renderFrames();
        loadFrame(activeFrameIndex);
    }
    
    function deleteFrame(index) {
        if (frames.length <= 1) {
            frames = [];
            activeFrameIndex = -1;
            initializeCanvas();
            renderFrames();
            return;
        };
        frames.splice(index, 1);
        if (activeFrameIndex >= index) {
            activeFrameIndex--;
        }
        renderFrames();
        if (frames.length > 0) {
            loadFrame(activeFrameIndex);
        }
    }

    function renderFrames() {
        frameList.innerHTML = '';
        frames.forEach((frameData, index) => {
            const frameDiv = document.createElement('div');
            frameDiv.className = 'frame';
            if (index === activeFrameIndex) {
                frameDiv.classList.add('active');
            }
            const img = document.createElement('img');
            img.src = frameData;
            img.style.width = '100%';
            img.style.height = '100%';
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'frame-delete';
            deleteButton.innerHTML = '&times;';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteFrame(index);
            });

            frameDiv.appendChild(img);
            frameDiv.appendChild(deleteButton);
            frameDiv.addEventListener('click', () => loadFrame(index));
            frameList.appendChild(frameDiv);
        });
    }
    
    function updateFrameSelection() {
        const frameElements = frameList.querySelectorAll('.frame');
        frameElements.forEach((frame, index) => {
            if (index === activeFrameIndex) {
                frame.classList.add('active');
            } else {
                frame.classList.remove('active');
            }
        });
    }

    function startAnimation() {
        if (animationInterval) {
            clearInterval(animationInterval);
        }
        let currentFrame = 0;
        animationInterval = setInterval(() => {
            if (frames.length > 0) {
                const image = new Image();
                image.onload = () => {
                    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
                    previewCtx.drawImage(image, 0, 0, previewCanvas.width, previewCanvas.height);
                };
                image.src = frames[currentFrame];
                currentFrame = (currentFrame + 1) % frames.length;
            }
        }, 1000 / parseInt(frameRateInput.value));
    }

    // Export Functions
    function exportPNG() {
        const link = document.createElement('a');
        link.download = 'pixel-art.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    function exportGIF() {
        const gif = new GIF({
            workers: 2,
            quality: 10,
            width: canvas.width,
            height: canvas.height
        });

        frames.forEach(frameData => {
            const img = new Image();
            img.src = frameData;
            gif.addFrame(img, { delay: 1000 / parseInt(frameRateInput.value) });
        });

        gif.on('finished', (blob) => {
            const link = document.createElement('a');
            link.download = 'pixel-art.gif';
            link.href = URL.createObjectURL(blob);
            link.click();
        });

        gif.render();
    }

    // Event Listeners
    penColorInput.addEventListener('change', (e) => { penColor = e.target.value; });
    penTool.addEventListener('click', () => {
        currentTool = 'pen';
        penTool.classList.add('active');
        eraserTool.classList.remove('active');
    });
    eraserTool.addEventListener('click', () => {
        currentTool = 'eraser';
        eraserTool.classList.add('active');
        penTool.classList.remove('active');
    });
    canvasSizeInput.addEventListener('change', (e) => {
        canvasSize = parseInt(e.target.value);
        initializeCanvas();
        frames = [];
        activeFrameIndex = -1;
        renderFrames();
    });
    clearCanvasButton.addEventListener('click', initializeCanvas);
    canvas.addEventListener('mousedown', (e) => { isDrawing = true; drawPixel(e); });
    canvas.addEventListener('mousemove', drawPixel);
    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
        if (activeFrameIndex !== -1) {
            frames[activeFrameIndex] = canvas.toDataURL();
            renderFrames();
        }
    });
    canvas.addEventListener('mouseleave', () => { isDrawing = false; });
    addFrameButton.addEventListener('click', addFrame);
    frameRateInput.addEventListener('input', (e) => {
        frameRateValue.textContent = e.target.value;
        startAnimation();
    });
    exportPngButton.addEventListener('click', exportPNG);
    exportGifButton.addEventListener('click', exportGIF);

    // Initial Setup
    initializeCanvas();
    addFrame();
    startAnimation();
});
