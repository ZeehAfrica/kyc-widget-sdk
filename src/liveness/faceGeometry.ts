import type { FaceLandmarks68 } from "face-api.js";

export function isFaceCentered(
  landmarks: FaceLandmarks68,
  centerX: number,
  centerY: number,
  radius = 70,
): boolean {
  const nose = landmarks.positions[30];
  const distance = Math.hypot(nose.x - centerX, nose.y - centerY);
  return distance < radius;
}

export function isSmiling(landmarks: FaceLandmarks68): boolean {
  const left = landmarks.positions[48];
  const right = landmarks.positions[54];
  const upper = landmarks.positions[51];
  const lower = landmarks.positions[57];
  const mouthWidth = Math.hypot(right.x - left.x, right.y - left.y);
  const mouthHeight = Math.hypot(
    (upper.x + landmarks.positions[62].x) / 2 -
      (lower.x + landmarks.positions[66].x) / 2,
    (upper.y + landmarks.positions[62].y) / 2 -
      (lower.y + landmarks.positions[66].y) / 2,
  );
  return (
    mouthWidth > 25 &&
    mouthHeight > 3 &&
    mouthWidth / (mouthHeight || 1) > 4
  );
}

export function isMouthOpen(landmarks: FaceLandmarks68): boolean {
  const upper = landmarks.positions[62];
  const lower = landmarks.positions[66];
  const vertical = Math.hypot(lower.x - upper.x, lower.y - upper.y);
  return vertical > 8;
}

/** Default CDN for TinyFaceDetector + FaceLandmark68Net (face-api.js compatible). */
export const DEFAULT_FACE_API_MODEL_URI =
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";

export async function loadFaceApiModels(
  modelUri: string = DEFAULT_FACE_API_MODEL_URI,
): Promise<void> {
  const faceapi = await import("face-api.js");
  await faceapi.nets.tinyFaceDetector.loadFromUri(modelUri);
  await faceapi.nets.faceLandmark68Net.loadFromUri(modelUri);
}

export function takeMirroredVideoSnapshot(
  video: HTMLVideoElement,
  width = 640,
  height = 480,
  quality = 0.8,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.scale(-1, 1);
  ctx.drawImage(video, -width, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}
