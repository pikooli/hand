import { NormalizedLandmark } from '@mediapipe/tasks-vision';

const RAG_SIZE = 300;
const DIRT_SIZE = 100;

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
    { x: Math.random(), y: Math.random() },
  ];

  constructor(canvasRef: React.RefObject<HTMLCanvasElement>) {
    this.canvasRef = canvasRef;
    this.canvasCtx = this.canvasRef.current?.getContext('2d');
    this.canvasWidth = this.canvasRef.current?.width ?? 0;
    this.canvasHeight = this.canvasRef.current?.height ?? 0;
    this.ragImage = new Image();
    this.ragImage.src = '/rag.png';
    this.dirtImage = new Image();
    this.dirtImage.src = '/dirt.png';
    this.ragImage.onload = () => {
      console.log('Rag image loaded');
    };
    this.dirtImage.onload = () => {
      console.log('Dirt image loaded');
    };
  }

  drawRag = (landmarks: NormalizedLandmark[]) => {
    if (!landmarks || !this.canvasCtx) return;
    const x =
      ((landmarks[9].x + landmarks[0].x) / 2) * this.canvasWidth - RAG_SIZE / 2;
    const y =
      ((landmarks[9].y + landmarks[0].y) / 2) * this.canvasHeight - RAG_SIZE / 2;
    const z = landmarks[0].z;
    console.log('z=', z);
    this.canvasCtx.drawImage(this.ragImage, x, y, RAG_SIZE, RAG_SIZE);
    };

  drawDirt = (landmarks: NormalizedLandmark[]) => {
    if (!landmarks || !this.canvasCtx) return;

    this.dirtPositions.forEach((position) => {
      const x = position.x * this.canvasWidth;
      const y = position.y * this.canvasHeight;
      this.canvasCtx.drawImage(this.dirtImage, x, y, DIRT_SIZE, DIRT_SIZE);
    });
  };
}
