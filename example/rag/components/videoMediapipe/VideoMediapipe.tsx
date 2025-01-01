import { useEffect } from 'react';
import { MediapipeModel } from '@/src/models/videoMediapipe/mediapipe';

interface VideoMediapipeProps {
  mediapipeRef: React.RefObject<MediapipeModel | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}
export const VideoMediapipe = ({
  mediapipeRef,
  videoRef,
}: VideoMediapipeProps) => {
  useEffect(() => {
    if (videoRef.current) {
      // @ts-expect-error videoRef can be null
      mediapipeRef.current = new MediapipeModel(videoRef);
    }

    return () => {
      mediapipeRef.current?.destroy();
    };
  }, [mediapipeRef, videoRef]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full h-full"
    />
  );
};
