'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { HelperModel } from '@/src/models/helperModel/helperModel';
import { ImageModel } from '@/src/models/imageModel';
import { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { VideoMediapipe } from '@/components/videoMediapipe/VideoMediapipe';
import { MediapipeModel } from '@/src/models/videoMediapipe/mediapipe';
import { HelperComponent } from '@/components/HelperComponent';
import { GameComponent } from '@/components/game/GameComponent';
import { useGuiDisplay, guiObject } from '@/components/useGuiDisplay';

const MUSIC_BACKGROUND = '/sounds/Midnight Echoes.mp3';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const helperRef = useRef<HelperModel>(null);
  const imageRef = useRef<ImageModel>(null);
  const [landmarks, setLandmarks] = useState<HandLandmarkerResult | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const mediapipeRef = useRef<MediapipeModel>(null);
  const guiRef = useRef(guiObject);
  const musicRef = useRef<HTMLAudioElement>(null);

  useGuiDisplay({ guiRef });

  const getUserMedia = useCallback(() => {
    try {
      mediapipeRef.current?.initUserMedia(() => {
        helperRef.current?.resizeCanvas(videoRef.current?.offsetWidth || 0, videoRef.current?.offsetHeight || 0);
        imageRef.current?.resizeCanvas(videoRef.current?.offsetWidth || 0, videoRef.current?.offsetHeight || 0);
        mediapipeRef.current?.onMessage(setLandmarks);
        setIsGameStarted(true);
        musicRef.current?.play();
        
      });
    } catch (err) {
      console.error('Error accessing webcam:', err);
    }
  }, []);

  useEffect(() => {
    musicRef.current!.volume = guiRef.current.volume;
  }, [guiRef.current.volume]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex gap-4">
      <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={getUserMedia}>Get User Media</button>
      <p className="text-2xl font-bold">Score: {score} Level: {level}</p>
      </div>
      <div className="relative transform -scale-x-100">
        <VideoMediapipe mediapipeRef={mediapipeRef} videoRef={videoRef}/>
        <HelperComponent helperRef={helperRef} landmarks={landmarks} showHelper={guiRef.current.showHelper}/>
        <GameComponent imageRef={imageRef} landmarks={landmarks} isGameStarted={isGameStarted} score={score} setScore={setScore} level={level} setLevel={setLevel}/>
      </div>
      <audio src={MUSIC_BACKGROUND} ref={musicRef} loop/>
    </div>
  );
}
