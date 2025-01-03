import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { MESSAGE_TYPE } from './constant';

let handLandmarker: HandLandmarker;

const runningMode = 'VIDEO';
// const runningMode = 'IMAGE';

(async () => {
  try {
    console.log('loading handLandmarker');
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
  );
  console.log('vision loaded');
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: 'GPU',
    },
    runningMode: runningMode,
    numHands: 2,
  });
  console.log('handLandmarker loaded', handLandmarker);
  self.postMessage({ type: MESSAGE_TYPE.STATUS, results: 'ready' });
  } catch (error) {
    console.error('Error loading handLandmarker:', error);
    self.postMessage({ type: MESSAGE_TYPE.STATUS, results: 'A error happen on initializing handLandmarker' });
  }
})();

self.onmessage = async (event) => {
  if (!handLandmarker) return;
  
  const { type, imageData, width, height, timestamp } = event.data;
  if (type === MESSAGE_TYPE.DETECT) {
    const image = new ImageData(new Uint8ClampedArray(imageData), width, height);

    const results = handLandmarker.detectForVideo(image, timestamp);

    self.postMessage({ type: MESSAGE_TYPE.RESULTS, results, timestamp });
  }
};

