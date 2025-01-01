import { NormalizedLandmark } from '@mediapipe/tasks-vision';

const DIRT_SIZE = 100;
const IMAGERAG = '/images/rag.png';
const IMAGEDIRT = '/images/dirt.webp';

export class ImageModel {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasCtx: CanvasRenderingContext2D | null = null;
  ragImage: HTMLImageElement;
  dirtImage: HTMLImageElement;
  canvasWidth: number;
  canvasHeight: number;

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
    console.log('====== imageModel loaded');
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
    
    const xCoordinates = landmarks.map((lm) => lm.x * this.canvasWidth);
    const yCoordinates = landmarks.map((lm) => lm.y * this.canvasHeight);
    const minX = Math.min(...xCoordinates);
    const maxX = Math.max(...xCoordinates);
    const minY = Math.min(...yCoordinates);
    const maxY = Math.max(...yCoordinates);
    const ragSize = Math.max(maxX - minX, maxY - minY);
    const x =
      landmarks[9].x * this.canvasWidth - ragSize / 2;
    const y =
      landmarks[9].y * this.canvasHeight - ragSize / 2;
    this.canvasCtx.drawImage(this.ragImage, x, y, ragSize, ragSize);
    // this.canvasCtx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    // this.canvasCtx.fillRect(x, y, ragSize, ragSize);
    };

  drawDirt = (position: { x: number; y: number }) => {
    if (!this.canvasCtx || !position) return;
    const x = position.x * this.canvasWidth -position.x * DIRT_SIZE;
    const y = position.y * this.canvasHeight -position.y * DIRT_SIZE;
    this.canvasCtx.drawImage(this.dirtImage, x, y, DIRT_SIZE, DIRT_SIZE);
    // this.canvasCtx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    // this.canvasCtx.fillRect(x, y, DIRT_SIZE, DIRT_SIZE);
  };

  isRagOverDirt = (landmarks: NormalizedLandmark[], dirtPosition: { x: number; y: number }): boolean => {
    if (!landmarks) return false;

    // Calculate rag position (center point)
    const ragCenterX = landmarks[9].x * this.canvasWidth;
    const ragCenterY = landmarks[9].y * this.canvasHeight;

    // Calculate dirt position
    const dirtX = dirtPosition.x * this.canvasWidth - dirtPosition.x * DIRT_SIZE;
    const dirtY = dirtPosition.y * this.canvasHeight - dirtPosition.y * DIRT_SIZE;

    // Check if dirt center point is within rag boundaries
    return (
      ragCenterX >= dirtX &&
      ragCenterX <= dirtX + DIRT_SIZE &&
      ragCenterY >= dirtY &&
      ragCenterY <= dirtY + DIRT_SIZE
    );
  };
}
