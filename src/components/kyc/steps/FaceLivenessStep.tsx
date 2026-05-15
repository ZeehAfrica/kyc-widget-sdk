import V3 from "./detection/v3";
import V5 from "./detection/v5";

export function FaceLivenessStep() {
  const version: number = 5;

  return (
    <div>
      {version === 3 && <V3 />}
      {version === 5 && <V5 />}
    </div>
  );
}
