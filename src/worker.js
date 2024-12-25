import { pipeline, RawImage } from '@huggingface/transformers';

let handle;

const task = 'text-classification';
const model = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';

// const task ='object-detection';
// const model ='qualcomm/MediaPipe-Hand-Detection';
    

(async () => {
  self.postMessage({ type: 'status', status: 'loading' });
  try {
    handle = await pipeline(
      task,
      model,
      { quantized: false }
    );  
    self.postMessage({ type: 'status', status: 'ready' });
    console.log('Pipeline initialized');
  } catch (error) {
    console.error('Error initializing pipeline:', error);
  }
})();

self.onmessage = (event) => {
    console.log('Message received from main thread:', event.data);
    self.postMessage({ message: 'Hello from worker!' });
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
