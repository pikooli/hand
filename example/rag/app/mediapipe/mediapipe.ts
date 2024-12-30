import {
  HandLandmarkerResult,
  NormalizedLandmark,
} from '@mediapipe/tasks-vision';
import { COLOR_CONNECTOR, MESSAGE_TYPE } from './constant';
import { ImageModel } from './imageModel';
import { HelperMixinModel } from './helperMixinModel';

export class MediapipeModel {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasCtx: CanvasRenderingContext2D | null = null;
  worker: Worker;
  lastVideoTimeRef = 0;
  canvasWidth = 0;
  canvasHeight = 0;
  helperMixinModel: HelperMixinModel;

  constructor(
    canvasRef: React.RefObject<HTMLCanvasElement>,
    videoRef: React.RefObject<HTMLVideoElement>
  ) {
    this.canvasRef = canvasRef;
    this.videoRef = videoRef;
    this.worker = new Worker(new URL('./workerMediapipe.ts', import.meta.url), {
      type: 'module',
    });
    this.helperMixinModel = new HelperMixinModel(canvasRef, videoRef);
    this.worker.onmessage = async (
      event: MessageEvent<{
        type: string;
        results: HandLandmarkerResult;
        status: string;
      }>
    ) => {
      switch (event.data.type) {
        case MESSAGE_TYPE.RESULTS:
          await this.drawElements(event.data.results);
          break;
        case MESSAGE_TYPE.STATUS:
          console.log('status', event.data.status);
          break;
      }
    };
  }

  drawElements = async (results: HandLandmarkerResult) => {
    if (!this.canvasRef.current || !this.canvasCtx) {
      return;
    }
    this.canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    for (const landmarks of results.landmarks) {
      this.helperMixinModel.drawLandmarkHelper(landmarks);
      // this.drawRag(landmarks);
    }
  };

  initUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
        },
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
    this.canvasRef.current.style.setProperty('width', `${this.canvasWidth}px`);
    this.canvasRef.current.style.setProperty(
      'height',
      `${this.canvasHeight}px`
    );
    this.canvasRef.current.width = this.canvasWidth;
    this.canvasRef.current.height = this.canvasHeight;

    this.canvasCtx = this.canvasRef.current.getContext('2d');
    this.helperMixinModel.setCanvasSize(this.canvasWidth, this.canvasHeight);
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
          type: MESSAGE_TYPE.DETECT,
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
