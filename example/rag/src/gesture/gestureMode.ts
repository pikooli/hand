import { HandLandmarkerResult } from '@mediapipe/tasks-vision';

export const detectGesture = (landmarks: HandLandmarkerResult) => {
  if (!landmarks.landmarks.length) {
    return 'no_hand';
  }

  const hand = landmarks.landmarks[0];
  // Thumb tip and IP joint
  const thumbTip = hand[4];
  const thumbIP = hand[3];

  // Other finger tips
  const indexTip = hand[8];
  const middleTip = hand[12];
  const ringTip = hand[16];
  const pinkyTip = hand[20];
  // Check if thumb is pointing up
  const isThumbUp = thumbTip.y < thumbIP.y;

  // Check if other fingers are folded (tips below their base joints)
  const isIndexFolded = indexTip.y > hand[5].y;
  const isMiddleFolded = middleTip.y > hand[9].y;
  const isRingFolded = ringTip.y > hand[13].y;
  const isPinkyFolded = pinkyTip.y > hand[17].y;

  const gesture =
    isThumbUp &&
    isIndexFolded &&
    isMiddleFolded &&
    isRingFolded &&
    isPinkyFolded
      ? 'thumbs_up'
      : 'other';

  return gesture;
};

