'use client';
import { useRef, useEffect } from 'react';
import { MediapipeModel } from './mediapipe/mediapipe';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediapipeModel = useRef<MediapipeModel | null>(null);

  useEffect(() => {
    if (canvasRef.current && videoRef.current) {
      // @ts-expect-error canvasRef and videoRef are can be null
      mediapipeModel.current = new MediapipeModel(canvasRef, videoRef);
    }
    return () => {
      mediapipeModel.current?.destroy();
    };
  }, []);

  const getUserMedia = async () => {
    try {
      mediapipeModel.current?.initUserMedia();
    } catch (err) {
      console.error('Error accessing webcam:', err);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <button onClick={getUserMedia}>Get User Media</button>
      <div className="relative transform -scale-x-100">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="border border-red-500"
        />
        <canvas
          className="border border-green-500 absolute top-0 left-0 z-10"
          ref={canvasRef}
        />
      </div>
    </div>
  );
}
