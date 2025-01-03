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
import { GameDescription } from '@/components/GameDescription';
import { DisplayElement } from '@/components/DisplayText';
import { Footer } from '@/components/Footer';

const MUSIC_BACKGROUND = '/sounds/Midnight Echoes.mp3';

const isDebug = false;

interface GameDisplayProps {
  isGameStarted: boolean;
  level: number;
  score: number;
  onClick: () => void;
  loading: boolean;
  error: string;
}

const GameDisplay = ({
  isGameStarted,
  level,
  score,
  onClick,
  loading,
  error,
}: GameDisplayProps) => {
  if (isGameStarted) {
    return (
      <>
        <div className="absolute top-0 left-0 w-screen h-screen bg-black" />
        <div className="absolute top-0 left-0 z-30 p-5 font-bold bg-white/[.6] rounded-md text-black">
          <p>🧹 Use your hand 👋 to wipe the dirt off the screen! 🧹</p>
          <p>🎮 Level: {level + 1}</p>
          <p>🏆 Score: {score}</p>
        </div>
      </>
    );
  }
  if (error) {
    return (
      <div className="absolute top-1/2 z-30">
        <h1 className="text-2xl font-bold bg-gray-800 p-4 rounded-md">
          Error : {error}
        </h1>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="absolute top-1/2 z-30">
        <h1 className="text-2xl font-bold bg-gray-800 p-4 rounded-md">
          Loading...
        </h1>
      </div>
    );
  }
  return (
    <div className="absolute top-1/3 z-30">
      <GameDescription onClick={onClick} />
    </div>
  );
};

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const helperRef = useRef<HelperModel>(null);
  const imageRef = useRef<ImageModel>(null);
  const mediapipeRef = useRef<MediapipeModel>(null);
  const guiRef = useRef(guiObject);
  const musicRef = useRef<HTMLAudioElement>(null);
  const [landmarks, setLandmarks] = useState<HandLandmarkerResult | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [shouldShowDisplay, setShouldShowDisplay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useGuiDisplay({ guiRef, isDebug });

  const getUserMedia = useCallback(() => {
    setLoading(true);
    mediapipeRef.current
      ?.initUserMedia(() => {
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
        setIsGameStarted(true);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error accessing webcam:', err);
        setError('Error accessing webcam, please enable camera');
      });
  }, []);

  useEffect(() => {
    if (isGameStarted) {
      setShouldShowDisplay(true);
      setTimeout(() => {
        setShouldShowDisplay(false);
      }, 3000);
    }
  }, [isGameStarted, level]);

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-[url('/images/nightRoom.png')] bg-cover bg-center`}
    >
      <GameDisplay
        isGameStarted={isGameStarted}
        level={level}
        score={score}
        onClick={getUserMedia}
        loading={loading}
        error={error}
      />
      <div className="transform -scale-x-100">
        <VideoMediapipe mediapipeRef={mediapipeRef} videoRef={videoRef} />
        {isDebug && (
          <HelperComponent
            helperRef={helperRef}
            landmarks={landmarks}
            showHelper={guiRef.current.showHelper}
          />
        )}
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
      {shouldShowDisplay && (
        <DisplayElement text={`🌟 Level ${level + 1} 🌟`} />
      )}
      <Footer />
    </div>
  );
}
