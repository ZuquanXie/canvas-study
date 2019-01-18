export function animateProvider (render) {
    let state = true;
    const animate = () => {
        if (state) {
            render();
            requestAnimationFrame(animate);
        }
    };
    return animate()
}

export class Animation {
    constructor ({ render = () => {} }) {
        this._render = render;
        this.state = 0;
        this._animate = this._animate.bind(this);
    }

    _animate() {
        if (this.state) {
            this._render();
            requestAnimationFrame(this._animate);
        }
    }

    run() {
        this.state = 1;
        this._animate();
        return this;
    }

    stop() {
        this.state = 0;
        return this;
    }

    setRender(render) {
        this._render = render;
        return this;
    }
}

class Point {
    constructor ({ x = 0, y = 0 }) {
        this.x = x;
        this.y = y;
    }
}

export class RectilinearMotion extends Point {
    constructor ({ path, speed }) {
        super({ x: path[0][0], y: path[0][1] });
        this.currentSectionIndex = 0;
        this.currentSectionMoved = 0;
        this.movedDistance = 0;
        this.totalDistance = calLinearPathLength(path);
        this.speed = speed;
        this._initPath(path);
        this.finished = false;
    }

    _initPath(path) {
        const sections = [];
        for (let i = 0, l = path.length; i < l - 1; i++) {
            sections[i] = {
                index: i,
                length: calLinearDistance(path[i], path[i + 1]),
                points: [path[i], path[i + 1]]
            }
        }
        this.sections = sections;
    }

    move() {
        const { speed, sections, currentSectionMoved, currentSectionIndex } = this;
        let xMoved, yMoved;
        if (currentSectionMoved + speed > sections[currentSectionIndex].length) {
            if (currentSectionIndex + 1 < sections.length) {
                this.currentSectionMoved = speed - (sections[currentSectionIndex].length - currentSectionMoved);
                this.currentSectionIndex += 1;
                this.movedDistance += speed;
            } else {
                this.currentSectionMoved = sections[currentSectionIndex].length;
                this.movedDistance = this.totalDistance;
                this.finished = true;
            }
        } else {
            this.currentSectionMoved += speed;
            this.movedDistance += speed;
        }
        xMoved = (sections[this.currentSectionIndex].points[1][0] - sections[this.currentSectionIndex].points[0][0]) * this.currentSectionMoved / sections[this.currentSectionIndex].length;
        yMoved = (sections[this.currentSectionIndex].points[1][1] - sections[this.currentSectionIndex].points[0][1]) * this.currentSectionMoved / sections[this.currentSectionIndex].length;
        this.x = sections[this.currentSectionIndex].points[0][0] + xMoved;
        this.y = sections[this.currentSectionIndex].points[0][1] + yMoved;
    }
}

/**
 * 计算点直线距离
 * @param point1
 * @param point2
 * @return {number}
 */
export function calLinearDistance (point1, point2) {
    const [x1, y1] = point1;
    const [x2, y2] = point2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算直线路径距离
 * @param path{Array} 路径点数组
 * @return {number}
 */
export function calLinearPathLength (path) {
    const pointNum = path.length;
    let length = 0;
    for (let i = 0; i < pointNum - 1; i++) {
        length += calLinearDistance(path[i], path[i + 1]);
    }
    return length;
}

/**
 * 异步加载图片
 * @param src
 * @return Promise
 * @resolve img{Object}
 */
export function loadImage(src) {
    return new Promise((resolve) => {
        const img = document.createElement('img');
        img.onload = () => {
            resolve(img);
        };
        img.src = src;
    });
}

/**
 * 创建画布
 * @param width
 * @param height
 * @param [container] 画布容器元素（DOM），有container参数时，创建完画布会自动将画布添加到容器元素内
 * @return {{canvas: HTMLElement, ctx: CanvasRenderingContext2D | WebGLRenderingContext}}
 */
export function createCanvas({ width = 400, height = 300, container }) {
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

export class LinearGradientText {
    constructor ({ texts, fontFamily = 'serif', fontSize = 12, color, gradientGrade = 100 }) {
        this.gradientGrade = gradientGrade;
        this.texts = texts;
        this.fontFamily = fontFamily;
        this.fontSize = fontSize;
        this.color = color;
        this.width = fontSize * gradientGrade;
        this.height = fontSize * texts.length;
        this._initCanvas();
        this._draw();
    }

    _initCanvas() {
        const { width, height } = this;
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this._ctx = this.canvas.getContext('2d');
    }

    _draw() {
        const { _ctx, texts, fontFamily, fontSize, color, gradientGrade } = this;
        _ctx.font = `${fontSize}px ${fontFamily}`;
        for (let i = 0, l = texts.length; i < l; i++) {
            for (let g = 0; g < gradientGrade; g++) {
                color.setA(g / gradientGrade);
                _ctx.fillStyle = color.toString();
                _ctx.fillText(texts[i], g * fontSize, (i + 1 )* fontSize);
            }
        }
    }
}

export class Color {
    constructor ({ r = 255, g = 255, b = 255, a = 1 }) {
        this.setRGBA({ r, g, b, a });
    }

    toString() {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    }

    setRGBA({ r, g, b, a }) {
        this.setR(r);
        this.setG(g);
        this.setB(b);
        this.setA(a);
        return this;
    }

    setR(value) {
        this.r = Math.min(value, 255);
        return this;
    }

    setG(value) {
        this.g = Math.min(value, 255);
        return this;
    }

    setB(value) {
        this.b = Math.min(value, 255);
        return this;
    }

    setA(value) {
        this.a = Math.min(value, 1);
        return this;
    }
}