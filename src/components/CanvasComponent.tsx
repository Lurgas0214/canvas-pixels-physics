import React from "react";
import "./CanvasComponent.css";

const getAlpha = (pixels: Uint8ClampedArray, index: number): number => {
    return pixels[index + 3];
};

const getRndNumber = (range: number): number => {
    return range - (Math.random() * range * 2)
}

const getColor = (pixels: Uint8ClampedArray, index: number): string => {
    const red = pixels[index], green = pixels[index + 1], blue = pixels[index + 2];
    return ('rgb(' + red + ',' + green + ',' + blue + ')');
};

class Mouse {
    x: number | undefined;
    y: number | undefined;

    update = (x: number, y: number) => {
        this.x = x;
        this.y = y;
    }
}

class Particle {
    originX: number;
    originY: number;
    color: string;
    ease: number;
    size: number;
    vx: number;
    vy: number;
    x: number;
    y: number;
    v: number;

    constructor(radius: number, color: string, size: number, ease: number, x: number, y: number, v: number) {
        this.x = Math.floor(getRndNumber(radius));
        this.y = Math.floor(getRndNumber(radius));
        this.vx = Math.floor(getRndNumber(v));
        this.vy = Math.floor(getRndNumber(v));
        this.originX = Math.floor(x);
        this.originY = Math.floor(y);
        this.size = Math.floor(size);
        this.color = color;
        this.ease = ease;
        this.v = v;
    }

    draw(context: CanvasRenderingContext2D | null) {
        if (context) {
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    return2Origin() {
        this.x += (this.originX - this.x) * this.ease;
        this.y += (this.originY - this.y) * this.ease;
    }

    update(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

interface CanvasProps {
    base64String: string
}

interface CanvasStateProps {
    particles?: Particle[]
}

class CanvasComponent extends React.Component<CanvasProps, CanvasStateProps> {
    canvasContext: CanvasRenderingContext2D | null = null;
    canvasElement: HTMLCanvasElement | null = null;
    imageElement: HTMLImageElement | null = null;
    particles: Particle[] = [];
    mouse: Mouse = new Mouse();
    radius: number = 3000;
    velocity: number = 33;
    ease: number = 0.2;
    gap: number = 5;

    componentDidMount() {
        const { canvasElement, canvasContext, imageElement, particles, velocity, radius, ease, gap } = this;
        if (canvasElement && canvasContext && imageElement) {
            imageElement.onload = () => {
                const shift = 0.2, stretch = 1 - (shift * 2), dx = canvasElement.width * shift, dy = canvasElement.height * shift, dw = canvasElement.width * stretch, dh = canvasElement.height * stretch;
                let pixels: Uint8ClampedArray | null = null, color: string, alpha: number, index: number, x: number, y: number;
                canvasContext.drawImage(imageElement, dx, dy, dw, dh);
                pixels = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height).data;
                for (x = 0; x < canvasElement.width; x += gap) {
                    for (y = 0; y < canvasElement.height; y += gap) {
                        index = (y * canvasElement.width + x) * 4;
                        color = getColor(pixels, index);
                        alpha = getAlpha(pixels, index);
                        if (alpha > 0) {
                            particles.push(new Particle(radius, color, gap, ease, x, y, velocity));
                        }
                    }
                }
            };
        }
        this.warp();
    };

    warp = () => {
        const { canvasElement, canvasContext, particles } = this;
        if (canvasContext && canvasElement) {
            canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
            particles.forEach(particle => particle.return2Origin());
            particles.forEach(particle => particle.draw(this.canvasContext));
            requestAnimationFrame(this.warp);
        }
    };

    mouseEvent = (event: MouseEvent) => {
        this.mouse.update(event.x, event.y);
    };

    mouseClick = () => {
        const { particles, radius } = this;
        particles.forEach(particle => particle.update(Math.floor(getRndNumber(radius)), Math.floor(getRndNumber(radius))));
    };

    render() {
        const { base64String } = this.props;

        return (
            <React.Fragment>
                <canvas className="canvas-canvas" ref={(htmlElement: HTMLCanvasElement) => {
                    if (htmlElement) {
                        if (htmlElement.parentElement) {
                            htmlElement.width = htmlElement.parentElement.clientWidth;
                            htmlElement.height = htmlElement.parentElement.clientHeight;
                        }
                        this.canvasElement = htmlElement;
                        this.canvasElement.onclick = this.mouseClick;
                        this.canvasElement.onmousemove = this.mouseEvent;
                        this.canvasContext = htmlElement.getContext('2d');
                    }
                }}></canvas>
                <img alt="" className="canvas-image-source" src={base64String} ref={(htmlElement: HTMLImageElement) => {
                    if (htmlElement) {
                        this.imageElement = htmlElement;
                    }
                }} />
            </React.Fragment>
        )
    }
}

export default CanvasComponent