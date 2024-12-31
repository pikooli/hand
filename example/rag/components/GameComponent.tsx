import { useEffect, useRef } from 'react';
import { ImageModel } from '@/src/models/imageModel';

interface GameComponentProps {
  imageRef: React.RefObject<ImageModel| null>;
}

export const GameComponent = ({ imageRef }: GameComponentProps) => {
  const canvasGameRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    imageRef.current = new ImageModel(
        // @ts-expect-error canvasRef and videoRef are can be null
      canvasGameRef,
      canvasGameRef?.current?.width || 0,
      canvasGameRef?.current?.height || 0
    );
  }, [imageRef]);

  return (
    <canvas
      className="border border-blue-500 absolute top-0 left-0 z-10"
      ref={canvasGameRef}
    />
  );
};
