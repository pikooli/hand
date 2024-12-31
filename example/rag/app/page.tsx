'use client';
import { useRef, useEffect, useState } from 'react';
import GUI from 'lil-gui';
import { HelperModel } from '@/src/models/helperModel/helperModel';
import { ImageModel } from '@/src/models/imageModel';
import { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { VideoMediapipe } from '@/components/videoMediapipe/VideoMediapipe';
import { MediapipeModel } from '@/src/models/videoMediapipe/mediapipe';

const guiObject = {
  showHelper: true,
  positionDirt: {
    x: 0,
    y: 0,
    z: 0,
  }
};

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasHelperRef = useRef<HTMLCanvasElement>(null);
  const helperMixinModel = useRef<HelperModel>(null);
  const imageModel = useRef<ImageModel>(null);
  const [landmarks, setLandmarks] = useState<HandLandmarkerResult | null>(null);
  const mediapipeRef = useRef<MediapipeModel>(null);
  const guiRef = useRef(guiObject);

  useEffect(() => {
    const gui = new GUI();
    gui.add(guiRef.current, 'showHelper');
    gui.add(guiRef.current.positionDirt, 'x', 0, 1);
    gui.add(guiRef.current.positionDirt, 'y', 0, 1);
    gui.add(guiRef.current.positionDirt, 'z', 0, 1);
    return () => {
      gui.destroy();
    };
  }, []);

  useEffect(() => {
    imageModel.current?.cleanCanvas();
    if (landmarks?.landmarks) {
      if (guiRef.current.showHelper) {
        helperMixinModel.current?.drawElements(landmarks);
      }
      // imageModel.current?.drawRag(landmarks.landmarks[0]);
    }
    imageModel.current?.drawDirt(
      guiRef.current.positionDirt
    );
  }, [landmarks]);

  const getUserMedia = async () => {
    try {
      mediapipeRef.current?.initUserMedia(() => {
        helperMixinModel.current = new HelperModel(
          // @ts-expect-error canvasRef and videoRef are can be null
          canvasHelperRef,
          videoRef.current?.videoWidth || 0,
          videoRef.current?.videoHeight || 0
        );
        imageModel.current = new ImageModel(
          // @ts-expect-error canvasRef and videoRef are can be null
          canvasRef,
          videoRef.current?.videoWidth || 0,
          videoRef.current?.videoHeight || 0
        );
      });
      mediapipeRef.current?.onMessage(setLandmarks);
    } catch (err) {
      console.error('Error accessing webcam:', err);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <button onClick={getUserMedia}>Get User Media</button>
      <div className="relative transform -scale-x-100">
        <VideoMediapipe mediapipeRef={mediapipeRef} videoRef={videoRef}/>
        <canvas
          className="border border-blue-500 absolute top-0 left-0 z-10"
          ref={canvasHelperRef}
        />
        <canvas
          className="border border-green-500 absolute top-0 left-0 z-10"
          ref={canvasRef}
        />
      </div>
    </div>
  );
}
