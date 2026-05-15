import { useEffect, useRef, useReducer, useState } from "react";
import * as faceapi from "face-api.js";
import * as tf from "@tensorflow/tfjs-core";
import { StepCard } from "../../shared/StepCard";
import { useKycStore } from "@/store/kycStore";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Initialize TensorFlow.js
const initializeTfjs = async () => {
  await tf.setBackend("webgl").catch(() => tf.setBackend("cpu"));
  await tf.ready();
  console.debug("TensorFlow.js initialized");
};

// Types
interface State {
  progress: number;
  error: string | null;
  isLivenessComplete: boolean;
  isFaceCentered: boolean;
  isTiltDetected: boolean;
  prompt: string;
}

type Action =
  | { type: "SET_PROGRESS"; progress: number }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_CENTERED"; centered: boolean }
  | { type: "SET_TILT" }
  | { type: "COMPLETE_LIVENESS" }
  | { type: "RESET" };

// Constants
const VIDEO_SIZE = { width: 320, height: 240 };
const MAX_FRAMES = 300; // ~10s at 30fps
const DETECTION_INTERVAL = 3;
const CENTER_THRESHOLD = 35;
const TILT_THRESHOLD = 4;

// Detection helpers
const isFaceCentered = (
  landmarks: faceapi.FaceLandmarks68,
  canvasWidth: number,
  canvasHeight: number,
): boolean => {
  const nose = landmarks.positions[30];
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const distance = Math.hypot(nose.x - centerX, nose.y - centerY);
  console.debug(`Nose position: (${nose.x}, ${nose.y}), Distance: ${distance}`);
  return distance < CENTER_THRESHOLD;
};

const isHeadTilted = (landmarks: faceapi.FaceLandmarks68): boolean => {
  const leftEye = landmarks.positions[36];
  const rightEye = landmarks.positions[45];
  const tilt = Math.abs(leftEye.y - rightEye.y);
  console.debug(`Eye Y-diff: ${tilt}`);
  return tilt > TILT_THRESHOLD;
};

// State reducer
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_PROGRESS":
      return { ...state, progress: action.progress };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SET_CENTERED":
      return {
        ...state,
        isFaceCentered: action.centered,
        prompt: action.centered
          ? "Tilt your head slightly"
          : "Center your face",
      };
    case "SET_TILT":
      return { ...state, isTiltDetected: true };
    case "COMPLETE_LIVENESS":
      return { ...state, isLivenessComplete: true, error: null };
    case "RESET":
      return {
        progress: 0,
        error: null,
        isLivenessComplete: false,
        isFaceCentered: false,
        isTiltDetected: false,
        prompt: "Center your face",
      };
    default:
      return state;
  }
};

// Component
export default function LivenessCheck() {
  const { nextStep } = useKycStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, dispatch] = useReducer(reducer, {
    progress: 0,
    error: null,
    isLivenessComplete: false,
    isFaceCentered: false,
    isTiltDetected: false,
    prompt: "Center your face",
  });
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const frameCount = useRef(0);
  const tiltFrames = useRef(0);

  // Load models
  useEffect(() => {
    console.debug("Loading models");
    const loadModels = async () => {
      try {
        await initializeTfjs();
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models");
        setIsModelLoaded(true);
        setIsModelLoading(false);
        console.debug("Models loaded successfully");
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          error: "Failed to load models. Please refresh.",
        });
        setIsModelLoading(false);
        console.error("Model load error:", err);
      }
    };
    loadModels();
  }, []);

  // Start webcam
  useEffect(() => {
    if (!isModelLoaded) return;

    console.debug("Starting webcam");
    const startVideo = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: VIDEO_SIZE,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch((err) => {
              dispatch({
                type: "SET_ERROR",
                error: "Failed to start video. Please allow camera access.",
              });
              console.error("Video play error:", err);
            });
          };
          setStream(mediaStream);
          console.debug("Webcam started");
        }
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          error:
            "Failed to access webcam. Please ensure camera permissions are granted.",
        });
        console.error("Webcam error:", err);
      }
    };
    startVideo();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
        console.debug("Webcam stopped");
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isModelLoaded]);

  // Detection and circle loop
  useEffect(() => {
    if (
      !isModelLoaded ||
      !videoRef.current ||
      !canvasRef.current ||
      state.isLivenessComplete
    )
      return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      dispatch({
        type: "SET_ERROR",
        error: "Canvas unavailable. Please refresh.",
      });
      console.error("Canvas context not available");
      return;
    }

    canvas.width = VIDEO_SIZE.width;
    canvas.height = VIDEO_SIZE.height;

    const draw = async () => {
      frameCount.current++;
      console.debug("Frame:", frameCount.current);

      // Draw circle
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, Math.PI * 2);
      ctx.lineWidth = 8;
      ctx.strokeStyle = state.isLivenessComplete
        ? "#22c55e"
        : state.isFaceCentered
          ? "#facc15"
          : "#ef4444";
      ctx.stroke();

      // Debug text
      ctx.fillStyle = "#fff";
      ctx.font = "14px Arial";
      ctx.fillText("Circle Active", 10, 20);

      if (frameCount.current % DETECTION_INTERVAL === 0) {
        try {
          const detections = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks(true);

          if (detections) {
            const landmarks = detections.landmarks;
            const centered = isFaceCentered(
              landmarks,
              canvas.width,
              canvas.height,
            );
            dispatch({ type: "SET_CENTERED", centered });

            if (centered && !state.isTiltDetected) {
              const tilted = isHeadTilted(landmarks);
              if (tilted) tiltFrames.current++;
              else tiltFrames.current = 0;

              if (tiltFrames.current >= 5) {
                dispatch({ type: "SET_TILT" });
                dispatch({ type: "COMPLETE_LIVENESS" });
              }
            }
          } else {
            dispatch({
              type: "SET_ERROR",
              error: "No face detected. Please align your face.",
            });
            dispatch({ type: "SET_CENTERED", centered: false });
            tiltFrames.current = 0;
          }

          dispatch({ type: "SET_PROGRESS", progress: state.progress + 1 });
          if (state.progress >= MAX_FRAMES && !state.isLivenessComplete) {
            dispatch({
              type: "SET_ERROR",
              error: "Timed out. Please try again.",
            });
          }
        } catch (err) {
          dispatch({
            type: "SET_ERROR",
            error: "Detection error. Please try again.",
          });
          console.error("Detection error:", err);
        }
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    animationFrameId.current = requestAnimationFrame(draw);
    return () => {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      console.debug("Loop cleaned up");
    };
  }, [
    isModelLoaded,
    state.isLivenessComplete,
    state.isFaceCentered,
    state.isTiltDetected,
    state.progress,
  ]);

  const onSubmit = () => {
    if (state.isLivenessComplete) nextStep();
  };

  const onReset = () => {
    dispatch({ type: "RESET" });
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    console.debug("Reset triggered");
  };

  return (
    <StepCard
      title="Face Liveness Verification"
      description="Follow the prompts to verify your identity."
      onContinue={onSubmit}
      disabled={!state.isLivenessComplete}
    >
      <div className="space-y-6">
        <Card className="relative overflow-hidden border-none bg-slate-900 shadow-lg rounded-xl">
          <CardContent className="p-4 sm:p-5">
            {isModelLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              </div>
            )}
            <div className="relative w-full aspect-[4/3]">
              {state.isLivenessComplete ? (
                <div className="w-full h-full rounded-lg bg-slate-800 flex flex-col items-center justify-center gap-4">
                  <p className="text-white text-lg font-semibold">
                    Verification Complete
                  </p>
                  <Button
                    variant="outline"
                    onClick={onReset}
                    className="text-white border-white hover:bg-slate-700"
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full rounded-lg object-cover"
                    width={VIDEO_SIZE.width}
                    height={VIDEO_SIZE.height}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full z-10"
                    style={{ opacity: 1 }}
                  />
                  <div className="absolute top-4 left-0 right-0 text-center z-20">
                    <p
                      className={cn(
                        "text-2xl font-bold text-white bg-black/80 px-6 py-3 rounded-lg animate-pulse",
                        state.isLivenessComplete && "animate-none",
                      )}
                    >
                      {state.prompt}
                      {state.isFaceCentered && !state.isTiltDetected && (
                        <>
                          <ArrowLeft className="inline-block h-6 w-6 ml-2" />
                          <ArrowRight className="inline-block h-6 w-6 ml-1" />
                        </>
                      )}
                    </p>
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 px-4 z-20">
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all duration-200"
                        style={{
                          width: `${(state.progress / MAX_FRAMES) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {state.error && (
          <Alert
            variant="destructive"
            className="animate-in fade-in border-red-400 bg-red-950/50 text-red-200"
          >
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-red-300">Error</AlertTitle>
            <AlertDescription>
              {state.error}
              <Button
                variant="link"
                onClick={onReset}
                className="ml-2 text-red-200 underline"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {state.isLivenessComplete && (
          <Alert
            variant="default"
            className="animate-in fade-in border-green-400 bg-green-950/50 text-green-200"
          >
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertTitle className="text-green-300">Success</AlertTitle>
            <AlertDescription>
              Liveness verification completed successfully!
            </AlertDescription>
          </Alert>
        )}
      </div>
    </StepCard>
  );
}
