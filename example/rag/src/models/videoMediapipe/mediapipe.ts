import { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { MESSAGE_TYPE } from './constant';

export class MediapipeModel {
  videoRef: React.RefObject<HTMLVideoElement>;
  worker: Worker;
  lastVideoTimeRef = 0;
  isInitialized = false;

  constructor(
    videoRef: React.RefObject<HTMLVideoElement>,
  ) {
    this.videoRef = videoRef;
    this.worker = new Worker(new URL('./workerMediapipe.ts', import.meta.url), {
      type: 'module',
    });
    this.worker.onmessage = (event) => {
      if (event.data.type === MESSAGE_TYPE.STATUS) {
        if (event.data.results === 'ready') {
        }
        else {
          throw new Error(event.data.results);
        }
      }
    };
  }

  onMessage = (updateResults: (results: HandLandmarkerResult) => void) =>{
    this.worker.onmessage = async (
      event: MessageEvent<{
        type: string;
        results: HandLandmarkerResult;
        status: string;
      }>
    ) => {
      updateResults(event.data.results);
    };
  }

  initUserMedia = async (callback?: () => void) => {
    try {
      if (this.isInitialized) {
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
        },
      });

      if (this.videoRef.current) {
        this.videoRef.current.srcObject = stream;
        this.videoRef.current.addEventListener('loadeddata', () => {
          this.detectForVideo();
          callback?.();
          console.log('====== initUserMedia');
        });
      }
      this.isInitialized = true;
    } catch (err) {
      console.error('Error accessing webcam:', err);
      throw new Error('Error accessing webcam');
    }
  };

  detectForVideo = async () => {
    if (!this.videoRef.current || !this.worker) {
      return;
    }

    const offscreenCanvas = document.createElement('canvas');
    const ctx = offscreenCanvas.getContext('2d');
    const width = this.videoRef.current.videoWidth;
    const height = this.videoRef.current.videoHeight;
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const startTimeMs = performance.now();

    if (this.lastVideoTimeRef !== this.videoRef.current.currentTime && ctx) {
      this.lastVideoTimeRef = this.videoRef.current.currentTime;
      ctx.drawImage(
        this.videoRef.current,
        0,
        0,
        width,
        height
      );
      const imageData = ctx.getImageData(
        0,
        0,
        width,
        height
      );
      this.worker.postMessage(
        {
          type: MESSAGE_TYPE.DETECT,
          imageData: imageData.data.buffer,
          width,
          height,
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
