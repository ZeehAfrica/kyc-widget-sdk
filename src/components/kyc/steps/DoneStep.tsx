import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, ChevronRight, X } from "lucide-react";
import { StepCard } from "../shared/StepCard";
import {
  buildVerificationSteps,
  type VerificationStep,
} from "@/components/kyc/steps/doneStepConfig";
import { useKycStore } from "@/store/kycStore";
import { useZeehClient } from "@/contexts/ZeehClientContext";

export type DoneStepProps = {
  onComplete?: (payload: { sessionId: string }) => void;
  onError?: (message: string) => void;
};

export function DoneStep({ onComplete, onError }: DoneStepProps) {
  const client = useZeehClient();
  const { sessionId, user, goToStep, resetStore } = useKycStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [completionCheckStatus, setCompletionCheckStatus] = useState<
    "idle" | "loading" | "passed" | "failed"
  >("idle");
  const [completionCheckError, setCompletionCheckError] = useState<
    string | null
  >(null);

  const [steps, setSteps] = useState<VerificationStep[]>(() =>
    buildVerificationSteps(client, user.country),
  );

  const didCompletionSucceed = (result: any) => {
    const statusCandidates = [
      result?.status,
      result?.data?.status,
      result?.verificationStatus,
      result?.data?.verificationStatus,
    ]
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.toLowerCase());

    if (
      typeof result?.success === "boolean" ||
      typeof result?.data?.success === "boolean"
    ) {
      return Boolean(result?.success ?? result?.data?.success);
    }

    if (
      typeof result?.verified === "boolean" ||
      typeof result?.data?.verified === "boolean"
    ) {
      return Boolean(result?.verified ?? result?.data?.verified);
    }

    if (
      typeof result?.isVerified === "boolean" ||
      typeof result?.data?.isVerified === "boolean"
    ) {
      return Boolean(result?.isVerified ?? result?.data?.isVerified);
    }

    if (
      typeof result?.completed === "boolean" ||
      typeof result?.data?.completed === "boolean"
    ) {
      return Boolean(result?.completed ?? result?.data?.completed);
    }

    if (
      statusCandidates.some((status) =>
        ["success", "verified", "completed", "complete"].includes(status),
      )
    ) {
      return true;
    }

    if (
      statusCandidates.some((status) =>
        ["failed", "error", "unsuccessful", "incomplete"].includes(status),
      )
    ) {
      return false;
    }

    // Fall back to treating a successful GET as success when no explicit flag is returned.
    return true;
  };

  const finalizeVerification = async () => {
    setCompletionCheckStatus("loading");
    setCompletionCheckError(null);

    try {
      const result = await client.getCompleteVerification();

      if (didCompletionSucceed(result)) {
        setCompletionCheckStatus("passed");
      } else {
        setCompletionCheckStatus("failed");
        setCompletionCheckError(
          result?.message ||
            result?.data?.message ||
            "Verification completion check reported an unsuccessful result.",
        );
      }
    } catch (error: any) {
      setCompletionCheckStatus("failed");
      setCompletionCheckError(
        error?.response?.data?.message ||
          error?.response?.data?.errors ||
          error?.message ||
          "Unable to confirm verification completion.",
      );
    } finally {
      setCurrentStep(steps.length);
      setShowModal(true);
    }
  };

  const resetVerificationRun = () => {
    setShowModal(false);
    setCurrentStep(0);
    setCompletionCheckStatus("idle");
    setCompletionCheckError(null);
    setSteps(
      buildVerificationSteps(client, useKycStore.getState().user.country).map(
        (step) => ({
          ...step,
          status: "pending" as const,
          errorMessage: undefined,
        }),
      ),
    );
  };

  // Run verification process
  useEffect(() => {
    if (currentStep < steps.length && sessionId) {
      const runVerification = async () => {
        // Set current step to loading
        setSteps((prev) =>
          prev.map((step, index) =>
            index === currentStep ? { ...step, status: "loading" } : step,
          ),
        );

        try {
          const currentStepData = steps[currentStep];
          await currentStepData.apiCall(sessionId);

          // Success
          setSteps((prev) =>
            prev.map((step, index) =>
              index === currentStep
                ? { ...step, status: "passed", errorMessage: undefined }
                : step,
            ),
          );
        } catch (error: any) {
          // Extract error message from backend response
          const errorMessage =
            error?.response?.data?.message ||
            error?.response?.data?.errors ||
            error?.message ||
            "Verification failed. Please try again.";

          // Failure
          setSteps((prev) =>
            prev.map((step, index) =>
              index === currentStep
                ? { ...step, status: "failed", errorMessage }
                : step,
            ),
          );
        }

        // Move to next step after a brief delay
        setTimeout(() => {
          if (currentStep === steps.length - 1) {
            void finalizeVerification();
          } else {
            setCurrentStep((prev) => prev + 1);
          }
        }, 500);
      };

      runVerification();
    }
  }, [currentStep, sessionId]);

  const getStatusIcon = (status: VerificationStep["status"]) => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
      case "passed":
        return <CheckCircle2 className="h-5 w-5 text-green-400" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return (
          <div className="h-5 w-5 rounded-full border-2 border-gray-600" />
        );
    }
  };

  const getStatusColor = (status: VerificationStep["status"]) => {
    switch (status) {
      case "loading":
        return "border-blue-400/30 bg-blue-400/5";
      case "passed":
        return "border-green-400/30 bg-green-400/5";
      case "failed":
        return "border-red-400/30 bg-red-400/5";
      default:
        return "border-gray-600/30 bg-gray-800/20";
    }
  };

  const toggleExpanded = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const allPassed = steps.every((step) => step.status === "passed");
  const hasFailures =
    steps.some((step) => step.status === "failed") ||
    completionCheckStatus === "failed";
  const hasPending = steps.some((step) => step.status === "pending");
  const isVerificationComplete = currentStep >= steps.length;
  const isCompletingVerification = completionCheckStatus === "loading";
  const verificationPassed = allPassed && completionCheckStatus === "passed";

  const completionNotified = useRef(false);
  useEffect(() => {
    if (verificationPassed && sessionId && !completionNotified.current) {
      completionNotified.current = true;
      onComplete?.({ sessionId });
    }
  }, [verificationPassed, sessionId, onComplete]);

  useEffect(() => {
    if (completionCheckStatus === "failed" && completionCheckError) {
      onError?.(completionCheckError);
    }
  }, [completionCheckStatus, completionCheckError, onError]);

  return (
    <StepCard onContinue={undefined} showBackButton={false}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Session ID Error */}
        {!sessionId ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-red-400/10 border border-red-400/30 rounded-xl"
          >
            <div className="flex items-start gap-4">
              <XCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-red-200 mb-2">
                  Session Error
                </h2>
                <p className="text-red-100 text-sm mb-4">
                  No active session found. A valid session ID is required to
                  proceed with verification. Please start the KYC process again.
                </p>
                <button
                  onClick={() => {
                    goToStep("basicInfo");
                    resetStore();
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
                >
                  Return to Start
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-400 mb-2">
                Verification in Progress
              </h1>
              <p className="text-gray-900 dark:text-gray-500">
                Please wait while we verify your information
              </p>
              {isCompletingVerification && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-200">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirming your final verification status...
                </div>
              )}
            </div>

            {/* Progress Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-xl border transition-all duration-300 ${getStatusColor(
                    step.status,
                  )}`}
                >
                  {/* Step Header */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => toggleExpanded(step.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Status Icon */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                          }}
                        >
                          {getStatusIcon(step.status)}
                        </motion.div>

                        {/* Step Info */}
                        <div>
                          <h3 className="text-gray-900 dark:text-gray-400 font-semibold">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-500 text-sm">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Expand Icon */}
                      <motion.div
                        animate={{ rotate: expandedStep === step.id ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="h-5 w-5 text-gray-900 dark:text-gray-400" />
                      </motion.div>
                    </div>

                    {/* Loading Bar */}
                    {step.status === "loading" && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2 }}
                        className="mt-3 h-1 bg-blue-400 dark:bg-blue-400 rounded-full"
                      />
                    )}
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedStep === step.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-gray-700/50">
                          <div className="pt-4">
                            <p className="text-gray-900 dark:text-gray-400 text-sm leading-relaxed">
                              {step.details}
                            </p>

                            {step.status === "failed" && (
                              <div className="mt-3 p-3 bg-red-400/10 dark:bg-red-400/10 border border-red-400/20 dark:border-red-400/20 rounded-lg">
                                <p className="text-red-300 text-sm font-medium mb-1">
                                  Verification failed
                                </p>
                                <p className="text-red-200 dark:text-red-200 text-sm">
                                  {step.errorMessage ||
                                    "Please check your information and try again."}
                                </p>
                              </div>
                            )}

                            {step.status === "passed" && (
                              <div className="mt-3 p-3 bg-green-400/10 dark:bg-green-400/10 border border-green-400/20 dark:border-green-400/20 rounded-lg">
                                <p className="text-green-300 text-sm">
                                  Verification completed successfully.
                                </p>
                              </div>
                            )}

                            {step.status === "pending" && (
                              <button
                                onClick={async () => {
                                  setSteps((prev) =>
                                    prev.map((s) =>
                                      s.id === step.id
                                        ? { ...s, status: "loading" }
                                        : s,
                                    ),
                                  );

                                  try {
                                    await step.apiCall(sessionId);
                                    setSteps((prev) =>
                                      prev.map((s) =>
                                        s.id === step.id
                                          ? {
                                              ...s,
                                              status: "passed",
                                              errorMessage: undefined,
                                            }
                                          : s,
                                      ),
                                    );
                                  } catch (error: any) {
                                    const errorMessage =
                                      error?.response?.data?.message ||
                                      error?.response?.data?.errors ||
                                      error?.message ||
                                      "Verification failed. Please try again.";

                                    setSteps((prev) =>
                                      prev.map((s) =>
                                        s.id === step.id
                                          ? {
                                              ...s,
                                              status: "failed",
                                              errorMessage,
                                            }
                                          : s,
                                      ),
                                    );
                                  }
                                }}
                                className="mt-3 bg-blue-500 hover:bg-blue-600 text-white dark:text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                              >
                                Run Verification
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {completionCheckStatus === "failed" && completionCheckError && (
                <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4">
                  <p className="text-sm font-medium text-red-300 mb-1">
                    Final verification check failed
                  </p>
                  <p className="text-sm text-red-200">
                    {completionCheckError}
                  </p>
                </div>
              )}

              {hasFailures && (
                <div className="flex justify-center items-center mt-10 gap-10">
                  <button
                    className="hover:underline text-sm font-bold"
                    onClick={() => {
                      goToStep("basicInfo");
                    }}
                  >
                    Retry Verification
                  </button>
                  <button
                    className="hover:underline text-sm font-bold"
                    onClick={() => {
                      goToStep("welcome");
                      resetStore();
                    }}
                  >
                    Back home
                  </button>
                </div>
              )}

              {isVerificationComplete && hasPending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-xl"
                >
                  <p className="text-yellow-200 text-sm mb-4">
                    Some verification steps didn't run. Click below to start
                    verification again.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={resetVerificationRun}
                      className="bg-blue-500 hover:bg-blue-600 text-white dark:text-gray-900 font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
                    >
                      Start Verification
                    </button>
                    <button
                      className="hover:underline text-sm font-bold text-gray-300"
                      onClick={() => {
                        goToStep("welcome");
                        resetStore();
                      }}
                    >
                      Back home
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Modal */}
            <AnimatePresence>
              {showModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                  onClick={() => setShowModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="bg-gray-800 rounded-2xl border border-gray-700 p-6 max-w-md w-full mx-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Close Button */}
                    <button
                      onClick={() => setShowModal(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <div className="text-center">
                      {verificationPassed ? (
                        <>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: 0.2,
                              type: "spring",
                              stiffness: 200,
                              damping: 20,
                            }}
                          >
                            <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
                          </motion.div>
                          <h2 className="text-2xl font-bold text-white mb-3">
                            Verification Complete!
                          </h2>
                          <p className="text-gray-300 mb-6">
                            All verifications have been completed successfully.
                            You're now ready to proceed.
                          </p>
                          <button
                            onClick={() => setShowModal(false)}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                          >
                            Continue
                          </button>
                        </>
                      ) : (
                        <>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: 0.2,
                              type: "spring",
                              stiffness: 200,
                              damping: 20,
                            }}
                          >
                            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                          </motion.div>
                          <h2 className="text-2xl font-bold text-white mb-3">
                            Verification Issues
                          </h2>
                          <p className="text-gray-300 mb-6">
                            Some verifications failed. Please review the details
                            above and ensure your information is correct.
                          </p>
                          <div className="space-y-3">
                            <button
                              onClick={resetVerificationRun}
                              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                              Retry Verification
                            </button>
                            <button
                              onClick={() => setShowModal(false)}
                              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                              Review Details
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </StepCard>
  );
}
