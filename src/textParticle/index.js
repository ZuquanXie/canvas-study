import { createCanvas, Color, LinearGradientText, RectilinearMotion, Animation } from '../tools';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const FONT_SIZE = 14;
const { canvas, ctx } = createCanvas({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    container: document.body
});
const { canvas: offCanvas, ctx: offCtx } = createCanvas({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT
});
const textRain = textRainProvider({ width: 400, height: 400, ctx, texts: '01', fontSize: 14 }).start();

function textRainProvider({ width, height, ctx, texts, fontSize }) {
    let pool = [];
    const color = new Color({ r: 0, g: 180, b: 0, a: 1 });
    const textImage = new LinearGradientText({
        texts,
        color,
        fontSize: fontSize,
        gradientGrade: 100
    });
    const update = () => {
        pool = pool.filter((motion) => {
            motion.move();
            return !motion.finished;
        });
    };
    const draw = () => {
        ctx.clearRect(0, 0, width, height);
        pool.forEach(({ x, y, movedDistance, totalDistance }) => {
            ctx.drawImage(
                textImage,
                Math.round((1 - movedDistance / totalDistance) * 100) * fontSize,
                0,
                fontSize,
                fontSize,
                x,
                y,
                fontSize,
                fontSize
            );
        });
    };

    const animation = new Animation({
        render: () => {
            update();
            draw();
        }
    });
    let timerAddRain;
    return {
        start: () => {
            clearInterval(timerAddRain);
            timerAddRain = setInterval(() => {
                const x = Math.random() * width;
                pool.push(new RectilinearMotion({
                    speed: 2,
                    path: [[x, 0], [x, height]]
                }));
            }, 500);
            animation.run();
        },
        stop: () => {
            clearInterval(timerAddRain);
            animation.stop();
        }
    };
}