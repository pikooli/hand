import { useRef, useEffect } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { drawLandmarks, drawConnectors } from './utils';


let runningMode = 'VIDEO';
let handLandmarker;
const constraints = {
  video: true,
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
