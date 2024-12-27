import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

let handLandmarker: HandLandmarker;

// const runningMode = 'VIDEO';
const runningMode = 'IMAGE';

(async () => {
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
  self.postMessage({ type: 'status', status: 'ready' });
})();

self.onmessage = async (event) => {
  console.log('Message received from main thread:', event.data);
  if (!handLandmarker) return;
  
  const { type, imageData, width, height, timestamp } = event.data;
  if (type === 'detect') {
    const image = new ImageData(new Uint8ClampedArray(imageData), width, height);

    const results = handLandmarker.detect(image);

    postMessage({ type: 'results', results, timestamp });
  }
};

// self.addEventListener('message', async (event) => {
//     console.log(event);
//   while (!classifier) {
//     await new Promise((resolve) => setTimeout(resolve, 50));
//   }

//   const { image } = event.data;
//   const data = new Uint8ClampedArray(image.data.length / 4);
//   for (let i = 0; i < data.length; ++i) {
//     data[i] = image.data[i * 4 + 3];
//   }
//   const img = new RawImage(data, image.width, image.height, 1);
//   const result = await handle(img);
//   self.postMessage({ type: "result" });
// });
