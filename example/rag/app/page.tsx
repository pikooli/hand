'use client';
import { useRef, useEffect, useState } from 'react';
import { HelperModel } from '@/src/models/helperModel/helperModel';
import { ImageModel } from '@/src/models/imageModel';
import { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { VideoMediapipe } from '@/components/videoMediapipe/VideoMediapipe';
import { MediapipeModel } from '@/src/models/videoMediapipe/mediapipe';
import { HelperComponent } from '@/components/HelperComponent';
import { GameComponent } from '@/components/GameComponent';
import { useGuiDisplay, guiObject } from '@/components/useGuiDisplay';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const helperRef = useRef<HelperModel>(null);
  const imageRef = useRef<ImageModel>(null);
  const [landmarks, setLandmarks] = useState<HandLandmarkerResult | null>(null);
  const mediapipeRef = useRef<MediapipeModel>(null);
  const guiRef = useRef(guiObject);
  
  useGuiDisplay({ guiRef });

  useEffect(() => {
    imageRef.current?.cleanCanvas();
    if (landmarks?.landmarks) {
      if (guiRef.current.showHelper) {
        helperRef.current?.drawElements(landmarks);
      }
      imageRef.current?.drawRag(landmarks.landmarks[0]);
      
    }
    imageRef.current?.drawDirt(
      guiRef.current.positionDirt
    );
    
  }, [landmarks]);

  const getUserMedia = async () => {
    try {
      mediapipeRef.current?.initUserMedia(() => {
        helperRef.current?.resizeCanvas(videoRef.current?.offsetWidth || 0, videoRef.current?.offsetHeight || 0);
        imageRef.current?.resizeCanvas(videoRef.current?.offsetWidth || 0, videoRef.current?.offsetHeight || 0);
      });
      mediapipeRef.current?.onMessage(setLandmarks);
    } catch (err) {
      console.error('Error accessing webcam:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <button onClick={getUserMedia}>Get User Media</button>
      <div className="relative transform -scale-x-100">
        <VideoMediapipe mediapipeRef={mediapipeRef} videoRef={videoRef}/>
        <HelperComponent helperRef={helperRef}/>
        <GameComponent imageRef={imageRef}/>
      </div>
    </div>
  );
}
