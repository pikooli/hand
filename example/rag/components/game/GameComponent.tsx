import { useEffect, useRef, useState, useCallback } from 'react';
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
  const [removeDirtIndex, setRemoveDirtIndex] = useState<number[]>([]);

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

  const ragLogic = useCallback(
    (landmarks: HandLandmarkerResult, index: number) => {
      imageRef.current?.drawRag(landmarks.landmarks[index]);
      const dirtIdexToRemove: number[] = [];
      dirtPositions.forEach((position, index) => {
        if (imageRef.current?.isRagOverDirt(position)) {
          dirtIdexToRemove.push(index);
          playSound(SOUND_WIPE);
          setScore((prev) => prev + 1);
        }
      });
      setRemoveDirtIndex(dirtIdexToRemove);
    },
    [imageRef, dirtPositions, setScore]
  );
  useEffect(() => {
    if (removeDirtIndex.length > 0) {
      setDirtPositions((prev) => {
        return prev.filter((_, index) => !removeDirtIndex.includes(index));
      });
    }
  }, [removeDirtIndex]);

  useEffect(() => {
    if (!isGameStarted) return;
    imageRef.current?.cleanCanvas();
    if (landmarks?.landmarks) {
      for (let i = 0; i < landmarks.landmarks.length; i++) {
        const isPaperGesture = detectPaperGesture(landmarks.worldLandmarks[i]);
        if (isPaperGesture) {
          ragLogic(landmarks, i);
          break;
        }
      }
    }
    dirtPositions.forEach((position) => {
      imageRef.current?.drawDirt(position);
    });
  }, [landmarks, imageRef, dirtPositions, isGameStarted, ragLogic]);

  return <canvas className="absolute top-0 left-0 z-10" ref={canvasGameRef} />;
};
