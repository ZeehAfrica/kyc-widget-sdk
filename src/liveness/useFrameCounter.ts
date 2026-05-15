import { useState } from "react";

export function useFrameCounter(target: number) {
  const [count, setCount] = useState(0);
  return [
    count,
    (passed: boolean) => {
      if (passed) setCount((prev) => Math.min(prev + 1, target));
      else setCount(0);
    },
    () => setCount(0),
  ] as const;
}
