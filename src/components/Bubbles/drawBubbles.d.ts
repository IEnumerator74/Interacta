import { RefObject } from 'react';

declare function drawBubbles(
  canvasRef: RefObject<HTMLCanvasElement>,
  width: number,
  height: number
): void;

export default drawBubbles;