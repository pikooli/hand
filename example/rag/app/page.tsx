'use client';
import { useRef, useState, useCallback } from 'react';
import { HelperModel } from '@/src/models/helperModel/helperModel';
import { ImageModel } from '@/src/models/imageModel';
import { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { VideoMediapipe } from '@/components/videoMediapipe/VideoMediapipe';
import { MediapipeModel } from '@/src/models/videoMediapipe/mediapipe';
import { HelperComponent } from '@/components/HelperComponent';
import { GameComponent } from '@/components/game/GameComponent';
import { useGuiDisplay, guiObject } from '@/components/useGuiDisplay';
import { GameDescription } from '@/components/GameDescription';
const MUSIC_BACKGROUND = '/sounds/Midnight Echoes.mp3';

const isDebug =false;

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

  useGuiDisplay({ guiRef , isDebug});

  const getUserMedia = useCallback(() => {
    setIsGameStarted(true);
    try {
      mediapipeRef.current?.initUserMedia(() => {
        helperRef.current?.resizeCanvas(
          videoRef.current?.offsetWidth || 0,
          videoRef.current?.offsetHeight || 0
        );
        imageRef.current?.resizeCanvas(
          videoRef.current?.offsetWidth || 0,
          videoRef.current?.offsetHeight || 0
        );
        mediapipeRef.current?.onMessage(setLandmarks);
        musicRef.current!.volume = guiRef.current.volume;
        musicRef.current?.play();
      });
    } catch (err) {
      console.error('Error accessing webcam:', err);
    }
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-[url('/images/nightRoom.png')] bg-cover bg-center`}>
      {isGameStarted && <div className="absolute top-0 left-0 w-full h-full bg-black" />}
        {isGameStarted ? (
          <div className="absolute top-0 left-0 z-30 p-5  font-bold bg-black/[.6] rounded-md">
            <p>Use your hand 👋 to wipe the dust off the screen.</p>
            <p> Level: {level}</p>
            <p>
              Score: {score}
          </p>
          </div>
        ) : (
          <div className=" z-30">
            <GameDescription onClick={getUserMedia} />
          </div>
        )}
      <div className="absolute top-0 left-0 transform -scale-x-100 w-full h-full">
        <VideoMediapipe mediapipeRef={mediapipeRef} videoRef={videoRef} />
        {isDebug && <HelperComponent helperRef={helperRef} landmarks={landmarks} showHelper={guiRef.current.showHelper}/>}
        <GameComponent
          imageRef={imageRef}
          landmarks={landmarks}
          isGameStarted={isGameStarted}
          score={score}
          setScore={setScore}
          level={level}
          setLevel={setLevel}
        />
      </div>
      <audio src={MUSIC_BACKGROUND} ref={musicRef} loop />
      
    </div>
  );
}
