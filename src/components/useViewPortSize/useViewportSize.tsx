import { useState, useEffect } from "react";
import throttle from "lodash/throttle";

interface ViewportSize {
  width: number;
  height: number;
}

const useViewportSize = (): ViewportSize => {
  const [height, setHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);

  const heightSetter = throttle((): void => {
    setHeight(window.innerHeight);
    setWidth(window.innerWidth);
  }, 500);

  useEffect(() => {
    window.addEventListener("resize", heightSetter);
    heightSetter();

    return () => {
      window.removeEventListener("resize", heightSetter);
      heightSetter.cancel(); // pulizia del throttle quando il componente viene smontato
    };
  }, [heightSetter]);

  return { width, height };
};

export default useViewportSize;