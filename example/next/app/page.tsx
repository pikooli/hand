'use client';
import { useRef, useEffect, useCallback } from 'react';
import {  HandLandmarker } from '@mediapipe/tasks-vision';

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

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const worker = useRef<Worker | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastVideoTimeRef = useRef(0);

  const drawElements = useCallback(async (results) => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }
    if (!results) {
      return;
    }
    if (results.length === 0) {
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
    console.log("drawElements", results);
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    for (const landmarks of results.landmarks) {
      drawLandmarks(canvasRef, landmarks);
      drawConnectors(canvasRef, landmarks,  HandLandmarker.HAND_CONNECTIONS);
    }
  
  }, []);

  useEffect(() => {
    worker.current = new Worker(new URL('./workerMediapipe.ts', import.meta.url), {
      type: 'module'
    });
    worker.current.onmessage = async (event) => {
      if (event.data.type === 'results') {
        await drawElements(event.data.results);
      }
    };
  }, [drawElements]);

  const getUserMedia = async () => {
    try {
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      
      if (videoRef.current && canvasRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', detectForVideo);
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
    }
  };

  const detectForVideo = useCallback(async () => {
    console.log('detectForVideo =========');
    if (!videoRef.current || !worker.current) {
      return;
    }

    const offscreenCanvas = document.createElement('canvas');
    const ctx = offscreenCanvas.getContext('2d');
  
    offscreenCanvas.width = videoRef.current.videoWidth;
    offscreenCanvas.height = videoRef.current.videoHeight;
    const startTimeMs = performance.now();

    if (lastVideoTimeRef.current !== videoRef.current.currentTime && ctx) {
      ctx.drawImage(videoRef.current, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
      lastVideoTimeRef.current = videoRef.current.currentTime;
      const imageData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
      worker?.current?.postMessage({ type: 'detect', imageData: imageData.data.buffer, width: offscreenCanvas.width, height: offscreenCanvas.height, timestamp: startTimeMs });
      }
    window.requestAnimationFrame(detectForVideo);
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <button onClick={getUserMedia}>Get User Media</button>
      <div className="relative transform -scale-x-100">
        <video ref={videoRef} autoPlay playsInline className="border border-red-500" />
        <canvas className="border border-green-500 absolute top-0 left-0 z-10" ref={canvasRef} />
      </div>
    </div>
  );
}
