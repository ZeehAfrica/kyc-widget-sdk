"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";
import { base64ToImage } from "@/utils/image";
import { useIdentityStore } from "@/store/identityStore";
import { useZeehClient } from "@/contexts/ZeehClientContext";
import {
  isFaceCentered,
  isMouthOpen,
  isSmiling,
  loadFaceApiModels,
  takeMirroredVideoSnapshot,
} from "@/liveness/faceGeometry";
import { useFrameCounter } from "@/liveness/useFrameCounter";

type LivenessPhase =
  | "center"
  | "smile"
  | "openMouth"
  | "capture"
  | "upload"
  | "done";

interface IdentityLivenessStepProps {
  sessionToken: string;
  onComplete: () => void;
}

export function IdentityLivenessStep({
  sessionToken,
  onComplete,
}: IdentityLivenessStepProps) {
  const client = useZeehClient();
  const { setImageUrl } = useIdentityStore();
  const [phase, setPhase] = useState<LivenessPhase>("center");
  const [localError, setLocalError] = useState<string | null>(null);
  const [faceCenteredCount, setFaceCenteredCount] = useFrameCounter(20);
  const [smileCount, setSmileCount, resetSmile] = useFrameCounter(15);
  const [mouthOpenCount, setMouthOpenCount, resetMouthOpen] =
    useFrameCounter(15);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [, setIsUploading] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const displayError = localError;

  const loadModels = async () => {
    try {
      await loadFaceApiModels();
      setIsModelLoaded(true);
      setIsModelLoading(false);
    } catch (err) {
      console.error("Model load error:", err);
      setLocalError("Failed to load models. Please refresh.");
      setIsModelLoading(false);
    }
  };

  useEffect(() => {
    void loadModels();
  }, []);

  useEffect(() => {
    if (!isModelLoaded) return;

    const startVideo = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        });
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadeddata = () => setIsVideoReady(true);
        }
      } catch {
        setLocalError("Failed to access webcam. Please allow camera access.");
      }
    };

    void startVideo();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [isModelLoaded]);

  const takeSnapshot = async (): Promise<string> => {
    const video = videoRef.current;
    if (!video || !streamRef.current) throw new Error("Video not ready");
    return takeMirroredVideoSnapshot(video, 640, 480, 0.8);
  };

  const uploadSnapshot = async (imageDataUrl: string) => {
    try {
      setIsUploading(true);
      setPhase("upload");
      const file = base64ToImage(imageDataUrl, "snapshot.jpeg");
      const result = await client.uploadIdentityLivenessSnapshot(
        sessionToken,
        file,
      );
      setImageUrl(result.imageUrl);
      setPhase("done");
      onComplete();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to upload snapshot";
      setLocalError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (
      !isModelLoaded ||
      !videoRef.current ||
      !canvasRef.current ||
      !isVideoReady ||
      phase === "capture" ||
      phase === "upload" ||
      phase === "done"
    )
      return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 140;

    const interval = setInterval(async () => {
      if (!video || video.readyState !== 4) return;

      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(10, 25, 47, 0.8)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      if (!detections) {
        setIsFaceDetected(false);
        setFaceCenteredCount(false);
        resetSmile();
        resetMouthOpen();
        return;
      }

      setIsFaceDetected(true);
      const landmarks = detections.landmarks;
      const centered = isFaceCentered(landmarks, centerX, centerY, 70);

      if (phase === "center") {
        setFaceCenteredCount(centered);
        if (faceCenteredCount >= 20) {
          setPhase("smile");
          resetSmile();
        }
      } else if (phase === "smile") {
        const smiling = centered && isSmiling(landmarks);
        setSmileCount(smiling);
        if (!centered) resetSmile();
        if (smileCount >= 15) {
          setPhase("openMouth");
          resetMouthOpen();
        }
      } else if (phase === "openMouth") {
        const open = centered && isMouthOpen(landmarks);
        setMouthOpenCount(open);
        if (!centered) resetMouthOpen();
        if (mouthOpenCount >= 15) {
          setPhase("capture");
          clearInterval(interval);
          takeSnapshot()
            .then(uploadSnapshot)
            .catch((e: unknown) =>
              setLocalError(
                e instanceof Error ? e.message : "Capture failed",
              ),
            );
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [
    isModelLoaded,
    isVideoReady,
    phase,
    faceCenteredCount,
    smileCount,
    mouthOpenCount,
    client,
    sessionToken,
    setImageUrl,
    onComplete,
    setFaceCenteredCount,
    resetSmile,
    resetMouthOpen,
    setSmileCount,
    setMouthOpenCount,
  ]);

  const getPrompt = () => {
    switch (phase) {
      case "center":
        return isFaceDetected
          ? `Center your face (${Math.round((faceCenteredCount / 20) * 100)}%)`
          : "Center your face in the oval";
      case "smile":
        return `Smile (${Math.round((smileCount / 15) * 100)}%)`;
      case "openMouth":
        return `Open your mouth (${Math.round((mouthOpenCount / 15) * 100)}%)`;
      case "upload":
        return "Uploading...";
      case "done":
        return "Verification complete";
      default:
        return "Processing...";
    }
  };

  const isLoading = isModelLoading || !isModelLoaded;

  return (
    <Card className="relative overflow-hidden border rounded-xl">
      <CardContent className="p-4 sm:p-5">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 rounded-lg z-10">
            <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
            <p className="mt-2 text-gray-200">Loading verification models...</p>
          </div>
        )}

        <div className="relative mx-auto w-full aspect-[4/3] max-w-[640px]">
          {phase === "done" ? (
            <div className="w-full h-full rounded-lg flex flex-col items-center justify-center gap-4">
              <CheckCircle2 className="h-12 w-12 text-green-400" />
              <p className="text-gray-200 text-lg font-semibold">
                Verification complete
              </p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full rounded-lg object-cover transform scale-x-[-1]"
                width={640}
                height={480}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full transform scale-x-[-1]"
                width={640}
                height={480}
              />
              {isVideoReady && phase !== "upload" && (
                <div className="absolute top-4 left-0 right-0 text-center">
                  <p className="text-lg font-semibold text-white bg-black/70 px-4 py-2 rounded-full inline-block">
                    {getPrompt()}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {(displayError || phase === "done") && (
          <Alert
            variant={displayError ? "destructive" : "default"}
            className={`mt-4 ${phase === "done" ? "border-green-500/50 bg-green-950/30" : ""}`}
          >
            {displayError ? (
              <>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{displayError}</AlertDescription>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <AlertTitle className="text-green-300">Success</AlertTitle>
                <AlertDescription>
                  Liveness verification complete. Proceeding to final
                  verification...
                </AlertDescription>
              </>
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
