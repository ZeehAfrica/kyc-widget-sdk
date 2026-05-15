"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { StepCard } from "../../shared/StepCard";
import { useKycStore } from "@/store/kycStore";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useZeehClient } from "@/contexts/ZeehClientContext";
import { loadFaceApiModels } from "@/liveness/faceGeometry";
import { Loader2, CheckCircle2, Camera } from "lucide-react";
import { base64ToImage } from "@/utils/image";

export default function V1() {
  const client = useZeehClient();
  const { nextStep, sessionId, setSessionId } = useKycStore();

  // Verification states
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLivenessComplete, setIsLivenessComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Face detection states
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [faceCenteredCount, setFaceCenteredCount] = useFrameCounter(30);

  // Upload and snapshot states
  const [isUploading, setIsUploading] = useState(false);
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  // Video and model states
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  function useFrameCounter(_unused: number) {
    const [count, setCount] = useState(0);
    return [
      count,
      (isCentered: boolean) => {
        if (isCentered) setCount((prev) => prev + 1);
        else setCount(0);
      },
    ] as const;
  }

  // Initialize session with backend
  const initializeSession = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      const result = await client.getLivenessSession();
      setSessionId(result.sessionId || result.data?.sessionId);

      console.log(
        "Session initialized:",
        result.sessionId || result.data?.sessionId,
      );
    } catch (err) {
      console.error("Session initialization error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize session",
      );
    } finally {
      setIsInitializing(false);
    }
  };

  // Upload snapshot to backend
  const uploadSnapshot = async (imageDataUrl: string) => {
    if (!sessionId) {
      throw new Error("No session ID available");
    }

    try {
      const file = base64ToImage(imageDataUrl, "snapshot.jpeg");
      const result = await client.uploadLivenessSnapshot(file, sessionId);

      return {
        success: true,
        message: "Snapshot uploaded successfully",
        data: result,
      };
    } catch (err: unknown) {
      console.error("Snapshot upload error:", err);
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data &&
        typeof (err.response.data as { message?: string }).message === "string"
          ? (err.response.data as { message: string }).message
          : "Failed to upload snapshot";
      return {
        success: false,
        message,
      };
    }
  };

  const takeSnapshotImmediate = async () => {
    if (!videoRef.current || !stream) {
      console.error("Video not available for snapshot");
      setError("Video not available for snapshot");
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d")!;

      // Mirror the image horizontally to match what user sees
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, -640, 0, 640, 480);

      const image = canvas.toDataURL("image/jpeg", 0.8);

      console.log("Snapshot taken for session:", sessionId);

      setSnapshotTaken(true);
      setIsUploading(true);

      // Upload to backend
      const uploadResult = await uploadSnapshot(image);

      if (uploadResult.success) {
        // Clean up video stream after successful upload
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setStream(null);

        setIsUploading(false);

        // Proceed to next step after a brief delay
        setTimeout(() => nextStep(), 1500);
      } else {
        throw new Error(uploadResult.message);
      }
    } catch (err) {
      console.error("Error processing snapshot:", err);
      setError(
        err instanceof Error ? err.message : "Failed to process snapshot",
      );
      setIsUploading(false);
      setSnapshotTaken(false);
    }
  };

  // Handle video loaded event
  const handleVideoLoaded = () => {
    console.log("Video loaded and ready");
    setIsVideoReady(true);
  };

  // Initialize session on component mount
  useEffect(() => {
    initializeSession();
  }, []);

  // Load face detection models
  useEffect(() => {
    // const loadModels = async () => {
    //   try {
    //     const modelUri = "/models";

    //     console.log("Loading models from:", modelUri);

    //     // Load models with timeout
    //     const loadWithTimeout = (promise: Promise<any>, timeout = 30000) => {
    //       return Promise.race([
    //         promise,
    //         new Promise((_, reject) =>
    //           setTimeout(
    //             () => reject(new Error("Model loading timeout")),
    //             timeout
    //           )
    //         ),
    //       ]);
    //     };

    //     await loadWithTimeout(
    //       Promise.all([
    //         faceapi.nets.tinyFaceDetector.loadFromUri(modelUri),
    //         faceapi.nets.faceLandmark68Net.loadFromUri(modelUri),
    //       ])
    //     );

    //     setIsModelLoaded(true);
    //     setIsModelLoading(false);
    //   } catch (err) {
    //     setError("Failed to load. Please refresh.");
    //     setIsModelLoading(false);
    //     console.error("Model load error:", err);
    //   }
    // };

    const loadModels = async () => {
      try {
        await loadFaceApiModels();
        setIsModelLoaded(true);
        setIsModelLoading(false);
      } catch (err) {
        console.error("Model load error:", err);
        setError("Failed to load models. Please refresh.");
        setIsModelLoading(false);
      }
    };

    // Only load models if session is initialized
    if (sessionId && !isInitializing) {
      loadModels();
    }
  }, [sessionId, isInitializing]);

  // Start video stream
  useEffect(() => {
    if (!isModelLoaded || !sessionId) return;

    const startVideo = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          videoRef.current.onloadeddata = handleVideoLoaded;
        }
      } catch (err) {
        setError(
          "Failed to access webcam. Please ensure your camera is enabled.",
        );
        console.error("Webcam error:", err);
      }
    };

    startVideo();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };
  }, [isModelLoaded, sessionId]);

  // Face detection loop
  useEffect(() => {
    if (
      !isModelLoaded ||
      !videoRef.current ||
      !canvasRef.current ||
      !isVideoReady ||
      isLivenessComplete ||
      !sessionId
    )
      return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const displaySize = { width: 640, height: 480 };
    faceapi.matchDimensions(canvas, displaySize);

    const interval = setInterval(async () => {
      if (!video || video.readyState !== 4) return;

      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 140;

      // Draw overlay
      ctx.fillStyle = "rgba(10, 25, 47, 0.8)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      // Draw progress ring
      const progress = faceCenteredCount / 30;
      ctx.lineWidth = 8;
      ctx.strokeStyle = isFaceDetected ? "#22c55e" : "#3b82f6";
      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        radius + 8,
        -Math.PI / 2,
        -Math.PI / 2 + 2 * Math.PI * progress,
      );
      ctx.stroke();

      // Draw face detection circle
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height,
      );
      gradient.addColorStop(0, "#a5b4fc");
      gradient.addColorStop(1, "#3b82f6");
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.shadowColor = isFaceDetected
        ? "rgba(34, 197, 94, 0.4)"
        : "rgba(59, 130, 246, 0.4)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (detections) {
        const resized = faceapi.resizeResults(detections, displaySize);
        const nose = resized.landmarks.positions[30];
        const distance = Math.sqrt(
          (nose.x - centerX) ** 2 + (nose.y - centerY) ** 2,
        );
        const centered = distance < 70;

        setIsFaceDetected(centered);
        setFaceCenteredCount(centered);

        if (faceCenteredCount >= 30 && !isLivenessComplete) {
          setIsLivenessComplete(true);
          setError(null);
          takeSnapshotImmediate();
        }
      } else {
        setIsFaceDetected(false);
        setFaceCenteredCount(false);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [
    isModelLoaded,
    isVideoReady,
    isLivenessComplete,
    faceCenteredCount,
    setFaceCenteredCount,
    sessionId,
  ]);

  const getLoadingMessage = () => {
    if (isInitializing) return "Initializing session...";
    if (isModelLoading) return "Loading verification models...";
    if (isUploading) return "Uploading verification...";
    return "Loading...";
  };

  const isInitialLoading = isInitializing || (isModelLoading && !sessionId);

  return (
    <StepCard
      title="Face Liveness Verification"
      description="We'll initialize a secure session and verify your identity through live face detection."
      onContinue={() => {}}
      disabled={true}
      loading={isInitialLoading}
    >
      <div className="space-y-6">
        <Card className="relative overflow-hidden border rounded-xl">
          <CardContent className="p-4 sm:p-5">
            {isInitialLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 rounded-lg z-10">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
                  <p className="text-gray-200 font-medium text-center">
                    {getLoadingMessage()}
                  </p>
                  {isInitializing && (
                    <p className="text-gray-400 text-sm text-center">
                      Setting up secure verification session
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="relative mx-auto w-full aspect-[4/3] max-w-[640px]">
              {isLivenessComplete ? (
                <div className="w-full h-full rounded-lg flex items-center justify-center">
                  {isUploading ? (
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 animate-spin text-green-400 mx-auto mb-3" />
                      <p className="text-gray-200 text-lg font-semibold mb-1">
                        Verifying Identity
                      </p>
                      <p className="text-gray-400 text-sm">
                        Securely uploading your verification...
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
                      <p className="text-gray-200 text-lg font-semibold mb-1">
                        Verification Complete
                      </p>
                      <p className="text-gray-400 text-sm">
                        Identity successfully verified
                      </p>
                    </div>
                  )}
                </div>
              ) : sessionId ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full rounded-lg object-cover transform scale-x-[-1] shadow-inner"
                    width={640}
                    height={480}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full transform scale-x-[-1]"
                    width={640}
                    height={480}
                  />

                  {/* Show loading overlay only when video is not ready */}
                  {!isVideoReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-lg">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 text-blue-400 mx-auto mb-3 animate-spin" />
                        <p className="text-gray-300 text-lg">
                          Starting camera...
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          Please allow camera access if prompted
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Show face detection UI only when video is ready */}
                  {isVideoReady && (
                    <>
                      <div className="absolute top-4 left-0 right-0 text-center">
                        <p
                          className={`text-lg font-semibold text-white bg-black/70 px-4 py-2 rounded-full shadow-lg transition-all duration-300 inline-block ${
                            isFaceDetected
                              ? "opacity-100 scale-100"
                              : "opacity-80 scale-95 animate-pulse"
                          }`}
                        >
                          {isFaceDetected
                            ? `Hold Still (${Math.round(
                                (faceCenteredCount / 30) * 100,
                              )}%)`
                            : "Center Your Face"}
                        </p>
                      </div>
                      <div className="absolute bottom-4 left-0 right-0 text-center">
                        <p className="text-sm text-gray-300 bg-black/60 px-3 py-1 rounded-full inline-block">
                          Session: {sessionId.slice(-8)}
                        </p>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full rounded-lg flex items-center justify-center bg-gray-900/50">
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400 text-lg">Initializing...</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {isLivenessComplete && snapshotTaken && !isUploading && !error && (
          <Alert
            variant="default"
            className="animate-in fade-in border-green-500/50 bg-green-950/30 text-green-200 shadow-md"
          >
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertTitle className="text-green-300">
              Verification Successful
            </AlertTitle>
            <AlertDescription>
              Your identity has been successfully verified and uploaded
              securely.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </StepCard>
  );
}
