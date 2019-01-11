import textImage from './example.jpg';

const canvasWidth = 400;
const canvasHeight = 400;

const { canvas, ctx } = createCanvas({ width: canvasWidth, height: canvasHeight, container: document.body });
loadImage(textImage).then((img) => {
    const { width, height } = img;
    const row = 4;
    const col = 3;
    let imageData, pixelIndex;
    ctx.drawImage(img, 0, 0);
    imageData = ctx.getImageData(0, 0, width, height);
    console.log(JSON.stringify(createTextMartrixFromImageData(imageData, 16)));
});

function createTextsMatrixFromImageData(imageData, fontSize) {
    const { width, height, data } = imageData;
    const textsMatrix = {};
    let valueNum = data.length;
    let currentIndex = 0;
    let currentPixel = 0;
    while (currentIndex < valueNum) {

        currentIndex++;
    }

    return textsMatrix;
}

function loadImage(src) {
    return new Promise((resolve) => {
        const img = document.createElement('img');
        img.onload = () => {
            resolve(img);
        };
        img.src = src;
    });
}

function createCanvas({ width = 400, height = 300, container }) {
    const canvas = document.createElement('canvas');
    let ctx;
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');
    if (container) {
        container.appendChild(canvas);
    }
    return { canvas, ctx }
}