import React from "react";
import "./CanvasComponent.css";

const getAlpha = (pixels: Uint8ClampedArray, index: number): number => {
    return pixels[index + 3];
};

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
    ease: number;
    color: string;
    originX: number;
    originY: number;
    size: number;
    vx: number;
    vy: number;
    x: number;
    y: number;
    v: number;

    constructor(color: string, size: number, ease: number, x: number, y: number, v: number) {
        this.vx = v - (Math.random() * v * 2);
        this.vy = v - (Math.random() * v * 2);
        this.originX = Math.floor(x);
        this.originY = Math.floor(y);
        this.size = Math.floor(size);
        this.color = color;
        this.ease = ease;
        this.x = x;
        this.y = y;
        this.v = v;
    }

    draw(context: CanvasRenderingContext2D | null) {
        if (context) {
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    reverse() {
        this.x += (this.originX - this.x) * this.ease;
        this.y += (this.originY - this.y) * this.ease;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
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
    reAssembleID: number | null = null;
    explosionID: number | null = null;
    mouse: Mouse = new Mouse();

    constructor(props: CanvasProps) {
        super(props);
        this.state = {};
    }

    componentDidMount(): void {
        this.initialize();
    }

    componentDidUpdate(): void {
        this.clearCanvas();
        this.drawParticles();
    }

    initialize = () => {
        const { canvasElement, canvasContext, imageElement } = this, particles: Particle[] = [], ease: number = 0.2, gap: number = 5, v: number = 33;
        let pixels: Uint8ClampedArray | null = null, color: string, alpha: number, index: number, x: number, y: number;

        if (canvasElement && canvasContext && imageElement) {
            imageElement.onload = () => {
                const shift = 0.2, stretch = 1 - (shift * 2),
                    dx = canvasElement.width * shift, dy = canvasElement.height * shift,
                    dw = canvasElement.width * stretch, dh = canvasElement.height * stretch;
                canvasContext.drawImage(imageElement, dx, dy, dw, dh);

                pixels = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height).data;

                for (x = 0; x < canvasElement.width; x += gap) {
                    for (y = 0; y < canvasElement.height; y += gap) {
                        index = (y * canvasElement.width + x) * 4;
                        color = getColor(pixels, index);
                        alpha = getAlpha(pixels, index);
                        if (alpha > 0) {
                            particles.push(new Particle(color, ease, gap, x, y, v));
                        }
                    }
                }

                this.setState({ particles: particles });
            };
        }
    }

    clearCanvas = () => {
        const { canvasElement, canvasContext } = this;
        if (canvasContext && canvasElement) {
            canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
        }
    }

    drawParticles = () => {
        const { particles } = this.state;
        if (this.canvasContext && particles) {
            particles.forEach(particle => { particle.draw(this.canvasContext); });
        }
    }

    explodeImage = () => {
        const { particles } = this.state;
        if (this.reAssembleID) {
            cancelAnimationFrame(this.reAssembleID);
            this.reAssembleID = null;
        }
        if (particles) {
            particles.forEach(particle => { particle.update(); });
            this.setState({ particles });
        }
        this.explosionID = requestAnimationFrame(this.explodeImage);
    }

    reAssembleImage = () => {
        const { particles } = this.state;
        if (this.explosionID) {
            cancelAnimationFrame(this.explosionID);
            this.explosionID = null;
        }
        if (particles) {
            particles.forEach(particle => { particle.reverse() });
            this.setState({ particles });
        }
        this.reAssembleID = requestAnimationFrame(this.reAssembleImage);
    }

    warp = () => {
        if (this.explosionID) this.reAssembleImage();
        else this.explodeImage();
    }

    mouseEvent = (event: MouseEvent) => {
        this.mouse.update(event.x, event.y);
    }

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
                        this.canvasElement.onclick = this.warp;
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