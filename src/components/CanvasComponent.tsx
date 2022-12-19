import React from "react";

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
    radius: number;
    offsetX: number;
    offsetY: number;
    x: number;
    y: number;

    constructor(radius: number, offsetX: number, offsetY: number) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.radius = radius;
        this.x = 0;
        this.y = 0;
    }

    update = (x: number, y: number) => {
        this.x = x;
        this.y = y;
    }
}

class Particle {
    friction: number;
    distance: number;
    originX: number;
    originY: number;
    color: string;
    angle: number;
    force: number;
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
        this.friction = 1 - ease;
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
        this.dx = mouse.x - mouse.offsetX - this.x;
        this.dy = mouse.y - mouse.offsetY - this.y;
        this.distance = this.dx * this.dx + this.dy * this.dy;
        this.force = -mouse.radius / this.distance;

        if (this.distance < mouse.radius) {
            this.angle = Math.atan2(this.dy, this.dx);
            this.vx += this.force * Math.cos(this.angle);
            this.vy += this.force * Math.sin(this.angle);
        }

        this.x += (this.originX - this.x) * this.ease + (this.vx *= this.friction);
        this.y += (this.originY - this.y) * this.ease + (this.vy *= this.friction);
    }
}

interface CanvasProps {
    base64String: string
}

class CanvasComponent extends React.Component<CanvasProps> {
    canvasContext: CanvasRenderingContext2D | null = null;
    canvasElement: HTMLCanvasElement | null = null;
    imageElement: HTMLImageElement | null = null;
    animationFrameId: number | null = null;
    particles: Particle[] = [];
    mouse: Mouse | null = null;
    ease: number = 0.2;
    gap: number = 5;

    componentWillUnmount(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    init = () => {
        let pixels: Uint8ClampedArray | null = null, color: string, alpha: number, index: number, x: number, y: number, dx: number, dy: number, dw: number, dh: number;
        const { canvasElement, canvasContext, imageElement, particles, ease, gap } = this;
        const shift = 0.2, stretch = 1 - (shift * 2);
        if (canvasElement && canvasContext && imageElement) {
            dx = canvasElement.width * shift;
            dy = canvasElement.height * shift;
            dw = canvasElement.width * stretch;
            dh = canvasElement.height * stretch;
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
        }
        this.warp();
    };

    warp = () => {
        const { canvasElement, canvasContext, particles, mouse } = this;
        if (canvasContext && canvasElement && mouse) {
            canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
            particles.forEach(particle => particle.update(mouse));
            particles.forEach(particle => particle.draw(canvasContext));
            this.animationFrameId = requestAnimationFrame(this.warp);
        }
    };

    refBindImage = (htmlElement: HTMLImageElement) => {
        if (htmlElement) {
            this.imageElement = htmlElement;
            this.imageElement.onload = this.init;
        }
    };

    refBindCanvas = (htmlElement: HTMLCanvasElement) => {
        if (htmlElement) {
            if (htmlElement.parentElement) {
                htmlElement.width = htmlElement.parentElement.clientWidth;
                htmlElement.height = htmlElement.parentElement.clientHeight;
            }
            this.mouse = new Mouse(33000, htmlElement.offsetLeft, htmlElement.offsetTop);
            this.canvasElement = htmlElement;
            this.canvasElement.onmousemove = (event: MouseEvent) => {
                this.mouse?.update(event.x, event.y);
            };
            this.canvasContext = htmlElement.getContext('2d');
        }
    };

    render() {
        const { base64String } = this.props;

        return (
            <React.Fragment>
                <canvas
                    className="canvas-canvas"
                    ref={this.refBindCanvas}
                ></canvas>
                <img
                    alt=""
                    className="canvas-image-source"
                    src={base64String}
                    ref={this.refBindImage}
                    style={{
                        display: "none"
                    }}
                />
            </React.Fragment>
        )
    }
}

export default CanvasComponent