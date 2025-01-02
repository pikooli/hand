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
  ragPosition: { x: number; y: number } | null = null;
  dirtSize = DIRT_SIZE;

  constructor(
    canvasRef: React.RefObject<HTMLCanvasElement>,
    canvasWidth: number,
    canvasHeight: number
  ) {
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
    this.dirtSize = Math.max(DIRT_SIZE, this.canvasHeight * 0.2);
  };

  cleanCanvas = () => {
    if (!this.canvasCtx) return;
    this.canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  };

  drawRag = (landmarks: NormalizedLandmark[]) => {
    if (!landmarks || !this.canvasCtx) return;
    const ragAugmenter = 1.3;
    const xCoordinates = landmarks.map((lm) => lm.x * this.canvasWidth);
    const yCoordinates = landmarks.map((lm) => lm.y * this.canvasHeight);
    const minX = Math.min(...xCoordinates);
    const maxX = Math.max(...xCoordinates);
    const minY = Math.min(...yCoordinates);
    const maxY = Math.max(...yCoordinates);
    const ragSize = Math.max(maxX - minX, maxY - minY) * ragAugmenter;
    const deltaX = (landmarks[9].x - landmarks[0].x) * this.canvasWidth;
    const deltaY = (landmarks[9].y - landmarks[0].y) * this.canvasHeight;
    const angle = Math.atan2(deltaY, deltaX);

    const scaledWidth = ragSize;
    const canvasAspectRatio = this.canvasWidth / this.canvasHeight;
    const scaledHeight = ragSize / canvasAspectRatio;

    const x = ((landmarks[9].x + landmarks[0].x) / 2) * this.canvasWidth;
    const y = landmarks[9].y * this.canvasHeight;

    this.canvasCtx.save(); // Save the current state of the canvas
    this.canvasCtx.translate(x, y); // Move the canvas origin to the pivot point
    this.canvasCtx.rotate(angle); // Rotate the canvas
    this.canvasCtx.drawImage(
      this.ragImage,
      -scaledWidth / 2, // Center the rag on the pivot point
      -scaledHeight / 2,
      ragSize,
      ragSize
    );
    this.ragPosition = { x, y };
    // this.canvasCtx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    // this.canvasCtx.fillRect(-scaledWidth / 2, // Center the rag on the pivot point
    //   -scaledHeight / 2, ragSize, ragSize);
    this.canvasCtx.restore();
  };

  drawDirt = (position: { x: number; y: number }) => {
    if (!this.canvasCtx || !position) return;
    const x = position.x * this.canvasWidth - position.x * this.dirtSize;
    const y = position.y * this.canvasHeight - position.y * this.dirtSize;
    this.canvasCtx.drawImage(this.dirtImage, x, y, this.dirtSize, this.dirtSize);
    // this.canvasCtx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    // this.canvasCtx.fillRect(x, y, DIRT_SIZE, DIRT_SIZE);
  };

  isRagOverDirt = (
    dirtPosition: { x: number; y: number }
  ): boolean => {
    if (!this.ragPosition) return false;
    const dirtX =
      dirtPosition.x * this.canvasWidth - dirtPosition.x * this.dirtSize;
    const dirtY =
      dirtPosition.y * this.canvasHeight - dirtPosition.y * this.dirtSize;

    return (
      this.ragPosition.x >= dirtX &&
      this.ragPosition.x <= dirtX + this.dirtSize &&
      this.ragPosition.y >= dirtY &&
      this.ragPosition.y <= dirtY + this.dirtSize
    );
  };
}
