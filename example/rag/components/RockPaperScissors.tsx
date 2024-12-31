'use client';
import { useState , useEffect } from 'react';
import { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { detectRockGesture, detectScissorGesture,detectPaperGesture} from '@/src/gesture/rockPaperScissors';

interface RockPaperScissorsProps {
    landmarks: HandLandmarkerResult | null;
}
export const RockPaperScissors = ({landmarks}: RockPaperScissorsProps) => {
    const [gesture, setGesture] = useState<string>("");

    useEffect(() => {
        if (!landmarks) {
            return;
        }
        if (detectRockGesture(landmarks)) {
            setGesture("👊");
          } else if (detectScissorGesture(landmarks)) {
            setGesture("✌️");
          } else if (detectPaperGesture(landmarks)) {
            setGesture("👋");
          } else {
            setGesture("🤔");
          }
    }, [landmarks]);

  return <div>gesture: {gesture}</div>;
};
