import { useEffect, useRef } from 'react';
import { HelperModel } from '@/src/models/helperModel/helperModel';
import { HandLandmarkerResult } from '@mediapipe/tasks-vision';

interface HelperComponentProps {
  helperRef: React.RefObject<HelperModel | null>;
  landmarks: HandLandmarkerResult | null;
  showHelper: boolean;
}

export const HelperComponent = ({
  helperRef,
  landmarks,
  showHelper,
}: HelperComponentProps) => {
  const canvasHelperRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    helperRef.current = new HelperModel(
      // @ts-expect-error canvasRef and videoRef are can be null
      canvasHelperRef,
      canvasHelperRef?.current?.width || 0,
      canvasHelperRef?.current?.height || 0
    );
  }, [helperRef]);
  useEffect(() => {
    if (landmarks?.landmarks && showHelper) {
      helperRef.current?.drawElements(landmarks);
    }
  }, [landmarks, helperRef, showHelper]);

  return (
    <canvas
      className="border border-blue-500 absolute top-0 left-0 z-10"
      ref={canvasHelperRef}
    />
  );
};
