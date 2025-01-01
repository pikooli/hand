import { useEffect, useRef, useState } from 'react';
import { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { ImageModel } from '@/src/models/imageModel';
import { detectPaperGesture } from '@/src/gesture/rockPaperScissors';
import { LEVEL_CONFIG } from './constants';

const SOUND_WIPE = '/sounds/wipe.mp3';
const AUDIO_VOLUME = 0.9;

const createRandomPosition = () => {
  return { x: Math.random(), y: Math.random() };
};

const playSound = (sound: string) => {
  const audio = new Audio(sound);
  audio.volume = AUDIO_VOLUME;
  audio.play();
};

interface Position {
  x: number;
  y: number;
}

interface GameComponentProps {
  imageRef: React.RefObject<ImageModel | null>;
  landmarks: HandLandmarkerResult | null;
  isGameStarted: boolean;
  score: number;
  level: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
}
export const GameComponent = ({
  imageRef,
  landmarks,
  isGameStarted,
  score,
  setScore,
  level,
  setLevel,
}: GameComponentProps) => {
  const canvasGameRef = useRef<HTMLCanvasElement>(null);
  const [dirtPositions, setDirtPositions] = useState<Position[]>([]);
  const [speed, setSpeed] = useState<number>(LEVEL_CONFIG[0].speed);

  useEffect(() => {
    imageRef.current = new ImageModel(
      // @ts-expect-error canvasRef and videoRef are can be null
      canvasGameRef,
      canvasGameRef?.current?.width || 0,
      canvasGameRef?.current?.height || 0
    );
  }, [imageRef]);

  useEffect(() => {
    if (!isGameStarted) return;
    const interval = setInterval(() => {
      if (dirtPositions.length < LEVEL_CONFIG[level].maxDirt) {
        setDirtPositions((prev) => {
          return [...prev, createRandomPosition()];
        });
      }
    }, speed);
    return () => clearInterval(interval);
  }, [dirtPositions, isGameStarted, speed, level]);

  useEffect(() => {
    if (score > LEVEL_CONFIG[level].score && level < LEVEL_CONFIG.length - 1) {
      setLevel((prev) => prev + 1);
      setSpeed(LEVEL_CONFIG[level + 1].speed);
    }
  }, [score, level, setLevel]);

  useEffect(() => {
    if (!isGameStarted) return;
    imageRef.current?.cleanCanvas();
    if (landmarks?.landmarks) {
      const isPaperGesture = detectPaperGesture(landmarks);
      if (isPaperGesture) {
        imageRef.current?.drawRag(landmarks.landmarks[0]);
        dirtPositions.forEach((position, index) => {
          if (imageRef.current?.isRagOverDirt(position)) {
            setDirtPositions((prev) => {
              return [...prev.slice(0, index), ...prev.slice(index + 1)];
            });
            playSound(SOUND_WIPE);
            setScore((prev) => prev + 1);
          }
        });
      }
    }
    dirtPositions.forEach((position) => {
      imageRef.current?.drawDirt(position);
    });
  }, [landmarks, imageRef, dirtPositions, isGameStarted, setScore]);

  return (
    <canvas
      className="border border-blue-500 absolute top-0 left-0 z-10"
      ref={canvasGameRef}
    />
  );
};
