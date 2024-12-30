import { NormalizedLandmark } from '@mediapipe/tasks-vision';

const RAG_SIZE = 300;
const DIRT_SIZE = 100;
const IMAGERAG = '/rag.png';
const IMAGEDIRT = '/dirt.png';

export class ImageModel {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasCtx: CanvasRenderingContext2D | null = null;
  ragImage: HTMLImageElement;
  dirtImage: HTMLImageElement;
  canvasWidth: number;
  canvasHeight: number;
  dirtPositions = [
    { x: Math.random(), y: Math.random() },
    { x: Math.random(), y: Math.random() },
    { x: Math.random(), y: Math.random() },
  ];

  constructor(canvasRef: React.RefObject<HTMLCanvasElement>, canvasWidth: number, canvasHeight: number) {
    this.canvasRef = canvasRef;
    this.canvasCtx = this.canvasRef.current?.getContext('2d');
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.ragImage = new Image();
    this.ragImage.src = IMAGERAG;
    this.dirtImage = new Image();
    this.dirtImage.src = IMAGEDIRT;
    this.ragImage.onload = () => {
      console.log('Rag image loaded');
    };
    this.dirtImage.onload = () => {
      console.log('Dirt image loaded');
    };
    this.resizeCanvas(canvasWidth, canvasHeight);
  }

  resizeCanvas = (width: number, height: number) => {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.canvasRef.current.style.setProperty('width', `${this.canvasWidth}px`);
    this.canvasRef.current.style.setProperty(
      'height',
      `${this.canvasHeight}px`
    );
    this.canvasRef.current.width = this.canvasWidth;
    this.canvasRef.current.height = this.canvasHeight;

    this.canvasCtx = this.canvasRef.current.getContext('2d');
  };

  cleanCanvas = () => {
    if (!this.canvasCtx) return;
    this.canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  };

  drawRag = (landmarks: NormalizedLandmark[]) => {
    if (!landmarks || !this.canvasCtx) return;
    const x =
      ((landmarks[9].x + landmarks[0].x) / 2) * this.canvasWidth - RAG_SIZE / 2;
    const y =
      ((landmarks[9].y + landmarks[0].y) / 2) * this.canvasHeight - RAG_SIZE / 2;
    this.canvasCtx.drawImage(this.ragImage, x, y, RAG_SIZE, RAG_SIZE);
    };

  drawDirt = (position: { x: number; y: number }) => {
    if (!this.canvasCtx) return;
    const x = position.x * this.canvasWidth -position.x * DIRT_SIZE;
    const y = position.y * this.canvasHeight -position.y * DIRT_SIZE;
    this.canvasCtx.drawImage(this.dirtImage, x, y, DIRT_SIZE, DIRT_SIZE);
    // this.dirtPositions.forEach((position) => {
    //   const x = position.x * this.canvasWidth - DIRT_SIZE / 2;
    //   const y = position.y * this.canvasHeight - DIRT_SIZE / 2;
    //   this.canvasCtx.drawImage(this.dirtImage, x, y, DIRT_SIZE, DIRT_SIZE);
    // });
  };
}
