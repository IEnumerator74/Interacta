import React, { useEffect, useRef } from "react";
import useViewportSize from "../useViewPortSize/useViewportSize";
import drawBubbles from "./drawBubbles";

const Bubbles: React.FC = () => {
  const { width, height } = useViewportSize();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (canvasRef.current && width && height) {
      // Calcola la larghezza effettiva (metà dello schermo per il div destro)
      const effectiveWidth = width / 2;
      
      // Imposta le dimensioni del canvas
      canvasRef.current.width = effectiveWidth;
      canvasRef.current.height = height;
      
      // Pulisci l'animazione precedente se esiste
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Inizializza l'animazione delle bolle
      drawBubbles(canvasRef, effectiveWidth, height);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        pointerEvents: "none"
      }}
    />
  );
};

export default Bubbles;