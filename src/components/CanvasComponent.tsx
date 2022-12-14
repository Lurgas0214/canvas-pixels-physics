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
    radius: number = 5000;
    x: number = 0;
    y: number = 0;

    update = (x: number, y: number) => {
        this.x = x;
        this.y = y;
    }
}

class Particle {
    distance: number;
    originX: number;
    originY: number;
    angle: number;
    force: number;
    color: string;
    ease: number;
    size: number;
    vx: number;
    vy: number;
    dx: number;
    dy: number;
    x: number;
    y: number;

    constructor(canvasElement: HTMLCanvasElement, color: string, size: number, ease: number, x: number, y: number) {
        this.x = getRndNumber(canvasElement.width * 2);
        this.y = getRndNumber(canvasElement.height * 2);
        this.originX = Math.floor(x);
        this.originY = Math.floor(y);
        this.size = Math.floor(size);
        this.color = color;
        this.ease = ease;
        this.distance = 0;
        this.angle = 0;
        this.force = 0;
        this.vx = 0;
        this.vy = 0;
        this.dx = 0;
        this.dy = 0;
    }

    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.size, this.size);
    }

    update(mouse: Mouse) {
        this.dx = mouse.x - this.x;
        this.dy = mouse.y - this.y;
        this.distance = this.dx * this.dx + (this.dy * this.dy);
        this.force = -mouse.radius / this.distance;

        if (this.distance < mouse.radius) {
            this.angle = Math.atan2(this.dy, this.dx);
            this.vx = this.force * Math.cos(this.angle);
            this.vy = this.force * Math.sin(this.angle);
            this.x += this.vx;
            this.y += this.vy;
        }

        this.x += (this.originX - this.x) * this.ease;
        this.y += (this.originY - this.y) * this.ease;
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
    animationFrameId: number | null = null;
    particles: Particle[] = [];
    mouse: Mouse = new Mouse();
    ease: number = 0.2;
    gap: number = 5;

    componentDidMount() {
        const { canvasElement, canvasContext, imageElement, particles, ease, gap } = this;
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
                            particles.push(new Particle(canvasElement, color, gap, ease, x, y));
                        }
                    }
                }
            };
        }
        this.warp();
    };

    warp = () => {
        const { canvasElement, canvasContext, particles, mouse } = this;
        if (canvasContext && canvasElement) {
            canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
            particles.forEach(particle => particle.update(mouse));
            particles.forEach(particle => particle.draw(canvasContext));
            this.animationFrameId = requestAnimationFrame(this.warp);
        }
    };

    mouseEvent = (event: MouseEvent) => {
        this.mouse.update(event.x, event.y);
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