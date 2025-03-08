const inputMethod = document.getElementById('input-method');
const imageUpload = document.getElementById('image-upload');
const webcamFeed = document.getElementById('webcam-feed');
const imageInput = document.getElementById('image-input');
const video = document.getElementById('video');
const webcamCanvas = document.getElementById('webcam-canvas');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const activationKeyInput = document.getElementById('activation-key');
const colorNameDisplay = document.getElementById('color-name');
const colorRgbDisplay = document.getElementById('color-rgb');
const colorSample = document.getElementById('color-sample');

let useWebcam = false;
let videoStream = null;
let lastKey = 'Enter'; // Default activation key

// Rainbow color ranges (approximate RGB values)
const rainbowColors = [
    { name: 'Red', rgb: [255, 0, 0], range: { r: [200, 255], g: [0, 50], b: [0, 50] } },
    { name: 'Orange', rgb: [255, 165, 0], range: { r: [200, 255], g: [100, 180], b: [0, 50] } },
    { name: 'Yellow', rgb: [255, 255, 0], range: { r: [200, 255], g: [200, 255], b: [0, 50] } },
    { name: 'Green', rgb: [0, 128, 0], range: { r: [0, 50], g: [100, 180], b: [0, 50] } },
    { name: 'Blue', rgb: [0, 0, 255], range: { r: [0, 50], g: [0, 50], b: [200, 255] } },
    { name: 'Indigo', rgb: [75, 0, 130], range: { r: [50, 100], g: [0, 50], b: [100, 180] } },
    { name: 'Violet', rgb: [148, 0, 211], range: { r: [100, 180], g: [0, 50], b: [150, 255] } },
];

// Toggle input method
inputMethod.addEventListener('change', () => {
    useWebcam = inputMethod.value === 'webcam';
    imageUpload.style.display = useWebcam ? 'none' : 'block';
    webcamFeed.style.display = useWebcam ? 'block' : 'none';
    if (useWebcam) {
        startWebcam();
    } else {
        stopWebcam();
        canvas.style.display = 'block';
    }
});

// Handle image upload
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        };
        img.src = URL.createObjectURL(file);
    }
});

// Start webcam
async function startWebcam() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = videoStream;
        video.play();
        canvas.style.display = 'none';
        webcamCanvas.style.display = 'block';
        webcamCanvas.width = video.videoWidth || 640;
        webcamCanvas.height = video.videoHeight || 480;
    } catch (err) {
        alert('Error accessing webcam: ' + err.message);
    }
}

// Stop webcam
function stopWebcam() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
        video.srcObject = null;
        webcamCanvas.style.display = 'none';
    }
}

// Detect color
function detectColor() {
    let imageData;
    if (useWebcam) {
        const webcamCtx = webcamCanvas.getContext('2d');
        webcamCtx.drawImage(video, 0, 0, webcamCanvas.width, webcamCanvas.height);
        imageData = webcamCtx.getImageData(0, 0, webcamCanvas.width, webcamCanvas.height).data;
    } else {
        if (!canvas.width || !canvas.height) {
            alert('Please upload an image first.');
            return;
        }
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    }

    // Calculate average color
    let rSum = 0, gSum = 0, bSum = 0, pixelCount = 0;
    for (let i = 0; i < imageData.length; i += 4) {
        rSum += imageData[i];
        gSum += imageData[i + 1];
        bSum += imageData[i + 2];
        pixelCount++;
    }
    const avgR = Math.round(rSum / pixelCount);
    const avgG = Math.round(gSum / pixelCount);
    const avgB = Math.round(bSum / pixelCount);

    // Find closest rainbow color
    let detectedColor = { name: 'Unknown', rgb: [avgR, avgG, avgB] };
    for (const color of rainbowColors) {
        const { r: rRange, g: gRange, b: bRange } = color.range;
        if (avgR >= rRange[0] && avgR <= rRange[1] &&
            avgG >= gRange[0] && avgG <= gRange[1] &&
            avgB >= bRange[0] && avgB <= bRange[1]) {
            detectedColor = color;
            break;
        }
    }

    // Display result
    colorNameDisplay.textContent = detectedColor.name;
    colorRgbDisplay.textContent = `RGB: (${avgR}, ${avgG}, ${avgB})`;
    colorSample.style.backgroundColor = `rgb(${avgR}, ${avgG}, ${avgB})`;
}

// Set activation key
activationKeyInput.addEventListener('input', () => {
    const key = activationKeyInput.value.trim();
    lastKey = key === 'Space' ? ' ' : key;
});

// Key press event for color detection
document.addEventListener('keydown', (e) => {
    const pressedKey = e.key === ' ' ? 'Space' : e.key;
    if (pressedKey.toLowerCase() === lastKey.toLowerCase()) {
        detectColor();
    }
});
