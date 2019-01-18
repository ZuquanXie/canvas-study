/**
 * 从一张黑底白字的位图片中获取到文字的点矩阵
 * 每个文字占一个相同大小（即fontSize参数）的正四边形，且紧密排列
 */
import { createCanvas, loadImage } from '../tools';
import textImage from './example.jpg';

const canvasWidth = 400;
const canvasHeight = 400;

const { canvas: offScreenCanvas, ctx: offScreenCtx } = createCanvas({ width: canvasWidth, height: canvasHeight });
const { canvas, ctx } = createCanvas({ width: 1760, height: 160, container: document.body });
loadImage(textImage).then((img) => {
    const { width, height } = img;
    const fontSize = 16;
    let imageData, wordsMatrix;
    offScreenCtx.drawImage(img, 0, 0);
    imageData = offScreenCtx.getImageData(0, 0, width, height);
    wordsMatrix = createWordsPointMatrix({ text: '这是一段简单的测试文本', imageData: imageData, fontSize });
    /* 将获取的点矩阵绘制到画布 */
    ctx.fillStyle = '#000000';
    const matrixSize = 160;
    let index = 0;
    ctx.beginPath();
    for (let key in wordsMatrix) {
        if (wordsMatrix.hasOwnProperty(key)) {
            ctx.save();
            ctx.translate(index * matrixSize, 0);
            drawPointsMatrix({ matrix: wordsMatrix[key], space: 10, size: 2, ctx });
            ctx.restore();
            index++;
        }
    }
    ctx.closePath();
    ctx.fill();
});

/**
 * 绘制点矩阵
 * @param matrix
 * @param space 相邻的点间距
 * @param size 点大小
 * @param ctx canvas上下文context
 */
function drawPointsMatrix({ matrix, space, size, ctx }) {
    const rowNum = matrix.length;
    for (let rI = 0; rI < rowNum; rI++) {
        for (let cI = 0, colNum = matrix[rI].length; cI < colNum; cI++) {
            if (matrix[rI][cI]) {
                const x = cI * space;
                const y = rI * space;
                ctx.moveTo(x, y);
                ctx.arc(x, y, size, 0, 2 * Math.PI, false);
            }
        }
    }
}

/**
 * 从imageData创建文字点矩阵
 * @param text{String} 文字内容
 * @param imageData{Object} canvas的imageData
 * @param fontSize{Number} 字体大小
 */
function createWordsPointMatrix({ text, imageData, fontSize }) {
    const matrix = {};
    const wordsData = createWordsPixelData(imageData, fontSize);
    const wordNum = wordsData.length;
    for (let wordIndex = 0; wordIndex < wordNum; wordIndex++) {
        let wordMatrix = [];
        for (let rowIndex = 0, rowNum = wordsData[wordIndex].length; rowIndex < rowNum; rowIndex++) {
            wordMatrix[rowIndex] = [];
            for (let colIndex = 0, colNum = wordsData[wordIndex][rowIndex].length; colIndex < colNum; colIndex++) {
                if (isPixelPointAble(wordsData[wordIndex][rowIndex][colIndex])) {
                    wordMatrix[rowIndex][colIndex] = 1;
                    continue;
                }
                wordMatrix[rowIndex][colIndex] = 0;
            }
        }
        matrix[text[wordIndex]] = wordMatrix;
    }
    return matrix;
}

/**
 * 通过颜色通道判定像素点是否为有效点
 * @param r 红色通道
 * @param g 绿色通道
 * @param b 蓝色通道
 * @param a alpha通道（透明）
 * @return {boolean}
 */
function isPixelPointAble([r, g, b, a]) {
    if (a < 255) {
        return false;
    }
    if (r < 200) {
        return false;
    }
    if (g < 200) {
        return false;
    }
    return a >= 200;
}

/**
 * 创建文字的像素数据
 * @param imageData 由canvas创建的imageData
 * @param fontSize 文字的字体大小
 * @return {Array}
 */
function createWordsPixelData(imageData, fontSize) {
    const { data, width } = imageData;
    const result = [];
    const pixelNum = data.length / 4;
    for (let pixelIndex = 0; pixelIndex < pixelNum; pixelIndex++) {
        const rowIndex = Math.floor(pixelIndex / width);
        const colIndex = pixelIndex % width;
        const wordIndex = Math.floor(colIndex / fontSize) + Math.floor(rowIndex / fontSize) * width / fontSize;
        const wordPixelColIndex = rowIndex % fontSize;
        const pixel = [
            data[pixelIndex * 4],
            data[pixelIndex * 4 + 1],
            data[pixelIndex * 4 + 2],
            data[pixelIndex * 4 + 3]
        ];
        if (result[wordIndex]) {
            if (result[wordIndex][wordPixelColIndex]) {
                result[wordIndex][wordPixelColIndex].push(pixel);
                continue;
            }
            result[wordIndex][wordPixelColIndex] = [pixel];
            continue;
        }
        result[wordIndex] = [[pixel]];
    }
    return result;
}
