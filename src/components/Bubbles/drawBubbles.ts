interface Bubble {
  x: number;
  y: number;
  swaySpeed: number;
  swayAmount: number;
  bubbleSpeed: number;
  size: number;
  opacity: number;
}

const drawBubbles = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  width: number,
  height: number
): void => {
  let globalCounter = 0;
  let ctx: CanvasRenderingContext2D | null = null;
  let bubbles: Bubble[] = [];

  const drawBubble = (x: number, y: number, size: number, opacity: number): void => {
    if (!ctx) return;
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    
    // Gradient per effetto bolla
    const gradient = ctx.createRadialGradient(
      x + size * 0.3, y + size * 0.3, size * 0.1,
      x + size/2, y + size/2, size/2
    );
    gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.8})`);
    gradient.addColorStop(0.4, `rgba(255, 255, 255, ${opacity * 0.4})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, ${opacity * 0.1})`);
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Riflesso della bolla
    ctx.beginPath();
    ctx.arc(x + size * 0.3, y + size * 0.3, size * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fill();
    
    ctx.restore();
  };

  const rnd = (low: number, high: number): number => {
    return Math.random() * (high - low) + low;
  };

  const createBubble = (): void => {
    const bubbleSpeed = rnd(0.5, 2);
    const size = rnd(20, 60);
    bubbles.push({
      x: rnd(0, width - size),
      y: height + size,
      swaySpeed: rnd(50, 150),
      swayAmount: rnd(20, 50),
      bubbleSpeed,
      size,
      opacity: rnd(0.2, 0.4)
    });
  };

  const update = (): void => {
    if (!ctx || !canvasRef.current) return;
    
    ctx.clearRect(0, 0, width, height);
    globalCounter++;

    const globalSway = Math.sin(globalCounter / 100) * 30;

    bubbles = bubbles.filter(b => {
      const xPos = b.x + (Math.sin(globalCounter / b.swaySpeed) * b.swayAmount) + globalSway;
      const yPos = b.y - b.bubbleSpeed;
      
      if (yPos > -b.size) {
        drawBubble(xPos, yPos, b.size, b.opacity);
        b.y = yPos;
        return true;
      }
      return false;
    });

    while (bubbles.length < 20) {
      createBubble();
    }

    requestAnimationFrame(update);
  };

  const initApp = (): void => {
    if (!canvasRef.current) return;
    
    ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    for (let x = 0; x < 20; x++) {
      setTimeout(() => {
        createBubble();
      }, x * 200);
    }

    requestAnimationFrame(update);
  };

  initApp();
};

export default drawBubbles;