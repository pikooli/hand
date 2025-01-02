import { HandLandmarkerResult, Landmark } from '@mediapipe/tasks-vision';

export const detectRockGesture = (landmarks: HandLandmarkerResult) => {
    const worldLandmarks = landmarks.worldLandmarks[0];
    if (!worldLandmarks) {
      return false;
    }
    const palmCenter = worldLandmarks[0];
    const fingertips = [4, 8, 12, 16, 20];
    const FIST_THRESHOLD = 0.14;
  
    return fingertips.every((index) => {
      const fingertip = worldLandmarks[index];
  
      const distance = Math.sqrt(
        Math.pow(fingertip.x - palmCenter.x, 2) +
          Math.pow(fingertip.y - palmCenter.y, 2)+
        Math.pow(fingertip.z - palmCenter.z, 2)
      );
      return distance < FIST_THRESHOLD;
    });
  };
  
  export const detectScissorGesture = (landmarks: HandLandmarkerResult) => {
    const worldLandmarks = landmarks.worldLandmarks[0];
    if (!worldLandmarks) {
      return false;
    }
    const palmCenter = worldLandmarks[0];
  
    const fingerClosetips = [4, 16, 20];
    const fingerOpenTips = [8, 12];
    const FIST_THRESHOLD = 0.12;
    const isFingerClose = fingerClosetips.every((index) => {
      const fingertip = worldLandmarks[index];
      const distance = Math.sqrt(
        Math.pow(fingertip.x - palmCenter.x, 2) +
          Math.pow(fingertip.y - palmCenter.y, 2) +
          Math.pow(fingertip.z - palmCenter.z, 2)
      );
  
      return distance < FIST_THRESHOLD;
    });
    const isFingerOpen = fingerOpenTips.every((index) => {
      const fingertip = worldLandmarks[index];
      const distance = Math.sqrt(
        Math.pow(fingertip.x - palmCenter.x, 2) +
          Math.pow(fingertip.y - palmCenter.y, 2) +
          Math.pow(fingertip.z - palmCenter.z, 2)
      );
      return distance > FIST_THRESHOLD;
    });
    return isFingerClose && isFingerOpen;
  };
  
  export const detectPaperGesture = (worldLandmarks: Landmark[]) => {
    if (!worldLandmarks || worldLandmarks.length === 0) {
      return false;
    }
    const palmCenter = worldLandmarks[0];
  
    const fingertips = [4, 8, 12, 16, 20];
    const FIST_THRESHOLD = 0.11;
    return fingertips.every((index) => {
      const fingertip = worldLandmarks[index];
  
      const distance = Math.sqrt(
        Math.pow(fingertip.x - palmCenter.x, 2) +
          Math.pow(fingertip.y - palmCenter.y, 2) +
          Math.pow(fingertip.z - palmCenter.z, 2)
      );
      return distance > FIST_THRESHOLD;
    });
  };
  