const LEVEL_COLORS = {
  0: '#FF0000', // Level 0 - Red
  1: '#FFA500', // Level 1 - Orange
  2: '#FFFF00', // Level 2 - Yellow
  3: '#008000', // Level 3 - Green
  4: '#0000FF', // Level 4 - Blue
};

// Define the levels for each landmark index
const LANDMARK_LEVELS = {
  0: 0, // Wrist
  1: 1,
  2: 2,
  3: 3,
  4: 4, // Thumb
  5: 1,
  6: 2,
  7: 3,
  8: 4, // Index
  9: 1,
  10: 2,
  11: 3,
  12: 4, // Middle
  13: 1,
  14: 2,
  15: 3,
  16: 4, // Ring
  17: 1,
  18: 2,
  19: 3,
  20: 4, // Pinky
};

export const drawLandmarks = (canvasRef, landmarks) => {
  if (!landmarks) {
    return;
  }
  const RADIUS = 6;
  const LINE_WIDTH = 1;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  ctx.save();
  let index = 0;
  for (const landmark of landmarks) {
    const level = LANDMARK_LEVELS[index]; // Get the level of the landmark
    const color = LEVEL_COLORS[level];
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = LINE_WIDTH;

    const circle = new Path2D();
    circle.arc(
      landmark.x * canvas.width,
      landmark.y * canvas.height,
      RADIUS,
      0,
      2 * Math.PI
    );
    ctx.fill(circle);
    ctx.stroke(circle);
    index++;
  }
  ctx.restore();
};

export const drawConnectors = (canvasRef, landmarks, connections) => {
  if (!landmarks || !connections) {
    return;
  }

  const LINE_WIDTH = 1;
  const COLOR = '#00FF00';
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  ctx.save();
  for (const connection of connections) {
    ctx.beginPath();
    const from = landmarks[connection.start];
    const to = landmarks[connection.end];
    if (from && to) {
      ctx.strokeStyle = COLOR;
      ctx.lineWidth = LINE_WIDTH;
      ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
      ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
    }
    ctx.stroke();
  }
  ctx.restore();
};
