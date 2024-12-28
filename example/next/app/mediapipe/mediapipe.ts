import {
  HandLandmarker,
  HandLandmarkerResult,
  NormalizedLandmark,
} from '@mediapipe/tasks-vision';
import {
  LEVEL_COLORS,
  LANDMARK_LEVELS,
  COLOR_CONNECTOR,
  LINE_CONNECTOR_WIDTH,
  MESSAGE_TYPE,
} from './constant';

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
  };

  drawElements = async (results: HandLandmarkerResult) => {
    if (!this.canvasRef.current || !this.canvasCtx) {
      return;
    }
    this.canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    for (const landmarks of results.landmarks) {
      this.drawLandmarkHelper(landmarks);
    }
  };

  drawHands = (landmarks: NormalizedLandmark[]) => {
    if (!landmarks || !this.canvasCtx) {
      return;
    }

    this.canvasCtx.save();
    this.canvasCtx.strokeStyle = COLOR_CONNECTOR;
    this.canvasCtx.fillStyle = '#ffdbac'; // Skin tone color
    this.canvasCtx.lineWidth = 1; // Increased line width

    // Draw palm area with more natural curves
    this.canvasCtx.beginPath();
    const palmPoints = [0, 1, 5, 9, 13, 17]; // Wrist and base of fingers
    this.canvasCtx.moveTo(
      landmarks[0].x * this.canvasWidth,
      landmarks[0].y * this.canvasHeight
    );

    // Create curved palm using bezier curves
    for (let i = 0; i < palmPoints.length; i++) {
      const current = landmarks[palmPoints[i]];
      const next = landmarks[palmPoints[(i + 1) % palmPoints.length]];

      const cp1x = current.x * this.canvasWidth + 15; // Control point offset
      const cp1y = current.y * this.canvasHeight + 15;

      this.canvasCtx.quadraticCurveTo(
        cp1x,
        cp1y,
        next.x * this.canvasWidth,
        next.y * this.canvasHeight
      );
    }
    this.canvasCtx.closePath();
    this.canvasCtx.fill();
    this.canvasCtx.stroke();

    // Draw thicker fingers with rounded edges
    const fingers = [
      [1, 2, 3, 4], // Thumb
      [5, 6, 7, 8], // Index
      [9, 10, 11, 12], // Middle
      [13, 14, 15, 16], // Ring
      [17, 18, 19, 20], // Pinky
    ];

    for (const finger of fingers) {
      // Draw the main finger shape
      this.canvasCtx.beginPath();
      const startPoint = landmarks[finger[0]];
      const fingerWidth = 20; // Increased finger width

      this.canvasCtx.moveTo(
        startPoint.x * this.canvasWidth - fingerWidth / 2,
        startPoint.y * this.canvasHeight
      );

      // Draw one side of the finger
      for (let i = 1; i < finger.length; i++) {
        const currentPoint = landmarks[finger[i]];
        const prevPoint = landmarks[finger[i - 1]];

        // Calculate control points for natural curve
        const cpx = ((prevPoint.x + currentPoint.x) * this.canvasWidth) / 2;
        const cpy = ((prevPoint.y + currentPoint.y) * this.canvasHeight) / 2;

        this.canvasCtx.quadraticCurveTo(
          cpx - fingerWidth / 2,
          cpy,
          currentPoint.x * this.canvasWidth - fingerWidth / 3,
          currentPoint.y * this.canvasHeight
        );
      }

      // Draw the other side back
      for (let i = finger.length - 1; i >= 0; i--) {
        const currentPoint = landmarks[finger[i]];
        const nextPoint = landmarks[finger[Math.max(0, i - 1)]];

        const cpx = ((currentPoint.x + nextPoint.x) * this.canvasWidth) / 2;
        const cpy = ((currentPoint.y + nextPoint.y) * this.canvasHeight) / 2;

        this.canvasCtx.quadraticCurveTo(
          cpx + fingerWidth / 2,
          cpy,
          nextPoint.x * this.canvasWidth + fingerWidth / 2,
          nextPoint.y * this.canvasHeight
        );
      }

      this.canvasCtx.closePath();
      this.canvasCtx.fill();
      this.canvasCtx.stroke();
    }

    // Draw finger joints
    for (const landmark of landmarks) {
      this.canvasCtx.beginPath();
      this.canvasCtx.arc(
        landmark.x * this.canvasWidth,
        landmark.y * this.canvasHeight,
        3,
        0,
        2 * Math.PI
      );
      this.canvasCtx.fill();
      this.canvasCtx.stroke();
    }

    this.canvasCtx.restore();
  };

  drawLandmarkHelper = (landmarks: NormalizedLandmark[]) => {
    this.drawLandmark(landmarks);
    this.drawLandmarkName(landmarks);
    this.drawConnectors(landmarks);
  };

  drawLandmarkName = (landmarks: NormalizedLandmark[]) => {
    if (!this.canvasCtx) return;
    this.canvasCtx.save();
    this.canvasCtx.scale(-1, 1);
    this.canvasCtx.translate(-this.canvasWidth, 0);
    this.canvasCtx.fillStyle = '#000000';
    this.canvasCtx.font = '12px Arial';

    landmarks.forEach((landmark, index) => {
      const x = this.canvasWidth - landmark.x * this.canvasWidth;
      const y = landmark.y * this.canvasHeight;

      this.canvasCtx!.fillText(
        index.toString(),
        x + 5, // Offset text slightly from point
        y + 5
      );
    });

    this.canvasCtx.restore();
  };

  drawLandmark = (landmarks: NormalizedLandmark[]) => {
    if (!landmarks || !this.canvasCtx) {
      return;
    }
    const RADIUS = 6;
    const LINE_WIDTH = 1;
    this.canvasCtx.save();
    this.canvasCtx.lineWidth = LINE_WIDTH;
    let index = 0;
    for (const landmark of landmarks) {
      const level = LANDMARK_LEVELS[index]; // Get the level of the landmark
      const color = LEVEL_COLORS[level];
      this.canvasCtx.fillStyle = color;
      this.canvasCtx.strokeStyle = color;

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

    this.canvasCtx.save();
    this.canvasCtx.strokeStyle = COLOR_CONNECTOR;
    this.canvasCtx.lineWidth = LINE_CONNECTOR_WIDTH;
    for (const connection of HandLandmarker.HAND_CONNECTIONS) {
      this.canvasCtx.beginPath();
      const from = landmarks[connection.start];
      const to = landmarks[connection.end];
      if (from && to) {
        this.canvasCtx.moveTo(
          from.x * this.canvasWidth,
          from.y * this.canvasHeight
        );
        this.canvasCtx.lineTo(
          to.x * this.canvasWidth,
          to.y * this.canvasHeight
        );
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
