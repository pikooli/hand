import { useEffect, useRef } from 'react';
import { HelperModel } from '@/src/models/helperModel/helperModel';

interface HelperComponentProps {
  helperRef: React.RefObject<HelperModel| null>;
}

export const HelperComponent = ({ helperRef }: HelperComponentProps) => {
  const canvasHelperRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    helperRef.current = new HelperModel(
        // @ts-expect-error canvasRef and videoRef are can be null
      canvasHelperRef,
      canvasHelperRef?.current?.width || 0,
      canvasHelperRef?.current?.height || 0
    );
  }, [helperRef]);

  return (
    <canvas
      className="border border-blue-500 absolute top-0 left-0 z-10"
      ref={canvasHelperRef}
    />
  );
};
