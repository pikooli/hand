import { useRef, useEffect } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const LEVEL_COLORS = {
  0: "#FF0000", // Level 0 - Red
  1: "#FFA500", // Level 1 - Orange
  2: "#FFFF00", // Level 2 - Yellow
  3: "#008000", // Level 3 - Green
  4: "#0000FF", // Level 4 - Blue
};

// Define the levels for each landmark index
const LANDMARK_LEVELS = {
  0: 0, // Wrist
  1: 1, 2: 2, 3: 3, 4: 4, // Thumb
  5: 1, 6: 2, 7: 3, 8: 4, // Index
  9: 1, 10: 2, 11: 3, 12: 4, // Middle
  13: 1, 14: 2, 15: 3, 16: 4, // Ring
  17: 1, 18: 2, 19: 3, 20: 4, // Pinky
};



let runningMode = 'VIDEO';
let handLandmarker;
const constraints = {
  video: true,
};

const drawLandmarks = (canvasRef, landmarks) => {
  if (!landmarks) {
    return;
  }
  const RADIUS = 6;
  const LINE_WIDTH = 1;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  ctx.save();
  let index = 0;
  for (const landmark of landmarks) {
    const level = LANDMARK_LEVELS[index]; // Get the level of the landmark
    const color = LEVEL_COLORS[level];
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = LINE_WIDTH;

    const circle = new Path2D();
    circle.arc(
      landmark.x * canvas.width,
      landmark.y * canvas.height,
      RADIUS,
      0,
      2 * Math.PI
    );
    ctx.fill(circle);
    ctx.stroke(circle);
    index++;
  }
  ctx.restore();
};

const drawConnectors = (canvasRef, landmarks, connections) => {
  if (!landmarks || !connections) {
    return;
  }

  const LINE_WIDTH = 1;
  const COLOR = '#00FF00';
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  ctx.save();
  for (const connection of connections) {
    ctx.beginPath();
    const from = landmarks[connection.start];
    const to = landmarks[connection.end];
    if (from && to) {
      ctx.strokeStyle = COLOR;
      ctx.lineWidth = LINE_WIDTH;
      ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
      ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
    }
    ctx.stroke();
  }
  ctx.restore();
};

const createHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: 'GPU',
    },
    runningMode: runningMode,
    numHands: 2,
  });
  console.log('handLandmarker running');
};

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  let lastVideoTime = 0;
  let results;

  useEffect(() => {
    createHandLandmarker();
  }, []);

  async function getUserMedia() {
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener('loadeddata', predictWebcam);
    });
  }

  async function predictWebcam() {
    if (!handLandmarker) {
      console.log('HandLandmarker is not ready yet.');
      return;
    }
    canvasRef.current.style.setProperty(
      'width',
      `${videoRef.current.videoWidth}px`
    );
    canvasRef.current.style.setProperty(
      'height',
      `${videoRef.current.videoHeight}px`
    );
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    let startTimeMs = performance.now();
    if (lastVideoTime !== videoRef.current.currentTime) {
      lastVideoTime = videoRef.current.currentTime;
      results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);
    }
    const canvasCtx = canvasRef.current.getContext('2d');

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasCtx.width, canvasCtx.height);
    if (results && results.landmarks) {
      for (const landmarks of results.landmarks) {
        drawLandmarks(canvasRef, landmarks);
        drawConnectors(canvasRef, landmarks, HandLandmarker.HAND_CONNECTIONS);
      }
    }
    canvasCtx.restore();
    window.requestAnimationFrame(predictWebcam);
  }


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <button
        className="bg-blue-500 text-white p-2 rounded-md"
        onClick={getUserMedia}
      >
        Get User Media
      </button>
      <div className="relative border-red-500">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="border-2 border-blue-500 transform -scale-x-100"
        />
        <canvas
          className="absolute top-0 left-0 border-2 border-green-500 transform -scale-x-100"
          ref={canvasRef}
        />
      </div>
    </div>
  );
}
