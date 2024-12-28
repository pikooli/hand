import {
  HandLandmarker,
  HandLandmarkerResult,
  NormalizedLandmark,
} from '@mediapipe/tasks-vision';
import { LEVEL_COLORS, LANDMARK_LEVELS } from './utils';

export class MediapipeModel {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasCtx: CanvasRenderingContext2D | null = null;
  worker: Worker;
  lastVideoTimeRef = 0;
  canvasWidth = 0;
  canvasHeight = 0;

  constructor(
    canvasRef: React.RefObject<HTMLCanvasElement>,
    videoRef: React.RefObject<HTMLVideoElement>
  ) {
    this.canvasRef = canvasRef;
    this.videoRef = videoRef;
    this.worker = new Worker(new URL('./workerMediapipe.ts', import.meta.url), {
      type: 'module',
    });
    this.worker.onmessage = async (
      event: MessageEvent<{ type: string; results: HandLandmarkerResult, status: string }>
    ) => {
      switch (event.data.type) {
        case 'results':
          await this.drawElements(event.data.results);
          break;
        case 'status':
          console.log('status', event.data.status);
          break;
      }
    };
  }
  
  initUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (this.videoRef.current && this.canvasRef.current) {
        this.videoRef.current.srcObject = stream;
        this.videoRef.current.addEventListener('loadeddata', () => {
          this.resizeCanvas();
          this.detectForVideo();
        });
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
    }
  };

  resizeCanvas = () => {
    this.canvasWidth = this.videoRef.current.videoWidth;
    this.canvasHeight = this.videoRef.current.videoHeight;
    this.canvasRef.current.style.setProperty(
      'width',
      `${this.canvasWidth}px`
    );
    this.canvasRef.current.style.setProperty(
      'height',
      `${this.canvasHeight}px`
    );
    this.canvasRef.current.width = this.canvasWidth;
    this.canvasRef.current.height = this.canvasHeight;
    this.canvasCtx = this.canvasRef.current.getContext('2d');
  };

  drawElements = async (results: HandLandmarkerResult) => {
    if (!this.canvasRef.current || !this.canvasCtx) {
      return;
    }
    this.canvasCtx.clearRect(
      0,
      0,
      this.canvasWidth,
      this.canvasHeight
    );
    for (const landmarks of results.landmarks) {
      this.drawLandmarks(landmarks);
      this.drawConnectors(landmarks);
    }
  };



  drawLandmarks = (landmarks: NormalizedLandmark[]) => {
    if (!landmarks || !this.canvasCtx) {
      return;
    }
    const RADIUS = 6;
    const LINE_WIDTH = 1;
    this.canvasCtx.save();

    let index = 0;
    for (const landmark of landmarks) {
      const level = LANDMARK_LEVELS[index]; // Get the level of the landmark
      const color = LEVEL_COLORS[level];
      this.canvasCtx.fillStyle = color;
      this.canvasCtx.strokeStyle = color;
      this.canvasCtx.lineWidth = LINE_WIDTH;

      const circle = new Path2D();
      circle.arc(
        landmark.x * this.canvasWidth,
        landmark.y * this.canvasHeight,
        RADIUS,
        0,
        2 * Math.PI
      );
      this.canvasCtx.fill(circle);
      this.canvasCtx.stroke(circle);
      index++;
    }
    this.canvasCtx.restore();
  };

  drawConnectors = (landmarks: NormalizedLandmark[]) => {
    if (!landmarks || !this.canvasCtx) {
      return;
    }

    const LINE_WIDTH = 1;
    const COLOR = '#00FF00';
    this.canvasCtx.save();
    for (const connection of HandLandmarker.HAND_CONNECTIONS) {
      this.canvasCtx.beginPath();
      const from = landmarks[connection.start];
      const to = landmarks[connection.end];
      if (from && to) {
        this.canvasCtx.strokeStyle = COLOR;
        this.canvasCtx.lineWidth = LINE_WIDTH;
        this.canvasCtx.moveTo(from.x * this.canvasWidth, from.y * this.canvasHeight);
        this.canvasCtx.lineTo(to.x * this.canvasWidth, to.y * this.canvasHeight);
      }
      this.canvasCtx.stroke();
    }
    this.canvasCtx.restore();
  };

  detectForVideo = async () => {
    if (!this.videoRef.current || !this.worker) {
      return;
    }

    const offscreenCanvas = document.createElement('canvas');
    const ctx = offscreenCanvas.getContext('2d');

    offscreenCanvas.width = this.canvasWidth;
    offscreenCanvas.height = this.canvasHeight;
    const startTimeMs = performance.now();

    if (this.lastVideoTimeRef !== this.videoRef.current.currentTime && ctx) {
      this.lastVideoTimeRef = this.videoRef.current.currentTime;
      ctx.drawImage(
        this.videoRef.current,
        0,
        0,
        this.canvasWidth,
        this.canvasHeight
      );
      const imageData = ctx.getImageData(
        0,
        0,
        this.canvasWidth,
        this.canvasHeight
      );
      this.worker.postMessage(
        {
          type: 'detect',
          imageData: imageData.data.buffer,
          width: this.canvasWidth,
          height: this.canvasHeight,
          timestamp: startTimeMs,
        },
        [imageData.data.buffer]
      );
    }
    window.requestAnimationFrame(this.detectForVideo);
  };

  destroy = () => {
    this.worker.terminate();
  };
}
